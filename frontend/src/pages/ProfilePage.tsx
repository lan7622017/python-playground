// 个人页：积分 / 徽章墙 / 打卡日历（近 30 天）+ 关卡进度列表
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProfileData } from 'python-playground-shared';
import { api } from '../api/client';
import { useAuth } from '../store/auth';

/** 生成最近 30 天日期列表（YYYY-MM-DD，今天在最后） */
function lastThirtyDays(): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    days.push(`${d.getFullYear()}-${mm}-${dd}`);
  }
  return days;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkinMsg, setCheckinMsg] = useState<string | null>(null);
  const [checkinError, setCheckinError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProfile(await api.me());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** 每日打卡 */
  const doCheckin = useCallback(async () => {
    setCheckinError(null);
    try {
      const res = await api.checkin();
      setCheckinMsg(
        res.alreadyCheckedIn
          ? '今天已经打过卡啦，明天再来吧！'
          : `打卡成功！已连续打卡 ${res.streakDays} 天 🔥`,
      );
      await load();
      await refreshUser();
    } catch (err) {
      setCheckinError(err instanceof Error ? err.message : String(err));
    }
  }, [load, refreshUser]);

  const days = useMemo(() => lastThirtyDays(), []);
  const checkinSet = useMemo(() => new Set(profile?.checkinDates ?? []), [profile]);

  return (
    <div className="page profile-page">
      {loading && <div className="levels-tip">加载中…</div>}
      {error && (
        <div className="levels-tip levels-error">
          {error} <button className="btn btn-ghost" onClick={() => void load()}>重试</button>
        </div>
      )}

      {profile && (
        <>
          {/* 用户信息卡片 */}
          <section className="profile-card">
            <div className="profile-avatar">{profile.user.nickname.slice(0, 1)}</div>
            <div className="profile-info">
              <div className="profile-name">{profile.user.nickname}</div>
              <div className="profile-subtitle">
                已通关至第 {Math.max(profile.user.currentLevelOrder, 0)} 关 · 继续加油！
              </div>
            </div>
            <div className="profile-stats">
              <div className="profile-stat">
                <div className="profile-stat-value">🏆 {profile.user.totalPoints}</div>
                <div className="profile-stat-label">总积分</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-value">🎖 {profile.badges.length}</div>
                <div className="profile-stat-label">徽章</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-value">🔥 {profile.user.streakDays}</div>
                <div className="profile-stat-label">连续打卡</div>
              </div>
            </div>
          </section>

          {/* 每日打卡 */}
          <section className="card checkin-card">
            <div className="checkin-header">
              <h2 className="section-title">📅 每日打卡</h2>
              <button
                className="btn btn-primary"
                onClick={() => void doCheckin()}
                disabled={profile.todayCheckedIn}
              >
                {profile.todayCheckedIn ? '✓ 今日已打卡' : '打卡 +1 天'}
              </button>
            </div>
            {checkinMsg && <div className="checkin-msg">{checkinMsg}</div>}
            {checkinError && <div className="checkin-msg checkin-error">{checkinError}</div>}
            <div className="checkin-calendar">
              {days.map((day) => {
                const checked = checkinSet.has(day);
                const isToday = day === days[days.length - 1];
                return (
                  <div
                    key={day}
                    className={`checkin-cell ${checked ? 'is-checked' : ''} ${isToday ? 'is-today' : ''}`}
                    title={`${day}${checked ? '：已打卡' : ''}`}
                  >
                    {checked ? '✅' : day.slice(8)}
                  </div>
                );
              })}
            </div>
            <div className="checkin-legend">
              <span>连续打卡天数越多，学习习惯越稳固 💪</span>
            </div>
          </section>

          {/* 徽章墙 */}
          <section className="card">
            <h2 className="section-title">🎖 徽章墙</h2>
            {profile.badges.length === 0 ? (
              <div className="badge-empty">还没有徽章，快去闯关解锁第一枚吧！</div>
            ) : (
              <div className="badge-wall">
                {profile.badges.map((badge) => (
                  <div key={badge.id} className="badge-item" title={badge.description}>
                    <div className="badge-icon">{badge.icon}</div>
                    <div className="badge-name">{badge.name}</div>
                    <div className="badge-desc">{badge.description}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 关卡进度 */}
          <section className="card">
            <h2 className="section-title">🗺 关卡进度</h2>
            {profile.progress.length === 0 ? (
              <div className="badge-empty">还没有开始闯关，去冒险地图看看吧！</div>
            ) : (
              <div className="progress-list">
                {profile.progress.map((p) => (
                  <button
                    key={p.levelId}
                    className="progress-item"
                    onClick={() => navigate(`/level/${p.levelId}`)}
                  >
                    <span className="progress-order">第 {p.levelId} 关</span>
                    <span className={`progress-state ${p.completed ? 'is-completed' : ''}`}>
                      {p.completed ? '✓ 已完成' : `尝试 ${p.attempts} 次`}
                    </span>
                    <span className="progress-points">
                      {p.completed ? `+${p.pointsEarned} 分` : '未通关'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>

          <button className="btn btn-ghost refresh-button" onClick={() => void load()}>
            ↻ 刷新数据
          </button>
        </>
      )}
    </div>
  );
}
