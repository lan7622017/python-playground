// 进度模块：通关提交（事务内发积分/徽章/解锁），防篡改的唯一事实来源
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import type {
  SubmitLevelRequest,
  SubmitLevelResponse,
} from 'python-playground-shared';
import { Level } from '../../entities/level.entity';
import { LevelProgress } from '../../entities/progress.entity';
import { User } from '../../entities/user.entity';
import { UserBadge } from '../../entities/user-badge.entity';
import { BADGES } from './badges.constant';

/** 每个提示扣减的积分 */
const POINTS_PER_HINT = 5;
/** 通关至少获得的积分（防止扣成负数） */
const MIN_POINTS = 5;

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(Level)
    private readonly levelRepo: Repository<Level>,
    @InjectRepository(LevelProgress)
    private readonly progressRepo: Repository<LevelProgress>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserBadge)
    private readonly userBadgeRepo: Repository<UserBadge>,
    private readonly dataSource: DataSource,
  ) {}

  /** 提交关卡结果（passed 由前端 Pyodide 判定后回传） */
  async submitLevel(
    userId: number,
    levelId: number,
    body: SubmitLevelRequest,
  ): Promise<SubmitLevelResponse> {
    const level = await this.levelRepo.findOne({ where: { id: levelId } });
    if (!level) {
      throw new NotFoundException('关卡不存在');
    }
    await this.assertUnlocked(userId, level);

    // 未通过：只累计尝试次数，不发放任何奖励
    if (!body.passed) {
      await this.countAttempt(userId, levelId);
      return {
        firstTime: false,
        pointsEarned: 0,
        badge: null,
        totalPoints: (await this.userRepo.findOne({ where: { id: userId } }))?.totalPoints ?? 0,
        nextLevelId: null,
      };
    }

    // 通过：事务内发放积分/徽章/解锁（防并发重复发放）
    return this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(LevelProgress, {
        where: { userId, levelId },
      });

      // 重复通关：不重复发奖励，仅返回当前状态
      if (existing?.completed) {
        const user = await manager.findOne(User, { where: { id: userId } });
        const next = await manager.findOne(Level, { where: { order: level.order + 1 } });
        return {
          firstTime: false,
          pointsEarned: 0,
          badge: null,
          totalPoints: user?.totalPoints ?? 0,
          nextLevelId: next?.id ?? null,
        };
      }

      // 计算积分：基础积分 - 提示扣分（最低 MIN_POINTS）
      const pointsEarned = Math.max(
        level.points - (body.hintsUsed ?? 0) * POINTS_PER_HINT,
        MIN_POINTS,
      );

      // 写入/更新进度
      if (existing) {
        existing.completed = true;
        existing.attempts += 1;
        existing.pointsEarned += pointsEarned;
        existing.completedAt = new Date();
        await manager.save(existing);
      } else {
        await manager.save(
          manager.create(LevelProgress, {
            userId,
            levelId,
            completed: true,
            attempts: 1,
            pointsEarned,
            completedAt: new Date(),
          }),
        );
      }

      // 更新用户总积分与进度
      const user = await manager.findOne(User, { where: { id: userId } });
      if (!user) {
        throw new NotFoundException('用户不存在');
      }
      user.totalPoints += pointsEarned;
      user.currentLevelOrder = Math.max(user.currentLevelOrder, level.order);
      await manager.save(user);

      // 发放徽章（首次通关该关且关卡带徽章）
      let badge = null;
      if (level.badgeId) {
        const hasBadge = await manager.findOne(UserBadge, {
          where: { userId, badgeId: level.badgeId },
        });
        if (!hasBadge) {
          await manager.save(
            manager.create(UserBadge, { userId, badgeId: level.badgeId }),
          );
          badge = BADGES[level.badgeId] ?? null;
        }
      }

      // 新解锁的下一关
      const next = await manager.findOne(Level, { where: { order: level.order + 1 } });

      return {
        firstTime: true,
        pointsEarned,
        badge,
        totalPoints: user.totalPoints,
        nextLevelId: next?.id ?? null,
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

  /** 失败提交时累计尝试次数 */
  private async countAttempt(userId: number, levelId: number): Promise<void> {
    const existing = await this.progressRepo.findOne({ where: { userId, levelId } });
    if (existing) {
      existing.attempts += 1;
      await this.progressRepo.save(existing);
    } else {
      await this.progressRepo.save(
        this.progressRepo.create({ userId, levelId, attempts: 1 }),
      );
    }
  }
}
