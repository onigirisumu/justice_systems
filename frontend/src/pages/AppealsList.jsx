import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { exportAppealsToPDF, exportAppealsToExcel } from '../utils/export';

const STATUSES = ['Новое', 'Назначено', 'В работе', 'На рассмотрении', 'Завершено', 'Отклонено'];
const DEPARTMENTS = ['Правовой отдел', 'Отдел ЗАГС', 'Нотариальный отдел', 'Архив', 'Отдел кадров'];

export default function AppealsList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appeals, setAppeals] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useState({ status: '', department: '', search: '' });
  const [exporting, setExporting] = useState(false);

  const load = async () => {
    const { data } = await api.get('/appeals', { params: { page, limit: 10, ...filters } });
    setAppeals(data.appeals);
    setTotal(data.total);
    setPages(data.pages);
  };

  useEffect(() => { load(); }, [page, filters]);

  const isOverdue = (a) => a.deadline && new Date(a.deadline) < new Date() && !['Завершено','Отклонено'].includes(a.status);

  const handleExport = async (type) => {
    setExporting(true);
    try {
      const { data } = await api.get('/appeals/export', { params: filters });
      if (type === 'pdf') exportAppealsToPDF(data);
      else exportAppealsToExcel(data);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Обращения граждан <span className="text-muted" style={{ fontSize: 14 }}>({total})</span></h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => handleExport('excel')} disabled={exporting}>📊 Excel</button>
          <button className="btn btn-secondary btn-sm" onClick={() => handleExport('pdf')} disabled={exporting}>📄 PDF</button>
          {user.role !== 'viewer' && (
            <button className="btn btn-primary" onClick={() => navigate('/appeals/new')}>+ Новое обращение</button>
          )}
        </div>
      </div>

      <div className="filters">
        <input placeholder="Поиск по имени, типу, описанию…" value={filters.search}
          onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1); }} />
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
                <th>№ обращения</th>
                <th>Заявитель</th>
                <th>Тип</th>
                <th>Отдел</th>
                <th>Статус</th>
                <th>Срок</th>
                <th>Исполнитель</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {appeals.length === 0 && <tr><td colSpan="8" className="empty">Обращения не найдены</td></tr>}
              {appeals.map(a => (
                <tr key={a._id}>
                  <td><code style={{ fontSize: 12 }}>{a.appealNumber}</code></td>
                  <td>
                    <strong>{a.citizenName}</strong>
                    <div className="text-muted" style={{ fontSize: 11 }}>{a.citizenContact}</div>
                  </td>
                  <td>{a.appealType}</td>
                  <td>{a.department}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td className={isOverdue(a) ? 'overdue' : ''}>
                    {a.deadline ? new Date(a.deadline).toLocaleDateString('ru-RU') : '—'}
                    {isOverdue(a) && ' ⚠'}
                  </td>
                  <td>{a.assignedToName || '—'}</td>
                  <td>
                    <Link to={`/appeals/${a._id}`} className="btn btn-secondary btn-sm">Просмотр</Link>
                    {user.role !== 'viewer' && (
                      <Link to={`/appeals/${a._id}/edit`} className="btn btn-secondary btn-sm" style={{ marginLeft: 6 }}>Изменить</Link>
                    )}
                  </td>
                </tr>
              ))}
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
