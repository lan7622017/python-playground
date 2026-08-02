// 关卡状态：关卡列表（含解锁/完成状态）+ 全局刷新
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { LevelListItem } from 'python-playground-shared';
import { api } from '../api/client';
import { useAuth } from './auth';

interface LevelsContextValue {
  /** 关卡列表（未加载为 null） */
  levels: LevelListItem[] | null;
  /** 是否正在拉取 */
  loading: boolean;
  /** 拉取失败信息（无则为 null） */
  error: string | null;
  /** 重新拉取关卡列表（登录/通关后调用） */
  refresh: () => Promise<void>;
}

const LevelsContext = createContext<LevelsContextValue | null>(null);

export function LevelsProvider({ children }: { children: ReactNode }) {
  const { user, restoring } = useAuth();
  const [levels, setLevels] = useState<LevelListItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setLevels(await api.levels());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // 登录后自动拉取；登出后清空
  useEffect(() => {
    if (restoring) return;
    if (user) {
      void refresh();
    } else {
      setLevels(null);
      setError(null);
    }
  }, [user, restoring, refresh]);

  const value = useMemo(
    () => ({ levels, loading, error, refresh }),
    [levels, loading, error, refresh],
  );

  return <LevelsContext.Provider value={value}>{children}</LevelsContext.Provider>;
}

/** 使用关卡状态（必须在 LevelsProvider 内） */
export function useLevels(): LevelsContextValue {
  const ctx = useContext(LevelsContext);
  if (!ctx) throw new Error('useLevels 必须在 LevelsProvider 内使用');
  return ctx;
}
