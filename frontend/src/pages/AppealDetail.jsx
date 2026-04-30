import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export default function AppealDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appeal, setAppeal] = useState(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => api.get(`/appeals/${id}`).then(r => setAppeal(r.data));
  useEffect(() => { load(); }, [id]);

  const handleDelete = async () => {
    if (!confirm('Удалить это обращение?')) return;
    await api.delete(`/appeals/${id}`);
    navigate('/appeals');
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/appeals/${id}/comments`, { text: comment });
      setComment('');
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Удалить комментарий?')) return;
    await api.delete(`/appeals/${id}/comments/${commentId}`);
    load();
  };

  if (!appeal) return <div className="page"><p className="text-muted">Загрузка…</p></div>;

  const isOverdue = appeal.deadline && new Date(appeal.deadline) < new Date() && !['Завершено','Отклонено'].includes(appeal.status);

  return (
    <div className="page">
      <div className="detail-header no-print">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/appeals')}>← Назад</button>
        <div>
          <h2 style={{ marginBottom: 2 }}>{appeal.citizenName}</h2>
          <code style={{ fontSize: 12, color: '#6b7280' }}>{appeal.appealNumber}</code>
        </div>
        <StatusBadge status={appeal.status} />
        {user.role !== 'viewer' && <Link to={`/appeals/${id}/edit`} className="btn btn-primary btn-sm">Редактировать</Link>}
        {user.role === 'admin' && <button className="btn btn-danger btn-sm" onClick={handleDelete}>Удалить</button>}
        <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>🖨 Печать</button>
      </div>

      {/* Print header — only visible on print */}
      <div className="print-only print-header">
        <h2>Министерство юстиции Республики Казахстан</h2>
        <p>Обращение гражданина · {appeal.appealNumber}</p>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 className="section-title">Информация о заявителе</h3>
        <div className="detail-grid">
          <div className="detail-field"><label>ФИО</label><p>{appeal.citizenName}</p></div>
          <div className="detail-field"><label>Контакт</label><p>{appeal.citizenContact}</p></div>
          <div className="detail-field"><label>Тип обращения</label><p>{appeal.appealType}</p></div>
          <div className="detail-field"><label>Отдел</label><p>{appeal.department}</p></div>
          <div className="detail-field"><label>Исполнитель</label><p>{appeal.assignedToName || '—'}</p></div>
          <div className="detail-field">
            <label>Срок исполнения</label>
            <p className={isOverdue ? 'overdue' : ''}>{appeal.deadline ? new Date(appeal.deadline).toLocaleDateString('ru-RU') : '—'}{isOverdue && ' ⚠ Просрочено'}</p>
          </div>
          <div className="detail-field"><label>Зарегистрировал</label><p>{appeal.createdByName}</p></div>
          <div className="detail-field"><label>Дата регистрации</label><p>{new Date(appeal.createdAt).toLocaleString('ru-RU')}</p></div>
          <div className="detail-field" style={{ gridColumn: '1 / -1' }}>
            <label>Содержание обращения</label>
            <p style={{ whiteSpace: 'pre-wrap' }}>{appeal.description}</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 className="section-title">История статусов</h3>
        <ul className="history-list">
          {[...appeal.history].reverse().map((h, i) => (
            <li key={i} className="history-item">
              <div className="history-dot" />
              <div className="history-body">
                <strong><StatusBadge status={h.status} /></strong>
                <span>{h.changedByName} · {new Date(h.date).toLocaleString('ru-RU')}</span>
                {h.note && <span style={{ marginTop: 2 }}>{h.note}</span>}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Internal comments — staff only, hidden on print */}
      <div className="card no-print">
        <h3 className="section-title">Внутренние комментарии сотрудников</h3>
        {appeal.comments.length === 0 && <p className="text-muted" style={{ marginBottom: 14 }}>Комментариев пока нет</p>}
        <ul className="history-list" style={{ marginBottom: 16 }}>
          {appeal.comments.map(c => (
            <li key={c._id} className="history-item">
              <div className="history-dot" style={{ background: '#f59e0b' }} />
              <div className="history-body" style={{ flex: 1 }}>
                <strong style={{ fontSize: 13 }}>{c.authorName}</strong>
                <span>{new Date(c.createdAt).toLocaleString('ru-RU')}</span>
                <p style={{ marginTop: 4, fontSize: 13 }}>{c.text}</p>
              </div>
              {user.role === 'admin' && (
                <button className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }}
                  onClick={() => handleDeleteComment(c._id)}>✕</button>
              )}
            </li>
          ))}
        </ul>
        {user.role !== 'viewer' && (
          <form onSubmit={handleComment} style={{ display: 'flex', gap: 10 }}>
            <input value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Добавить внутренний комментарий…" style={{ flex: 1 }} />
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting || !comment.trim()}>
              {submitting ? '…' : 'Добавить'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
