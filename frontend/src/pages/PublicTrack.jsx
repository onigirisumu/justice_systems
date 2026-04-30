import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

export default function PublicTrack() {
  const [number, setNumber] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const { data } = await api.get(`/appeals/track/${number.trim().toUpperCase()}`);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при поиске');
    } finally {
      setLoading(false);
    }
  };

  const STATUS_STEPS = ['Новое', 'Назначено', 'В работе', 'На рассмотрении', 'Завершено'];
  const currentStep = result ? STATUS_STEPS.indexOf(result.status) : -1;
  const isRejected = result?.status === 'Отклонено';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: 'var(--primary)', color: '#fff', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>Министерство юстиции РК</span>
        <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
          <Link to="/portal/login" style={{ color: 'rgba(255,255,255,.8)' }}>Личный кабинет</Link>
          <Link to="/login" style={{ color: 'rgba(255,255,255,.8)' }}>Для сотрудников</Link>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 20px' }}>
        <div style={{ width: '100%', maxWidth: 560 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>Проверка статуса обращения</h1>
          <p className="text-muted" style={{ textAlign: 'center', marginBottom: 32, fontSize: 14 }}>
            Введите номер обращения в формате <strong>ОБ-2024-0001</strong>
          </p>

          <div className="card" style={{ marginBottom: 24 }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10 }}>
              <input
                value={number}
                onChange={e => setNumber(e.target.value)}
                placeholder="ОБ-2024-0001"
                required
                style={{ flex: 1, fontFamily: 'monospace', fontSize: 15, letterSpacing: '.05em', textTransform: 'uppercase' }}
              />
              <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }} disabled={loading}>
                {loading ? '…' : 'Проверить'}
              </button>
            </form>
            {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 10 }}>{error}</p>}
          </div>

          {result && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <code style={{ fontSize: 14, fontWeight: 700, color: '#1a3c5e' }}>{result.appealNumber}</code>
                  <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{result.appealType} · {result.department}</div>
                </div>
                <StatusBadge status={result.status} />
              </div>

              {!isRejected && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                    {STATUS_STEPS.map((step, i) => {
                      const done = i <= currentStep;
                      const active = i === currentStep;
                      return (
                        <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_STEPS.length - 1 ? 1 : 'none' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 72 }}>
                            <div style={{ width: 26, height: 26, borderRadius: '50%', background: done ? '#2563a8' : '#e5e7eb', color: done ? '#fff' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, boxShadow: active ? '0 0 0 3px #dbeafe' : 'none' }}>
                              {i < currentStep ? '✓' : i === currentStep ? '●' : i + 1}
                            </div>
                            <span style={{ fontSize: 10, marginTop: 4, textAlign: 'center', color: done ? '#1d4ed8' : '#9ca3af', maxWidth: 65 }}>{step}</span>
                          </div>
                          {i < STATUS_STEPS.length - 1 && (
                            <div style={{ flex: 1, height: 2, background: i < currentStep ? '#2563a8' : '#e5e7eb', margin: '0 2px', marginBottom: 20 }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {isRejected && (
                <div style={{ background: '#fee2e2', borderRadius: 6, padding: '10px 14px', marginBottom: 16, color: '#991b1b', fontSize: 13 }}>
                  Обращение отклонено.
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>История рассмотрения:</p>
                <ul className="history-list">
                  {[...result.history].reverse().map((h, i) => (
                    <li key={i} className="history-item">
                      <div className="history-dot" />
                      <div className="history-body">
                        <strong><StatusBadge status={h.status} /></strong>
                        <span>{new Date(h.date).toLocaleString('ru-RU')}</span>
                        {h.note && <span>{h.note}</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)', fontSize: 13, color: '#6b7280' }}>
                Зарегистрировано: {new Date(result.createdAt).toLocaleDateString('ru-RU')}
                {result.deadline && <span style={{ marginLeft: 16 }}>Срок: {new Date(result.deadline).toLocaleDateString('ru-RU')}</span>}
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#9ca3af' }}>
            <Link to="/portal/register" style={{ color: '#2563a8' }}>Зарегистрируйтесь</Link>, чтобы подавать обращения и получать уведомления
          </div>
        </div>
      </main>
    </div>
  );
}
