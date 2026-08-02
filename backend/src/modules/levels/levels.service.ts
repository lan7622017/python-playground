// 关卡模块：关卡列表（含解锁/完成状态）与详情、查看标准答案
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import type { LevelListItem, ViewAnswerResponse } from 'python-playground-shared';
import { Level } from '../../entities/level.entity';
import { LevelProgress } from '../../entities/progress.entity';
import { User } from '../../entities/user.entity';

/** 未通关时查看答案扣除的积分 */
const POINTS_PER_ANSWER = 5;

@Injectable()
export class LevelsService {
  constructor(
    @InjectRepository(Level)
    private readonly levelRepo: Repository<Level>,
    @InjectRepository(LevelProgress)
    private readonly progressRepo: Repository<LevelProgress>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  /** 获取全部关卡（按顺序）+ 用户解锁/完成状态 */
  async listLevels(userId: number): Promise<LevelListItem[]> {
    const levels = await this.levelRepo.find({ order: { order: 'ASC' } });
    const progress = await this.progressRepo.find({ where: { userId } });

    const completedOrders = new Set(
      progress.filter((p) => p.completed).map((p) => p.levelId),
    );
    const answerUnlockedOrders = new Set(
      progress.filter((p) => p.answerUnlocked).map((p) => p.levelId),
    );

    return levels.map((level, index) => {
      const isCompleted = completedOrders.has(level.id);
      // 第一关永远解锁；其余关卡要求前一关（按顺序排列的前一个）已完成
      const unlocked = index === 0 || completedOrders.has(levels[index - 1].id);
      return {
        id: level.id,
        order: level.order,
        chapter: level.chapter,
        title: level.title,
        story: level.story,
        contentMd: level.contentMd,
        starterCode: level.starterCode,
        testCode: level.testCode,
        hints: level.hints,
        points: level.points,
        badgeId: level.badgeId,
        unlocked,
        completed: isCompleted,
        answerUnlocked: answerUnlockedOrders.has(level.id),
      };
    });
  }

  /** 获取单关（校验解锁状态） */
  async getLevel(userId: number, levelId: number): Promise<LevelListItem> {
    const level = await this.levelRepo.findOne({ where: { id: levelId } });
    if (!level) {
      throw new NotFoundException('关卡不存在');
    }
    // 计算前一关：order - 1
    const prev = await this.levelRepo.findOne({ where: { order: level.order - 1 } });
    const prevProgress = prev
      ? await this.progressRepo.findOne({ where: { userId, levelId: prev.id } })
      : null;
    const progress = await this.progressRepo.findOne({ where: { userId, levelId } });
    const completed = progress?.completed ?? false;
    const unlocked = !prev || !!prevProgress?.completed;

    return {
      id: level.id,
      order: level.order,
      chapter: level.chapter,
      title: level.title,
      story: level.story,
      contentMd: level.contentMd,
      starterCode: level.starterCode,
      testCode: level.testCode,
      hints: level.hints,
      points: level.points,
      badgeId: level.badgeId,
      unlocked,
      completed,
      answerUnlocked: progress?.answerUnlocked ?? false,
    };
  }

  /** 查看标准答案：通关后免费；未通关首次查看扣 5 分（最低扣到 0），已解锁过则不再重复扣分 */
  async viewAnswer(userId: number, levelId: number): Promise<ViewAnswerResponse> {
    const level = await this.levelRepo.findOne({ where: { id: levelId } });
    if (!level) {
      throw new NotFoundException('关卡不存在');
    }
    await this.assertUnlocked(userId, level);

    // 已通关：免费查看
    const progress = await this.progressRepo.findOne({ where: { userId, levelId } });
    if (progress?.completed || progress?.answerUnlocked) {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      return {
        answerCode: level.answerCode,
        pointsDeducted: 0,
        totalPoints: user?.totalPoints ?? 0,
      };
    }

    // 未通关且未解锁过：事务内扣分 + 标记已解锁（防并发重复扣分）
    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, { where: { id: userId } });
      if (!user) {
        throw new NotFoundException('用户不存在');
      }
      const deducted = Math.min(POINTS_PER_ANSWER, user.totalPoints);
      user.totalPoints -= deducted;
      await manager.save(user);

      if (progress) {
        progress.answerUnlocked = true;
        await manager.save(progress);
      } else {
        await manager.save(
          manager.create(LevelProgress, { userId, levelId, answerUnlocked: true }),
        );
      }

      return {
        answerCode: level.answerCode,
        pointsDeducted: deducted,
        totalPoints: user.totalPoints,
      };
    });
  }

  /** 校验关卡是否已解锁：第一关永远解锁，否则要求前一关已通关 */
  private async assertUnlocked(userId: number, level: Level): Promise<void> {
    if (level.order === 1) return;
    const prev = await this.levelRepo.findOne({ where: { order: level.order - 1 } });
    if (!prev) {
      throw new BadRequestException('关卡数据异常');
    }
    const prevProgress = await this.progressRepo.findOne({
      where: { userId, levelId: prev.id },
    });
    if (!prevProgress?.completed) {
      throw new ForbiddenException('请先通关前一关');
    }
  }
}
