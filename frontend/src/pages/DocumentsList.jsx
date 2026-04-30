import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

const STATUSES = ['Создан', 'Передан в отдел', 'Рассмотрен', 'Утверждён', 'В архиве'];
const CATEGORIES = ['Приказ', 'Инструкция', 'Отчёт', 'Запрос', 'Уведомление', 'Протокол', 'Другое'];

export default function DocumentsList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useState({ status: '', category: '', search: '' });

  const load = async () => {
    const { data } = await api.get('/documents', { params: { page, limit: 10, ...filters } });
    setDocs(data.documents);
    setTotal(data.total);
    setPages(data.pages);
  };

  useEffect(() => { load(); }, [page, filters]);

  const isOverdue = (d) => d.deadline && new Date(d.deadline) < new Date() && !['Утверждён','В архиве'].includes(d.status);

  return (
    <div className="page">
      <div className="page-header">
        <h2>Внутренние документы <span className="text-muted" style={{ fontSize: 14 }}>({total})</span></h2>
        {user.role !== 'viewer' && (
          <button className="btn btn-primary" onClick={() => navigate('/documents/new')}>+ Новый документ</button>
        )}
      </div>

      <div className="filters">
        <input placeholder="Поиск по названию, описанию…" value={filters.search}
          onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1); }} />
        <select value={filters.status} onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }}>
          <option value="">Все статусы</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filters.category} onChange={e => { setFilters(f => ({ ...f, category: e.target.value })); setPage(1); }}>
          <option value="">Все категории</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Название</th>
                <th>Категория</th>
                <th>От отдела</th>
                <th>Кому</th>
                <th>Статус</th>
                <th>Срок</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {docs.length === 0 && (
                <tr><td colSpan="8" className="empty">Документы не найдены</td></tr>
              )}
              {docs.map((d, i) => (
                <tr key={d._id}>
                  <td className="text-muted">{(page - 1) * 10 + i + 1}</td>
                  <td><strong>{d.title}</strong></td>
                  <td>{d.category}</td>
                  <td>{d.fromDepartment}</td>
                  <td>{d.toDepartment}</td>
                  <td><StatusBadge status={d.status} /></td>
                  <td className={isOverdue(d) ? 'overdue' : ''}>
                    {d.deadline ? new Date(d.deadline).toLocaleDateString('ru-RU') : '—'}
                    {isOverdue(d) && ' ⚠'}
                  </td>
                  <td>
                    <Link to={`/documents/${d._id}`} className="btn btn-secondary btn-sm">Просмотр</Link>
                    {user.role !== 'viewer' && (
                      <Link to={`/documents/${d._id}/edit`} className="btn btn-secondary btn-sm" style={{ marginLeft: 6 }}>Изменить</Link>
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
