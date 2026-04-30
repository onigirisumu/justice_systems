import { useEffect, useState } from 'react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

const DEPARTMENTS = ['Правовой отдел', 'Отдел ЗАГС', 'Нотариальный отдел', 'Архив', 'Отдел кадров'];
const EMPTY = { name: '', email: '', password: '', role: 'employee', department: 'Правовой отдел' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () => api.get('/auth/users').then(r => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      setForm(EMPTY);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка создания пользователя');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Пользователи системы</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Отмена' : '+ Добавить сотрудника'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ maxWidth: 600, marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16, fontSize: 14 }}>Новый пользователь</h3>
          {error && <div className="login-error" style={{ marginBottom: 12 }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>ФИО *</label>
                <input value={form.name} required onChange={e => set('name', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={form.email} required onChange={e => set('email', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Пароль *</label>
                <input type="password" value={form.password} required minLength={6} onChange={e => set('password', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Роль *</label>
                <select value={form.role} onChange={e => set('role', e.target.value)}>
                  <option value="admin">Администратор</option>
                  <option value="employee">Сотрудник</option>
                  <option value="viewer">Наблюдатель</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Отдел *</label>
              <select value={form.department} onChange={e => set('department', e.target.value)}>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Создание…' : 'Создать'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>ФИО</th>
                <th>Email</th>
                <th>Роль</th>
                <th>Отдел</th>
                <th>Дата регистрации</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u._id}>
                  <td className="text-muted">{i + 1}</td>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}</td>
                  <td><StatusBadge status={u.role} /></td>
                  <td>{u.department}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString('ru-RU')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
