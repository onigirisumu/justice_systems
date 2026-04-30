import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS = ['Правовой отдел', 'Отдел ЗАГС', 'Нотариальный отдел', 'Архив', 'Отдел кадров'];
const TYPES = ['Общий запрос', 'Жалоба', 'Правовой запрос', 'Запрос документов', 'Другое'];

export default function CitizenAppealNew() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ appealType: 'Общий запрос', description: '', department: 'Правовой отдел' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/appeals', form);
      navigate(`/portal/appeals/${data._id}?new=1`);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при подаче обращения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 20, marginBottom: 8 }}>Подать обращение</h2>
      <p className="text-muted" style={{ marginBottom: 24, fontSize: 13 }}>
        Обращение будет подано от имени: <strong>{user?.name}</strong>
      </p>

      <div className="card" style={{ maxWidth: 680 }}>
        {error && <div className="login-error" style={{ marginBottom: 16 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Тип обращения *</label>
              <select value={form.appealType} onChange={e => set('appealType', e.target.value)}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Направить в отдел *</label>
              <select value={form.department} onChange={e => set('department', e.target.value)}>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Текст обращения *</label>
            <textarea value={form.description} required minLength={20}
              onChange={e => set('description', e.target.value)}
              placeholder="Подробно опишите суть вашего обращения…"
              style={{ minHeight: 140 }} />
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Минимум 20 символов. Описание {form.description.length} / 20</div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px', marginBottom: 20, fontSize: 13, color: '#374151' }}>
            <strong>После подачи</strong> вы получите уникальный номер обращения. Вы сможете отслеживать статус в личном кабинете или по номеру на странице проверки.
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading || form.description.length < 20}>
              {loading ? 'Отправка…' : 'Подать обращение'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/portal')}>Отмена</button>
          </div>
        </form>
      </div>
    </div>
  );
}
