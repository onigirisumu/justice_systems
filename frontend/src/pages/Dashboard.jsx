import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../api/axios';
import { exportAnalyticsToPDF } from '../utils/export';

const APPEAL_COLORS = ['#3b82f6','#8b5cf6','#f59e0b','#f97316','#22c55e','#ef4444'];
const DOC_COLORS = ['#0ea5e9','#8b5cf6','#f59e0b','#22c55e','#6b7280'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [depts, setDepts] = useState(null);
  const [range, setRange] = useState({ from: '', to: '' });

  const load = () => {
    const params = {};
    if (range.from) params.from = range.from;
    if (range.to) params.to = range.to;
    api.get('/analytics/summary', { params }).then(r => setData(r.data));
    api.get('/analytics/departments', { params }).then(r => setDepts(r.data));
  };

  useEffect(() => { load(); }, [range]);

  if (!data) return <div className="page"><p className="text-muted">Загрузка…</p></div>;

  const appealPie = Object.entries(data.appeals).map(([name, value]) => ({ name, value }));
  const docPie = Object.entries(data.documents).map(([name, value]) => ({ name, value }));
  const deptBar = depts?.appealsByDept.map(d => ({ name: d._id, Обращений: d.count })) || [];

  return (
    <div className="page">
      <div className="page-header">
        <h2>Панель аналитики</h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="date" value={range.from} onChange={e => setRange(r => ({ ...r, from: e.target.value }))}
            style={{ width: 145 }} title="С даты" />
          <span className="text-muted">—</span>
          <input type="date" value={range.to} onChange={e => setRange(r => ({ ...r, to: e.target.value }))}
            style={{ width: 145 }} title="По дату" />
          {(range.from || range.to) && (
            <button className="btn btn-secondary btn-sm" onClick={() => setRange({ from: '', to: '' })}>✕ Сбросить</button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={() => exportAnalyticsToPDF(data, depts)}>
            📄 Экспорт PDF
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{data.totalAppeals}</div>
          <div className="stat-label">Всего обращений</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.appeals['Завершено'] || 0}</div>
          <div className="stat-label">Завершено</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.appeals['В работе'] || 0}</div>
          <div className="stat-label">В работе</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-value">{data.overdueAppeals}</div>
          <div className="stat-label">Просроченных обращений</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.totalDocuments}</div>
          <div className="stat-label">Всего документов</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.documents['Утверждён'] || 0}</div>
          <div className="stat-label">Утверждено</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-value">{data.overdueDocs}</div>
          <div className="stat-label">Просроченных документов</div>
        </div>
      </div>

      <div className="charts-row">
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 14 }}>Обращения по статусу</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={appealPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}>
                {appealPie.map((_, i) => <Cell key={i} fill={APPEAL_COLORS[i % APPEAL_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 14 }}>Документы по статусу</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={docPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}>
                {docPie.map((_, i) => <Cell key={i} fill={DOC_COLORS[i % DOC_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {deptBar.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 14 }}>Обращения по отделам</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptBar} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="Обращений" fill="#2563a8" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
