import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

export default function CitizenDashboard() {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/appeals').then(r => { setAppeals(r.data.appeals); setLoading(false); });
  }, []);

  const unreadCount = (appeal) => appeal.notifications?.filter(n => !n.read).length || 0;

  if (loading) return <p className="text-muted">Загрузка…</p>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20 }}>Мои обращения</h2>
        <Link to="/portal/new" className="btn btn-primary">+ Подать обращение</Link>
      </div>

      {appeals.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Обращений пока нет</p>
          <p className="text-muted" style={{ marginBottom: 20 }}>Вы можете подать обращение в Министерство юстиции и отслеживать его обработку здесь.</p>
          <Link to="/portal/new" className="btn btn-primary">Подать первое обращение</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {appeals.map(a => {
            const unread = unreadCount(a);
            const isOverdue = a.deadline && new Date(a.deadline) < new Date() && !['Завершено','Отклонено'].includes(a.status);
            return (
              <Link key={a._id} to={`/portal/appeals/${a._id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', cursor: 'pointer', transition: 'box-shadow .15s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.12)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <code style={{ fontSize: 12, color: '#6b7280', background: '#f3f4f6', padding: '1px 6px', borderRadius: 4 }}>{a.appealNumber}</code>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{a.appealType}</span>
                      {unread > 0 && (
                        <span style={{ background: '#ef4444', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>+{unread} новых</span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 500 }}>{a.description}</p>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>Подано: {new Date(a.createdAt).toLocaleDateString('ru-RU')}</span>
                    {isOverdue && <span className="overdue" style={{ marginLeft: 10, fontSize: 11 }}>⚠ Срок истёк</span>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <StatusBadge status={a.status} />
                    {a.deadline && <span style={{ fontSize: 11, color: '#9ca3af' }}>до {new Date(a.deadline).toLocaleDateString('ru-RU')}</span>}
                  </div>
                  <span style={{ color: '#9ca3af', fontSize: 18 }}>›</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="card" style={{ marginTop: 20, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
        <p style={{ fontSize: 13, color: '#1d4ed8' }}>
          <strong>Знаете номер обращения?</strong>{' '}
          <Link to="/track" style={{ color: '#1d4ed8', fontWeight: 600 }}>Проверьте статус без входа →</Link>
        </p>
      </div>
    </div>
  );
}
