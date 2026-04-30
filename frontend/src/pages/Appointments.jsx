import { useEffect, useState } from 'react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

const STATUSES = ['Запланировано', 'Подтверждено', 'Завершено', 'Отменено'];
const DEPARTMENTS = ['Правовой отдел', 'Отдел ЗАГС', 'Нотариальный отдел', 'Архив', 'Отдел кадров'];

export default function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useState({ status: '', department: '' });
  const [updating, setUpdating] = useState(null);

  const load = async () => {
    const { data } = await api.get('/appointments', { params: { page, limit: 10, ...filters } });
    setAppointments(data.appointments);
    setTotal(data.total);
    setPages(data.pages);
  };

  useEffect(() => { load(); }, [page, filters]);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await api.put(`/appointments/${id}`, { status });
      load();
    } finally {
      setUpdating(null);
    }
  };

  const nextAction = (status) => {
    if (status === 'Запланировано') return { label: 'Подтвердить', next: 'Подтверждено' };
    if (status === 'Подтверждено') return { label: 'Завершить', next: 'Завершено' };
    return null;
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Запись на приём <span className="text-muted" style={{ fontSize: 14 }}>({total})</span></h2>
      </div>

      <div className="filters">
        <select value={filters.status} onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }}>
          <option value="">Все статусы</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filters.department} onChange={e => { setFilters(f => ({ ...f, department: e.target.value })); setPage(1); }}>
          <option value="">Все отделы</option>
          {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Гражданин</th>
                <th>Контакт</th>
                <th>Отдел</th>
                <th>Дата</th>
                <th>Время</th>
                <th>Цель визита</th>
                <th>Статус</th>
                {user.role !== 'viewer' && <th>Действие</th>}
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 && <tr><td colSpan="8" className="empty">Записей не найдено</td></tr>}
              {appointments.map(a => {
                const action = nextAction(a.status);
                return (
                  <tr key={a._id}>
                    <td><strong>{a.citizenName}</strong></td>
                    <td>
                      <div style={{ fontSize: 12 }}>{a.citizenEmail}</div>
                      {a.citizenPhone && <div style={{ fontSize: 12, color: '#6b7280' }}>{a.citizenPhone}</div>}
                    </td>
                    <td>{a.department}</td>
                    <td>{new Date(a.date).toLocaleDateString('ru-RU')}</td>
                    <td><strong>{a.timeSlot}</strong></td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.purpose}</td>
                    <td><StatusBadge status={a.status} /></td>
                    {user.role !== 'viewer' && (
                      <td>
                        {action && (
                          <button className="btn btn-primary btn-sm" disabled={updating === a._id}
                            onClick={() => updateStatus(a._id, action.next)}>
                            {updating === a._id ? '…' : action.label}
                          </button>
                        )}
                        {a.status === 'Запланировано' && (
                          <button className="btn btn-danger btn-sm" style={{ marginLeft: 6 }} disabled={updating === a._id}
                            onClick={() => updateStatus(a._id, 'Отменено')}>
                            Отменить
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
            {Array.from({ length: pages }, (_, i) => (
              <button key={i + 1} className={page === i + 1 ? 'active' : ''} onClick={() => setPage(i + 1)}>{i + 1}</button>
            ))}
            <button disabled={page === pages} onClick={() => setPage(p => p + 1)}>›</button>
          </div>
        )}
      </div>
    </div>
  );
}
