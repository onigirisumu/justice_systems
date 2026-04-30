require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const Appeal = require('./models/Appeal');
const Document = require('./models/Document');

const DEPARTMENTS = ['Правовой отдел', 'Отдел ЗАГС', 'Нотариальный отдел', 'Архив', 'Отдел кадров'];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Подключено. Очищаем данные...');

  await User.deleteMany();
  await Appeal.deleteMany();
  await Document.deleteMany();

  const users = await Promise.all([
    User.create({ name: 'Администратор', email: 'admin@justice.gov', password: 'admin123', role: 'admin', department: 'Правовой отдел' }),
    User.create({ name: 'Асель Нурова', email: 'asel@justice.gov', password: 'password123', role: 'employee', department: 'Отдел ЗАГС' }),
    User.create({ name: 'Бекзат Сейткали', email: 'bekzat@justice.gov', password: 'password123', role: 'employee', department: 'Нотариальный отдел' }),
    User.create({ name: 'Дана Муратова', email: 'dana@justice.gov', password: 'password123', role: 'employee', department: 'Архив' }),
    User.create({ name: 'Наблюдатель', email: 'viewer@justice.gov', password: 'viewer123', role: 'viewer', department: 'Правовой отдел' }),
    User.create({ name: 'Канат Беков', email: 'kanat@mail.kz', password: 'citizen123', role: 'citizen', phone: '+7 701 123 4567' }),
  ]);
  console.log('Пользователи созданы');

  const admin = users[0];
  const emp1 = users[1];
  const emp2 = users[2];
  const citizen = users[5];

  const now = new Date();
  const appealData = [
    { citizenName: 'Канат Беков', citizenContact: '+7 701 123 4567', appealType: 'Правовой запрос', description: 'Прошу предоставить юридическую консультацию по вопросу имущественного спора.', status: 'Завершено', department: 'Правовой отдел', assignedTo: admin._id, assignedToName: admin.name, citizenUserId: citizen._id },
    { citizenName: 'Жанна Сейткали', citizenContact: '+7 702 234 5678', appealType: 'Запрос документов', description: 'Прошу выдать заверенную копию свидетельства о рождении для оформления визы.', status: 'В работе', department: 'Отдел ЗАГС', assignedTo: emp1._id, assignedToName: emp1.name },
    { citizenName: 'Марат Джаксыбеков', citizenContact: '+7 707 345 6789', appealType: 'Жалоба', description: 'Жалоба на задержку ответа на предыдущее обращение, поданное 30 дней назад.', status: 'На рассмотрении', department: 'Правовой отдел', assignedTo: admin._id, assignedToName: admin.name },
    { citizenName: 'Айнур Бекова', citizenContact: '+7 705 456 7890', appealType: 'Общий запрос', description: 'Запрашиваю информацию о размере нотариального тарифа и перечне необходимых документов.', status: 'Новое', department: 'Нотариальный отдел' },
    { citizenName: 'Руслан Ахметов', citizenContact: '+7 700 567 8901', appealType: 'Правовой запрос', description: 'Прошу проконсультировать по вопросам регистрации юридического лица.', status: 'Назначено', department: 'Правовой отдел', assignedTo: admin._id, assignedToName: admin.name },
    { citizenName: 'Салтанат Нурмагамбетова', citizenContact: '+7 701 678 9012', appealType: 'Запрос документов', description: 'Запрос архивных сведений о праве собственности на земельный участок (1995 г.).', status: 'Отклонено', department: 'Архив', assignedTo: users[3]._id, assignedToName: users[3].name },
    { citizenName: 'Ерлан Касымов', citizenContact: '+7 702 789 0123', appealType: 'Жалоба', description: 'Жалоба на наличие некорректных сведений в официальной записи реестра.', status: 'Новое', department: 'Отдел ЗАГС' },
    { citizenName: 'Гүлсім Токова', citizenContact: '+7 707 890 1234', appealType: 'Общий запрос', description: 'Вопросы о процедуре оформления наследственных документов.', status: 'В работе', department: 'Нотариальный отдел', assignedTo: emp2._id, assignedToName: emp2.name },
  ];

  for (let i = 0; i < appealData.length; i++) {
    const a = appealData[i];
    const deadline = new Date(now);
    deadline.setDate(deadline.getDate() + Math.floor(Math.random() * 20) - 5);
    const year = now.getFullYear();
    const appealNumber = `ОБ-${year}-${String(i + 1).padStart(4, '0')}`;
    await Appeal.create({
      ...a, deadline, appealNumber,
      createdBy: admin._id,
      createdByName: admin.name,
      history: [
        { status: 'Новое', changedBy: admin._id, changedByName: admin.name, note: 'Обращение зарегистрировано', date: new Date(now.getTime() - 86400000 * 5) },
        ...(a.status !== 'Новое' ? [{ status: a.status, changedBy: admin._id, changedByName: admin.name, note: 'Статус обновлён', date: new Date(now.getTime() - 86400000 * 2) }] : []),
      ],
      notifications: a.citizenUserId ? [{ message: `Статус изменён на: «${a.status}»`, read: false }] : [],
    });
  }
  console.log('Обращения созданы');

  const docData = [
    { title: 'Приказ № 45 — Ротация кадров II кв.', category: 'Приказ', description: 'Внутренний приказ о ротации сотрудников на II квартал 2024 года.', fromDepartment: 'Отдел кадров', toDepartment: 'Правовой отдел', status: 'Утверждён' },
    { title: 'Ежемесячный отчёт — Отдел ЗАГС', category: 'Отчёт', description: 'Статистический отчёт о деятельности отдела ЗАГС за март 2024 года.', fromDepartment: 'Отдел ЗАГС', toDepartment: 'Правовой отдел', status: 'Рассмотрен' },
    { title: 'Инструкция по архивированию документов', category: 'Инструкция', description: 'Обновлённые инструкции по архивированию в соответствии с новыми нормативными требованиями.', fromDepartment: 'Архив', toDepartment: 'Отдел ЗАГС', status: 'Передан в отдел' },
    { title: 'Протокол совещания — 15 апреля', category: 'Протокол', description: 'Официальный протокол межотраслевого координационного совещания.', fromDepartment: 'Правовой отдел', toDepartment: 'Отдел кадров', status: 'Создан' },
    { title: 'Уведомление: плановые технические работы', category: 'Уведомление', description: 'Уведомление о плановом техническом обслуживании информационных систем.', fromDepartment: 'Отдел кадров', toDepartment: 'Архив', status: 'Утверждён' },
    { title: 'Запрос о расширении штата — Правовой отдел', category: 'Запрос', description: 'Официальный запрос о выделении двух дополнительных юрисконсультов на III квартал.', fromDepartment: 'Правовой отдел', toDepartment: 'Отдел кадров', status: 'Передан в отдел' },
    { title: 'Годовой отчёт нотариального отдела 2023', category: 'Отчёт', description: 'Сводный годовой отчёт о деятельности нотариального отдела.', fromDepartment: 'Нотариальный отдел', toDepartment: 'Правовой отдел', status: 'В архиве' },
    { title: 'Приказ № 46 — Обновление тарифов', category: 'Приказ', description: 'Обновлённый прейскурант услуг нотариального отдела и отдела ЗАГС.', fromDepartment: 'Правовой отдел', toDepartment: 'Нотариальный отдел', status: 'Утверждён' },
  ];

  for (const d of docData) {
    const deadline = new Date(now);
    deadline.setDate(deadline.getDate() + Math.floor(Math.random() * 20) - 5);
    await Document.create({
      ...d, deadline,
      createdBy: admin._id, createdByName: admin.name,
      history: [
        { status: 'Создан', changedBy: admin._id, changedByName: admin.name, note: 'Документ создан', date: new Date(now.getTime() - 86400000 * 7) },
        ...(d.status !== 'Создан' ? [{ status: d.status, changedBy: admin._id, changedByName: admin.name, note: 'Статус обновлён', date: new Date(now.getTime() - 86400000 * 3) }] : []),
      ],
    });
  }
  console.log('Документы созданы');

  console.log('\n=== Инициализация завершена ===');
  console.log('Данные для входа:');
  console.log('  Администратор: admin@justice.gov / admin123');
  console.log('  Сотрудник:     asel@justice.gov / password123');
  console.log('  Наблюдатель:   viewer@justice.gov / viewer123');
  console.log('  Гражданин:     kanat@mail.kz / citizen123');

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
