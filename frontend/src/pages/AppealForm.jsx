import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const DEPARTMENTS = ['Правовой отдел', 'Отдел ЗАГС', 'Нотариальный отдел', 'Архив', 'Отдел кадров'];
const TYPES = ['Общий запрос', 'Жалоба', 'Правовой запрос', 'Запрос документов', 'Другое'];
const STATUSES = ['Новое', 'Назначено', 'В работе', 'На рассмотрении', 'Завершено', 'Отклонено'];

const EMPTY = { citizenName: '', citizenContact: '', appealType: 'Общий запрос', description: '', department: 'Правовой отдел', deadline: '', assignedTo: '', assignedToName: '', status: 'Новое', note: '' };

export default function AppealForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(EMPTY);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/auth/users').catch(() => {}).then(r => r && setUsers(r.data));
    if (isEdit) {
      api.get(`/appeals/${id}`).then(r => {
        const a = r.data;
        setForm({
          citizenName: a.citizenName, citizenContact: a.citizenContact,
          appealType: a.appealType, description: a.description,
          department: a.department, status: a.status,
          deadline: a.deadline ? a.deadline.slice(0, 10) : '',
          assignedTo: a.assignedTo || '', assignedToName: a.assignedToName || '',
          note: '',
        });
      });
    }
  }, [id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleUserSelect = (e) => {
    const selected = users.find(u => u._id === e.target.value);
    setForm(f => ({ ...f, assignedTo: selected?._id || '', assignedToName: selected?.name || '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) await api.put(`/appeals/${id}`, form);
      else await api.post('/appeals', form);
      navigate('/appeals');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>{isEdit ? 'Редактирование обращения' : 'Новое обращение гражданина'}</h2>
      </div>
      <div className="card" style={{ maxWidth: 760 }}>
        {error && <div className="login-error" style={{ marginBottom: 16 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>ФИО заявителя *</label>
              <input value={form.citizenName} required onChange={e => set('citizenName', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Контакт (телефон/email) *</label>
              <input value={form.citizenContact} required onChange={e => set('citizenContact', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Тип обращения *</label>
              <select value={form.appealType} onChange={e => set('appealType', e.target.value)}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Отдел *</label>
              <select value={form.department} onChange={e => set('department', e.target.value)}>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Текст обращения *</label>
            <textarea value={form.description} required onChange={e => set('description', e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Назначить исполнителя</label>
              <select value={form.assignedTo || ''} onChange={handleUserSelect}>
                <option value="">— Не назначен —</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.department})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Срок исполнения</label>
              <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
            </div>
          </div>
          {isEdit && (
            <div className="form-row">
              <div className="form-group">
                <label>Статус</label>
                <select value={form.status} onChange={e => set('status', e.target.value)}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Примечание (для истории)</label>
                <input value={form.note} onChange={e => set('note', e.target.value)} placeholder="Необязательное примечание" />
              </div>
            </div>
          )}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Сохранение…' : 'Сохранить'}</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/appeals')}>Отмена</button>
          </div>
        </form>
      </div>
    </div>
  );
}
