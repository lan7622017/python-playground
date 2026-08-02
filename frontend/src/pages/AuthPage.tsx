// 登录/注册页：昵称 + 密码，注册成功即登录
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../store/auth';
import { useTheme } from '../store/theme';

export default function AuthPage() {
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (nickname.trim().length < 2) {
      setError('昵称至少 2 个字符');
      return;
    }
    if (password.length < 6) {
      setError('密码至少 6 位');
      return;
    }
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(nickname.trim(), password);
      } else {
        await register(nickname.trim(), password);
      }
      // 登录成功后由路由守卫自动跳转到地图页
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(null);
  };

  return (
    <div className="auth-page">
      {/* 右上角主题切换（未登录时无顶部导航，这里单独提供） */}
      <div className="auth-theme-toggle">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
      <div className="auth-card">
        <div className="auth-logo">🐍</div>
        <h1 className="auth-title">Python 闯关冒险</h1>
        <p className="auth-subtitle">像玩游戏一样学 Python，从 0 到写出第一个分析程序</p>

        <form onSubmit={(e) => void handleSubmit(e)} className="auth-form">
          <label className="auth-label">
            昵称
            <input
              className="auth-input"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="2-20 个字符（也是登录名）"
              maxLength={20}
              autoFocus
            />
          </label>
          <label className="auth-label">
            密码
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 位"
              maxLength={50}
            />
          </label>
          {error && <div className="auth-error">⚠️ {error}</div>}
          <button className="btn btn-primary auth-submit" type="submit" disabled={submitting}>
            {submitting ? '请稍候…' : mode === 'login' ? '登录，继续冒险' : '注册，开始冒险'}
          </button>
        </form>

        <div className="auth-switch">
          {mode === 'login' ? '还没有账号？' : '已有账号？'}
          <button className="auth-switch-link" onClick={switchMode}>
            {mode === 'login' ? '去注册' : '去登录'}
          </button>
        </div>

        <div className="auth-features">
          <span>🎮 8 个剧情关卡</span>
          <span>🏆 积分 + 徽章</span>
          <span>🔥 连续打卡</span>
        </div>
      </div>
    </div>
  );
}
