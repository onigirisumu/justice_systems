import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CitizenLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/portal');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Личный кабинет</h1>
        <p>Министерство юстиции — вход для граждан</p>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} required
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="ваш@email.kz" />
          </div>
          <div className="form-group">
            <label>Пароль</label>
            <input type="password" value={form.password} required
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Вход…' : 'Войти'}
          </button>
        </form>
        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: '#6b7280' }}>
          Нет аккаунта?{' '}
          <Link to="/portal/register" style={{ color: '#2563a8', fontWeight: 600 }}>Зарегистрироваться</Link>
        </div>
        <div style={{ marginTop: 8, textAlign: 'center', fontSize: 13, color: '#6b7280' }}>
          <Link to="/track" style={{ color: '#2563a8' }}>Проверить статус по номеру →</Link>
        </div>
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: 12, color: '#9ca3af' }}>
          <Link to="/login">Вход для сотрудников</Link>
        </div>
      </div>
    </div>
  );
}
