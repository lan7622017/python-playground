// 打卡模块：每日打卡 + 连续天数计算
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { CheckinResult } from 'python-playground-shared';
import { Checkin } from '../../entities/checkin.entity';

/** 日期工具：本地时间 YYYY-MM-DD */
function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 日期加减天数（本地时间） */
function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

@Injectable()
export class CheckinsService {
  constructor(
    @InjectRepository(Checkin)
    private readonly checkinRepo: Repository<Checkin>,
  ) {}

  /** 打卡（重复打卡幂等） */
  async checkin(userId: number): Promise<CheckinResult> {
    const today = formatDate(new Date());
    const exists = await this.checkinRepo.findOne({ where: { userId, date: today } });
    if (exists) {
      // 今天已打卡：返回当前连续天数
      return { streakDays: await this.calcStreak(userId, today), alreadyCheckedIn: true };
    }
    await this.checkinRepo.save(this.checkinRepo.create({ userId, date: today }));
    return { streakDays: await this.calcStreak(userId, today), alreadyCheckedIn: false };
  }

  /** 计算从某天起往前数连续打卡的天数 */
  async calcStreak(userId: number, fromDate: string): Promise<number> {
    let streak = 0;
    let cursor = new Date(`${fromDate}T00:00:00`);
    // 最多往前数 365 天，防止意外死循环
    for (let i = 0; i < 365; i++) {
      const dateStr = formatDate(cursor);
      const found = await this.checkinRepo.findOne({ where: { userId, date: dateStr } });
      if (!found) break;
      streak += 1;
      cursor = addDays(cursor, -1);
    }
    return streak;
  }

  /** 获取用户最近一次打卡日期（无则为 null），用于个人页展示 */
  async getLastCheckinDate(userId: number): Promise<string | null> {
    const last = await this.checkinRepo
      .createQueryBuilder('c')
      .where('c.userId = :userId', { userId })
      .orderBy('c.date', 'DESC')
      .getOne();
    return last?.date ?? null;
  }

  /** 获取用户全部打卡日期 */
  async listCheckinDates(userId: number): Promise<string[]> {
    const rows = await this.checkinRepo.find({ where: { userId } });
    return rows.map((r) => r.date).sort();
  }
}
