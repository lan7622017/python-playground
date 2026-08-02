// 用户相关类型定义（前后端共享契约）

/** 注册请求 */
export interface RegisterRequest {
  /** 昵称（登录名，2-20 个字符） */
  nickname: string;
  /** 密码（至少 6 位） */
  password: string;
}

/** 登录请求 */
export interface LoginRequest {
  nickname: string;
  password: string;
}

/** 登录/注册响应 */
export interface AuthResponse {
  /** JWT 令牌 */
  token: string;
  user: UserPublic;
}

/** 用户公开信息（不含密码等敏感字段） */
export interface UserPublic {
  id: number;
  nickname: string;
  /** 总积分 */
  totalPoints: number;
  /** 当前进度（已通关的最大关卡顺序，0 表示还没通关） */
  currentLevelOrder: number;
  /** 连续打卡天数 */
  streakDays: number;
}
