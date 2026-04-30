import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doc, setDoc] = useState(null);

  useEffect(() => { api.get(`/documents/${id}`).then(r => setDoc(r.data)); }, [id]);

  const handleDelete = async () => {
    if (!confirm('Удалить этот документ?')) return;
    await api.delete(`/documents/${id}`);
    navigate('/documents');
  };

  if (!doc) return <div className="page"><p className="text-muted">Загрузка…</p></div>;

  const isOverdue = doc.deadline && new Date(doc.deadline) < new Date() && !['Утверждён','В архиве'].includes(doc.status);

  return (
    <div className="page">
      <div className="detail-header no-print">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/documents')}>← Назад</button>
        <h2>{doc.title}</h2>
        <StatusBadge status={doc.status} />
        {user.role !== 'viewer' && <Link to={`/documents/${id}/edit`} className="btn btn-primary btn-sm">Редактировать</Link>}
        {user.role === 'admin' && <button className="btn btn-danger btn-sm" onClick={handleDelete}>Удалить</button>}
        <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>🖨 Печать</button>
      </div>

      <div className="print-only print-header">
        <h2>Министерство юстиции Республики Казахстан</h2>
        <p>Внутренний документ · {doc.category}</p>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 className="section-title">Реквизиты документа</h3>
        <div className="detail-grid">
          <div className="detail-field"><label>Категория</label><p>{doc.category}</p></div>
          <div className="detail-field"><label>Автор</label><p>{doc.createdByName}</p></div>
          <div className="detail-field"><label>От отдела</label><p>{doc.fromDepartment}</p></div>
          <div className="detail-field"><label>Кому</label><p>{doc.toDepartment}</p></div>
          <div className="detail-field">
            <label>Срок</label>
            <p className={isOverdue ? 'overdue' : ''}>{doc.deadline ? new Date(doc.deadline).toLocaleDateString('ru-RU') : '—'}{isOverdue && ' ⚠ Просрочено'}</p>
          </div>
          <div className="detail-field"><label>Дата создания</label><p>{new Date(doc.createdAt).toLocaleString('ru-RU')}</p></div>
          <div className="detail-field" style={{ gridColumn: '1 / -1' }}><label>Содержание</label><p style={{ whiteSpace: 'pre-wrap' }}>{doc.description}</p></div>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">История статусов</h3>
        <ul className="history-list">
          {[...doc.history].reverse().map((h, i) => (
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
    </div>
  );
}
