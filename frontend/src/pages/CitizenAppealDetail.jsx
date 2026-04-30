import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

const STATUS_STEPS = ['Новое', 'Назначено', 'В работе', 'На рассмотрении', 'Завершено'];

export default function CitizenAppealDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNew = searchParams.get('new') === '1';
  const [appeal, setAppeal] = useState(null);

  useEffect(() => {
    api.get(`/appeals/${id}`).then(r => {
      setAppeal(r.data);
      if (r.data.notifications?.some(n => !n.read)) {
        api.post(`/appeals/${id}/read-notifications`).catch(() => {});
      }
    });
  }, [id]);

  if (!appeal) return <p className="text-muted">Загрузка…</p>;

  const currentStep = STATUS_STEPS.indexOf(appeal.status);
  const isRejected = appeal.status === 'Отклонено';
  const isOverdue = appeal.deadline && new Date(appeal.deadline) < new Date() && !['Завершено','Отклонено'].includes(appeal.status);

  return (
    <div>
      {isNew && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 8, padding: '14px 18px', marginBottom: 20, color: '#166534' }}>
          <strong>Обращение успешно подано!</strong> Ваш номер обращения: <code style={{ fontWeight: 700, fontSize: 15 }}>{appeal.appealNumber}</code>. Сохраните его для отслеживания статуса.
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/portal')}>← Назад</button>
        <div>
          <code style={{ fontSize: 13, background: '#f3f4f6', padding: '2px 8px', borderRadius: 4, color: '#374151' }}>{appeal.appealNumber}</code>
          <span style={{ marginLeft: 10, fontSize: 15, fontWeight: 600 }}>{appeal.appealType}</span>
        </div>
        <StatusBadge status={appeal.status} />
      </div>

      {/* Progress tracker */}
      {!isRejected && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 20 }}>Статус рассмотрения</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {STATUS_STEPS.map((step, i) => {
              const done = i <= currentStep;
              const active = i === currentStep;
              return (
                <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_STEPS.length - 1 ? 1 : 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: done ? '#2563a8' : '#e5e7eb', color: done ? '#fff' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, border: active ? '3px solid #93c5fd' : 'none', boxShadow: active ? '0 0 0 3px #dbeafe' : 'none' }}>
                      {done ? (i < currentStep ? '✓' : '●') : i + 1}
                    </div>
                    <span style={{ fontSize: 10, marginTop: 6, textAlign: 'center', color: done ? '#1d4ed8' : '#9ca3af', fontWeight: active ? 600 : 400, maxWidth: 70 }}>{step}</span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: i < currentStep ? '#2563a8' : '#e5e7eb', margin: '0 2px', marginBottom: 22 }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isRejected && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '14px 18px', marginBottom: 16, color: '#991b1b' }}>
          <strong>Обращение отклонено.</strong> Если вы считаете это ошибкой, вы можете подать новое обращение.
        </div>
      )}

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 16 }}>Детали обращения</h3>
        <div className="detail-grid">
          <div className="detail-field"><label>Тип</label><p>{appeal.appealType}</p></div>
          <div className="detail-field"><label>Отдел</label><p>{appeal.department}</p></div>
          <div className="detail-field"><label>Дата подачи</label><p>{new Date(appeal.createdAt).toLocaleDateString('ru-RU')}</p></div>
          <div className="detail-field">
            <label>Срок рассмотрения</label>
            <p className={isOverdue ? 'overdue' : ''}>{appeal.deadline ? new Date(appeal.deadline).toLocaleDateString('ru-RU') : '—'}{isOverdue && ' ⚠'}</p>
          </div>
          <div className="detail-field" style={{ gridColumn: '1 / -1' }}>
            <label>Текст обращения</label>
            <p style={{ whiteSpace: 'pre-wrap' }}>{appeal.description}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 16 }}>История рассмотрения</h3>
        <ul className="history-list">
          {[...appeal.history].reverse().map((h, i) => (
            <li key={i} className="history-item">
              <div className="history-dot" />
              <div className="history-body">
                <strong><StatusBadge status={h.status} /></strong>
                <span>{new Date(h.date).toLocaleString('ru-RU')}</span>
                {h.note && <span style={{ marginTop: 2 }}>{h.note}</span>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
