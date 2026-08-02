// 关卡地图页：剧情主线 + 进度条 + 积分/徽章总览 + 关卡卡片列表
// 空闲时后台预加载 Pyodide（解决首关 10MB 等待）
import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { engine } from '../engine/runner';
import { useAuth } from '../store/auth';
import { useLevels } from '../store/levels';
import LevelCard from '../components/LevelCard';

export default function MapPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { levels, loading, error, refresh } = useLevels();

  const stats = useMemo(() => {
    const completed = levels?.filter((l) => l.completed).length ?? 0;
    const total = levels?.length ?? 0;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percent };
  }, [levels]);

  // 页面空闲时后台预加载 Python 执行引擎（500ms 后启动，不抢占首屏渲染）
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void engine.preload().catch(() => {
        // 预加载失败不打扰用户，进入关卡页时会再次尝试并展示状态
      });
    }, 500);
    return () => window.clearTimeout(timer);
  }, []);

  const openLevel = useCallback(
    (levelId: number) => navigate(`/level/${levelId}`),
    [navigate],
  );

  return (
    <div className="page map-page">
      {/* 顶部总览卡片 */}
      <section className="hero-card">
        <div className="hero-welcome">
          <div className="hero-avatar">{user?.nickname.slice(0, 1) ?? 'P'}</div>
          <div>
            <div className="hero-hello">你好，{user?.nickname}！</div>
            <div className="hero-subtitle">产品经理小澜的 Python 冒险之旅，继续闯关吧！</div>
          </div>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">{user?.totalPoints ?? 0}</div>
            <div className="hero-stat-label">总积分</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">{stats.completed}/{stats.total}</div>
            <div className="hero-stat-label">已通关</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">🔥 {user?.streakDays ?? 0}</div>
            <div className="hero-stat-label">连续打卡</div>
          </div>
        </div>
        <div className="hero-progress">
          <div className="hero-progress-track">
            <div className="hero-progress-fill" style={{ width: `${stats.percent}%` }} />
          </div>
          <div className="hero-progress-label">
            主线进度 {stats.percent}%{stats.percent === 100 ? ' 🎉 全部通关！' : ''}
          </div>
        </div>
      </section>

      {/* 剧情主线提示 */}
      <section className="story-intro">
        <div className="story-intro-icon">🚀</div>
        <div className="story-intro-text">
          <div className="story-intro-title">剧情主线</div>
          <div className="story-intro-desc">
            你是一名刚入职「星云科技」的产品经理，面对一个个真实的工作难题——从第一次写代码统计用户数据，到用 Python 完成订单分析。每闯一关，能力值上涨，徽章收入囊中！
          </div>
        </div>
      </section>

      {/* 关卡列表 */}
      <section className="levels-section">
        <h2 className="section-title">🗺 冒险地图</h2>
        {loading && <div className="levels-tip">关卡加载中…</div>}
        {error && <div className="levels-tip levels-error">{error}（可刷新重试）</div>}
        {!loading && levels && (
          <div className="level-grid">
            {levels.map((level) => (
              <LevelCard key={level.id} level={level} onClick={() => openLevel(level.id)} />
            ))}
          </div>
        )}
      </section>

      {levels && levels.length === 0 && !loading && (
        <div className="levels-tip">还没有关卡，请先联系管理员初始化数据</div>
      )}

      <button className="btn btn-ghost refresh-button" onClick={() => void refresh()}>
        ↻ 刷新关卡状态
      </button>
    </div>
  );
}
