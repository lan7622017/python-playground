// 认证状态：token 持久化（localStorage）+ 用户信息 + 会话恢复
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthResponse, UserPublic } from 'python-playground-shared';
import { api, tokenStore } from '../api/client';

interface AuthContextValue {
  /** 当前登录用户（未登录为 null） */
  user: UserPublic | null;
  /** 是否正在恢复会话（刷新页面后自动登录的过渡态） */
  restoring: boolean;
  /** 登录 */
  login: (nickname: string, password: string) => Promise<void>;
  /** 注册（成功即登录） */
  register: (nickname: string, password: string) => Promise<void>;
  /** 退出登录 */
  logout: () => void;
  /** 重新拉取用户信息（通关/打卡后刷新积分） */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [restoring, setRestoring] = useState(true);

  // 页面加载：有 token 就拉取个人信息恢复会话
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!tokenStore.get()) {
        setRestoring(false);
        return;
      }
      try {
        const me = await api.me();
        if (!cancelled) setUser(me.user);
      } catch {
        // token 失效：清除后回到登录页
        tokenStore.clear();
      } finally {
        if (!cancelled) setRestoring(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 登录/注册成功后统一写入 token 和用户信息
  const applyAuth = useCallback((res: AuthResponse) => {
    tokenStore.set(res.token);
    setUser(res.user);
  }, []);

  const login = useCallback(
    async (nickname: string, password: string) => {
      applyAuth(await api.login({ nickname, password }));
    },
    [applyAuth],
  );

  const register = useCallback(
    async (nickname: string, password: string) => {
      applyAuth(await api.register({ nickname, password }));
    },
    [applyAuth],
  );

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  // 通关/打卡后调用：刷新积分、进度、连续天数
  const refreshUser = useCallback(async () => {
    if (!tokenStore.get()) return;
    try {
      const me = await api.me();
      setUser(me.user);
    } catch {
      // 网络异常时不打断当前页面操作
    }
  }, []);

  const value = useMemo(
    () => ({ user, restoring, login, register, logout, refreshUser }),
    [user, restoring, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** 使用认证状态（必须在 AuthProvider 内） */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth 必须在 AuthProvider 内使用');
  return ctx;
}
