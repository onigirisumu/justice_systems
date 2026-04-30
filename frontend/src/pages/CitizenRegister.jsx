import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function CitizenRegister() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Пароли не совпадают');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/citizen-register', { name: form.name, email: form.email, phone: form.phone, password: form.password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/portal');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card" style={{ width: 420 }}>
        <h1>Регистрация</h1>
        <p>Создайте личный кабинет для подачи обращений</p>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ФИО *</label>
            <input value={form.name} required onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Иванов Иван Иванович" />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input type="email" value={form.email} required onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="ваш@email.kz" />
          </div>
          <div className="form-group">
            <label>Номер телефона</label>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+7 701 000 0000" />
          </div>
          <div className="form-group">
            <label>Пароль *</label>
            <input type="password" value={form.password} required minLength={6} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Минимум 6 символов" />
          </div>
          <div className="form-group">
            <label>Повторите пароль *</label>
            <input type="password" value={form.confirm} required onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} placeholder="••••••••" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Регистрация…' : 'Зарегистрироваться'}
          </button>
        </form>
        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: '#6b7280' }}>
          Уже есть аккаунт?{' '}
          <Link to="/portal/login" style={{ color: '#2563a8', fontWeight: 600 }}>Войти</Link>
        </div>
      </div>
    </div>
  );
}
