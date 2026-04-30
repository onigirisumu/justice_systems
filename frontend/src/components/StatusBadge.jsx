const MAP = {
  'Новое': 'new', 'Назначено': 'assigned', 'В работе': 'inprogress',
  'На рассмотрении': 'review', 'Завершено': 'completed', 'Отклонено': 'rejected',
  'Создан': 'created', 'Передан в отдел': 'sent', 'Рассмотрен': 'reviewed',
  'Утверждён': 'approved', 'В архиве': 'archived',
  'admin': 'admin', 'employee': 'employee', 'viewer': 'viewer', 'citizen': 'citizen',
};

export const ROLE_RU = {
  admin: 'Администратор', employee: 'Сотрудник', viewer: 'Наблюдатель', citizen: 'Гражданин',
};

export default function StatusBadge({ status }) {
  const display = ROLE_RU[status] || status;
  return <span className={`badge badge-${MAP[status] || 'new'}`}>{display}</span>;
}
