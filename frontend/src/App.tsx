// 应用入口：Provider 装配 + 路由（懒加载页面）+ 路由守卫 + 顶部导航
import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/auth';
import { LevelsProvider } from './store/levels';
import { ThemeProvider, useTheme } from './store/theme';

// 页面懒加载（分包，减少首屏体积）
const AuthPage = lazy(() => import('./pages/AuthPage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const LevelPage = lazy(() => import('./pages/LevelPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

/** 整页加载占位 */
function PageLoading() {
  return <div className="page-loading">加载中…</div>;
}

/** 路由守卫：未登录跳转登录页 */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, restoring } = useAuth();
  if (restoring) return <PageLoading />;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

/** 已登录时访问登录页：直接进地图 */
function GuestOnly({ children }: { children: React.ReactNode }) {
  const { user, restoring } = useAuth();
  if (restoring) return <PageLoading />;
  if (user) return <Navigate to="/map" replace />;
  return <>{children}</>;
}

/** 顶部导航（仅登录后显示） */
function TopNav() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // 登出后跳回登录页
  useEffect(() => {
    if (!user) navigate('/auth', { replace: true });
  }, [user, navigate]);

  if (!user) return null;

  return (
    <header className="top-nav">
      <div className="top-nav-inner">
        <NavLink to="/map" className="brand">
          🐍 Python 闯关冒险
        </NavLink>
        <nav className="top-nav-links">
          <NavLink to="/map" className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}>
            🗺 地图
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
          >
            👤 个人中心
          </NavLink>
        </nav>
        <div className="top-nav-user">
          <span className="top-nav-points">🏆 {user.totalPoints}</span>
          <span className="top-nav-nickname">{user.nickname}</span>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className="btn btn-ghost top-nav-logout" onClick={logout}>
            退出
          </button>
        </div>
      </div>
    </header>
  );
}

/** 路由配置 */
function AppRoutes() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route
          path="/auth"
          element={
            <GuestOnly>
              <AuthPage />
            </GuestOnly>
          }
        />
        <Route
          path="/map"
          element={
            <RequireAuth>
              <MapPage />
            </RequireAuth>
          }
        />
        <Route
          path="/level/:id"
          element={
            <RequireAuth>
              <LevelPage />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/map" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <LevelsProvider>
            <TopNav />
            <main className="app-main">
              <AppRoutes />
            </main>
          </LevelsProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
