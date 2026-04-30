import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

export default function CitizenAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const load = () => {
    api.get('/appointments').then(r => { setAppointments(r.data.appointments); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const handleCancel = async (id) => {
    if (!confirm('Отменить запись?')) return;
    setCancelling(id);
    try {
      await api.put(`/appointments/${id}`, { status: 'Отменено' });
      load();
    } finally {
      setCancelling(null);
    }
  };

  if (loading) return <p className="text-muted">Загрузка…</p>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20 }}>Мои записи на приём</h2>
        <button className="btn btn-primary" onClick={() => navigate('/portal/appointments/new')}>+ Записаться</button>
      </div>

      {appointments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Записей пока нет</p>
          <p className="text-muted" style={{ marginBottom: 20 }}>Запишитесь на приём в удобный для вас отдел Министерства юстиции.</p>
          <button className="btn btn-primary" onClick={() => navigate('/portal/appointments/new')}>Записаться на приём</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {appointments.map(a => (
            <div key={a._id} className="card" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 700 }}>
                      {new Date(a.date).toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    <span style={{ background: '#1a3c5e', color: '#fff', borderRadius: 6, padding: '2px 10px', fontSize: 13, fontWeight: 600 }}>{a.timeSlot}</span>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{a.department}</p>
                  <p style={{ fontSize: 13, color: '#6b7280' }}>{a.purpose}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <StatusBadge status={a.status} />
                  {a.status === 'Запланировано' && (
                    <button className="btn btn-secondary btn-sm" disabled={cancelling === a._id}
                      onClick={() => handleCancel(a._id)}>
                      {cancelling === a._id ? '…' : 'Отменить'}
                    </button>
                  )}
                </div>
              </div>
              {a.status === 'Подтверждено' && (
                <div style={{ marginTop: 10, padding: '8px 12px', background: '#dcfce7', borderRadius: 6, fontSize: 12, color: '#166534' }}>
                  ✓ Запись подтверждена. На ваш email отправлено уведомление.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
