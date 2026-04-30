import * as XLSX from 'xlsx';

export function exportAppealsToExcel(appeals) {
  const rows = appeals.map(a => ({
    'Номер': a.appealNumber,
    'Заявитель': a.citizenName,
    'Контакт': a.citizenContact,
    'Тип': a.appealType,
    'Отдел': a.department,
    'Статус': a.status,
    'Исполнитель': a.assignedToName || '—',
    'Срок': a.deadline ? new Date(a.deadline).toLocaleDateString('ru-RU') : '—',
    'Дата регистрации': new Date(a.createdAt).toLocaleDateString('ru-RU'),
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Обращения');
  XLSX.writeFile(wb, `Обращения_${new Date().toLocaleDateString('ru-RU')}.xlsx`);
}

function printHtml(html) {
  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 600);
}

const baseStyle = `
  body { font-family: Arial, sans-serif; font-size: 12px; margin: 24px; color: #111; }
  h2 { color: #1a3c5e; font-size: 15px; margin: 0 0 4px; }
  .sub { font-size: 11px; color: #555; margin: 0 0 18px; }
  h3 { color: #1a3c5e; font-size: 12px; margin: 22px 0 6px; }
  table { border-collapse: collapse; }
  th { background: #1a3c5e; color: #fff; padding: 7px 8px; text-align: left; font-size: 11px; }
  td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
  tr:nth-child(even) td { background: #f9fafb; }
  @media print { body { margin: 12px; } }
`;

export function exportAppealsToPDF(appeals) {
  const rows = appeals.map(a => `<tr>
    <td>${a.appealNumber}</td>
    <td>${a.citizenName}</td>
    <td>${a.appealType}</td>
    <td>${a.department}</td>
    <td>${a.status}</td>
    <td>${a.assignedToName || '—'}</td>
    <td>${a.deadline ? new Date(a.deadline).toLocaleDateString('ru-RU') : '—'}</td>
  </tr>`).join('');

  printHtml(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Реестр обращений</title>
  <style>${baseStyle} table { width: 100%; }</style></head><body>
  <h2>Министерство юстиции Республики Казахстан</h2>
  <p class="sub">Реестр обращений граждан &nbsp;·&nbsp; Сформировано: ${new Date().toLocaleString('ru-RU')}</p>
  <table>
    <thead><tr>
      <th>Номер</th><th>Заявитель</th><th>Тип</th><th>Отдел</th><th>Статус</th><th>Исполнитель</th><th>Срок</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  </body></html>`);
}

export function exportAnalyticsToPDF(data, depts) {
  const appealRows = Object.entries(data.appeals)
    .map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('');
  const docRows = Object.entries(data.documents)
    .map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('');
  const deptRows = depts?.appealsByDept?.length
    ? depts.appealsByDept.map(d => `<tr><td>${d._id}</td><td>${d.count}</td></tr>`).join('')
    : '';

  printHtml(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Аналитический отчёт</title>
  <style>${baseStyle} table { width: 260px; }</style></head><body>
  <h2>Министерство юстиции Республики Казахстан</h2>
  <p class="sub">Аналитический отчёт &nbsp;·&nbsp; Сформировано: ${new Date().toLocaleString('ru-RU')}</p>
  <h3>Сводка по обращениям</h3>
  <table><thead><tr><th>Статус</th><th>Количество</th></tr></thead><tbody>${appealRows}</tbody></table>
  <h3>Сводка по документам</h3>
  <table><thead><tr><th>Статус</th><th>Количество</th></tr></thead><tbody>${docRows}</tbody></table>
  ${deptRows ? `<h3>Обращения по отделам</h3>
  <table style="width:320px"><thead><tr><th>Отдел</th><th>Обращений</th></tr></thead><tbody>${deptRows}</tbody></table>` : ''}
  </body></html>`);
}
