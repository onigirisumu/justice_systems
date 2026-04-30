import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const DEPARTMENTS = ['Правовой отдел', 'Отдел ЗАГС', 'Нотариальный отдел', 'Архив', 'Отдел кадров'];
const TIME_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

function getMinDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export default function CitizenAppointmentNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ department: 'Правовой отдел', date: '', timeSlot: '09:00', purpose: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/appointments', form);
      navigate('/portal/appointments');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при записи');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 20, marginBottom: 8 }}>Записаться на приём</h2>
      <p className="text-muted" style={{ marginBottom: 24, fontSize: 13 }}>
        Выберите отдел, удобную дату и время для визита в Министерство юстиции.
      </p>

      <div className="card" style={{ maxWidth: 560 }}>
        {error && <div className="login-error" style={{ marginBottom: 16 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Отдел *</label>
            <select value={form.department} onChange={e => set('department', e.target.value)}>
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Дата *</label>
              <input type="date" value={form.date} required min={getMinDate()}
                onChange={e => set('date', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Время *</label>
              <select value={form.timeSlot} onChange={e => set('timeSlot', e.target.value)}>
                {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Цель визита *</label>
            <textarea value={form.purpose} required minLength={10}
              onChange={e => set('purpose', e.target.value)}
              placeholder="Опишите цель вашего визита…"
              style={{ minHeight: 100 }} />
          </div>

          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#92400e' }}>
            Приходите за 10 минут до назначенного времени с удостоверением личности. Запись считается подтверждённой после обработки сотрудником.
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading || form.purpose.length < 10}>
              {loading ? 'Отправка…' : 'Записаться'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/portal/appointments')}>Отмена</button>
          </div>
        </form>
      </div>
    </div>
  );
}
