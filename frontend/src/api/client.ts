// API 客户端：统一封装 fetch + Token 管理 + 错误处理
import type {
  AuthResponse,
  CheckinResult,
  LevelListItem,
  LoginRequest,
  ProfileData,
  RegisterRequest,
  SubmitLevelRequest,
  SubmitLevelResponse,
  ViewAnswerResponse,
} from 'python-playground-shared';

/** Token 存储键 */
const TOKEN_KEY = 'python-playground-token';

/** Token 存取（localStorage 持久化） */
export const tokenStore = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

/** 接口错误（带状态码和中文消息） */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

/** 基础请求封装 */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  const res = await fetch(`/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!res.ok) {
    let message = `请求失败（${res.status}）`;
    try {
      const data = (await res.json()) as { message?: string };
      if (data.message) message = data.message;
    } catch {
      // 响应不是 JSON，用默认消息
    }
    throw new ApiError(message, res.status);
  }
  return (await res.json()) as T;
}

/** 全部接口 */
export const api = {
  /** 注册 */
  register: (body: RegisterRequest) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  /** 登录 */
  login: (body: LoginRequest) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  /** 关卡列表（含解锁/完成状态） */
  levels: () => request<LevelListItem[]>('/levels'),
  /** 提交关卡结果 */
  submit: (levelId: number, body: SubmitLevelRequest) =>
    request<SubmitLevelResponse>(`/levels/${levelId}/submit`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  /** 查看标准答案（通关免费；未通关扣 5 积分） */
  answer: (levelId: number) =>
    request<ViewAnswerResponse>(`/levels/${levelId}/answer`, { method: 'POST' }),
  /** 每日打卡 */
  checkin: () => request<CheckinResult>('/checkins', { method: 'POST' }),
  /** 个人信息 */
  me: () => request<ProfileData>('/me'),
};
