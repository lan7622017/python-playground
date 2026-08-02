// 进度/打卡/个人信息类型定义（前后端共享契约）
import type { Badge } from './level';
import type { UserPublic } from './user';

/** 关卡进度（个人页展示） */
export interface LevelProgress {
  levelId: number;
  /** 是否已完成 */
  completed: boolean;
  /** 尝试次数 */
  attempts: number;
  /** 累计获得积分 */
  pointsEarned: number;
  /** 完成时间（ISO 字符串，未完成则为 null） */
  completedAt: string | null;
}

/** 打卡响应 */
export interface CheckinResult {
  /** 本次打卡后的连续天数 */
  streakDays: number;
  /** 是否今天已经打过卡（重复打卡为 true） */
  alreadyCheckedIn: boolean;
}

/** 个人信息聚合（个人页展示） */
export interface ProfileData {
  user: UserPublic;
  /** 已获得的徽章列表 */
  badges: Badge[];
  /** 各关卡进度 */
  progress: LevelProgress[];
  /** 打卡日期列表（YYYY-MM-DD 格式） */
  checkinDates: string[];
  /** 今天是否已打卡 */
  todayCheckedIn: boolean;
}
