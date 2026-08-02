// 个人中心模块：聚合用户信息、徽章、进度、打卡记录
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ProfileData, UserPublic } from 'python-playground-shared';
import { User } from '../../entities/user.entity';
import { UserBadge } from '../../entities/user-badge.entity';
import { LevelProgress } from '../../entities/progress.entity';
import { BADGES } from '../progress/badges.constant';
import { CheckinsService } from '../checkins/checkins.service';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserBadge)
    private readonly userBadgeRepo: Repository<UserBadge>,
    @InjectRepository(LevelProgress)
    private readonly progressRepo: Repository<LevelProgress>,
    private readonly checkinsService: CheckinsService,
  ) {}

  /** 获取个人中心聚合数据 */
  async getProfile(userId: number): Promise<ProfileData> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 连续打卡天数（以今天为基准；今天未打卡则从昨天往前数）
    const checkinDates = await this.checkinsService.listCheckinDates(userId);
    const today = formatDate(new Date());
    const streakDays = checkinDates.includes(today)
      ? await this.checkinsService.calcStreak(userId, today)
      : await this.checkinsService.calcStreak(userId, addDaysStr(today, -1));

    const publicUser: UserPublic = {
      id: user.id,
      nickname: user.nickname,
      totalPoints: user.totalPoints,
      currentLevelOrder: user.currentLevelOrder,
      streakDays,
    };

    // 徽章列表
    const userBadges = await this.userBadgeRepo.find({ where: { userId } });
    const badges = userBadges
      .map((ub) => BADGES[ub.badgeId])
      .filter((b) => b !== undefined);

    // 关卡进度
    const progressRows = await this.progressRepo.find({ where: { userId } });
    const progress = progressRows.map((p) => ({
      levelId: p.levelId,
      completed: p.completed,
      attempts: p.attempts,
      pointsEarned: p.pointsEarned,
      completedAt: p.completedAt ? p.completedAt.toISOString() : null,
    }));

    return {
      user: publicUser,
      badges,
      progress,
      checkinDates,
      todayCheckedIn: checkinDates.includes(today),
    };
  }
}

/** 本地时间 YYYY-MM-DD */
function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 日期字符串加减天数 */
function addDaysStr(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}
