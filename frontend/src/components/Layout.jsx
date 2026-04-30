import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_RU } from './StatusBadge';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>Министерство юстиции</h2>
          <span>Система документооборота</span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">Главная</div>
          <NavLink to="/" end className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            <span className="icon">📊</span> Аналитика
          </NavLink>
          <div className="nav-section">Модули</div>
          <NavLink to="/appeals" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            <span className="icon">📋</span> Обращения граждан
          </NavLink>
          <NavLink to="/documents" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            <span className="icon">📁</span> Внутренние документы
          </NavLink>
          <NavLink to="/appointments" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            <span className="icon">📅</span> Запись на приём
          </NavLink>
          {user?.role === 'admin' && (
            <>
              <div className="nav-section">Администрирование</div>
              <NavLink to="/users" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                <span className="icon">👥</span> Пользователи
              </NavLink>
            </>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <strong>{user?.name}</strong>
            <span>{ROLE_RU[user?.role]} · {user?.department}</span>
          </div>
          <button className="btn-logout" onClick={handleLogout}>Выйти</button>
        </div>
      </aside>
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}
