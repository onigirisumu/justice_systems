import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
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
      const user = await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Министерство юстиции</h1>
        <p>Система электронного документооборота — вход для сотрудников</p>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} required
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="сотрудник@justice.gov" />
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
        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#6b7280' }}>
          Гражданин?{' '}
          <Link to="/portal/login" style={{ color: '#2563a8', fontWeight: 600 }}>
            Личный кабинет заявителя →
          </Link>
        </div>
      </div>
    </div>
  );
}
