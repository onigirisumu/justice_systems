import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const DEPARTMENTS = ['Правовой отдел', 'Отдел ЗАГС', 'Нотариальный отдел', 'Архив', 'Отдел кадров'];
const CATEGORIES = ['Приказ', 'Инструкция', 'Отчёт', 'Запрос', 'Уведомление', 'Протокол', 'Другое'];
const STATUSES = ['Создан', 'Передан в отдел', 'Рассмотрен', 'Утверждён', 'В архиве'];

const EMPTY = { title: '', category: 'Приказ', description: '', fromDepartment: 'Правовой отдел', toDepartment: 'Отдел ЗАГС', deadline: '', status: 'Создан', note: '' };

export default function DocumentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      api.get(`/documents/${id}`).then(r => {
        const d = r.data;
        setForm({ title: d.title, category: d.category, description: d.description, fromDepartment: d.fromDepartment, toDepartment: d.toDepartment, deadline: d.deadline ? d.deadline.slice(0, 10) : '', status: d.status, note: '' });
      });
    }
  }, [id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) await api.put(`/documents/${id}`, form);
      else await api.post('/documents', form);
      navigate('/documents');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>{isEdit ? 'Редактирование документа' : 'Новый внутренний документ'}</h2>
      </div>
      <div className="card" style={{ maxWidth: 760 }}>
        {error && <div className="login-error" style={{ marginBottom: 16 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Название документа *</label>
            <input value={form.title} required onChange={e => set('title', e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Категория *</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Срок исполнения</label>
              <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>От отдела *</label>
              <select value={form.fromDepartment} onChange={e => set('fromDepartment', e.target.value)}>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Кому *</label>
              <select value={form.toDepartment} onChange={e => set('toDepartment', e.target.value)}>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Содержание *</label>
            <textarea value={form.description} required onChange={e => set('description', e.target.value)} />
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
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/documents')}>Отмена</button>
          </div>
        </form>
      </div>
    </div>
  );
}
