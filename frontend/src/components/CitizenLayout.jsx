import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CitizenLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/portal/login'); };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: 'var(--primary)', color: '#fff', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Министерство юстиции</span>
          <span style={{ marginLeft: 12, opacity: .7, fontSize: 13 }}>Личный кабинет заявителя</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 13 }}>
          <NavLink to="/portal" end style={({ isActive }) => ({ color: '#fff', opacity: isActive ? 1 : .75, fontWeight: isActive ? 600 : 400 })}>Мои обращения</NavLink>
          <NavLink to="/portal/new" style={({ isActive }) => ({ color: '#fff', opacity: isActive ? 1 : .75, fontWeight: isActive ? 600 : 400 })}>Подать обращение</NavLink>
          <NavLink to="/portal/appointments" style={({ isActive }) => ({ color: '#fff', opacity: isActive ? 1 : .75, fontWeight: isActive ? 600 : 400 })}>Запись на приём</NavLink>
          <Link to="/track" style={{ color: '#fff', opacity: .75 }}>Проверить статус</Link>
          <span style={{ opacity: .6 }}>|</span>
          <span style={{ opacity: .8 }}>{user?.name}</span>
          <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 14px', cursor: 'pointer', fontSize: 13 }}>Выйти</button>
        </div>
      </header>
      <main style={{ flex: 1, padding: '32px', maxWidth: 900, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </main>
      <footer style={{ background: 'var(--white)', borderTop: '1px solid var(--border)', padding: '16px 32px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
        © 2024 Министерство юстиции Республики Казахстан
      </footer>
    </div>
  );
}
