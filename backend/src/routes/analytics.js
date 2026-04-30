const router = require('express').Router();
const Appeal = require('../models/Appeal');
const Document = require('../models/Document');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/summary', async (req, res) => {
  try {
    const { from, to } = req.query;
    const dateFilter = {};
    if (from || to) {
      dateFilter.createdAt = {};
      if (from) dateFilter.createdAt.$gte = new Date(from);
      if (to) dateFilter.createdAt.$lte = new Date(to + 'T23:59:59');
    }

    const appealStatuses = ['Новое', 'Назначено', 'В работе', 'На рассмотрении', 'Завершено', 'Отклонено'];
    const docStatuses = ['Создан', 'Передан в отдел', 'Рассмотрен', 'Утверждён', 'В архиве'];

    const [appealCounts, docCounts, overdueAppeals, overdueDocs] = await Promise.all([
      Appeal.aggregate([{ $match: dateFilter }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Document.aggregate([{ $match: dateFilter }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Appeal.countDocuments({ ...dateFilter, deadline: { $lt: new Date() }, status: { $nin: ['Завершено', 'Отклонено'] } }),
      Document.countDocuments({ ...dateFilter, deadline: { $lt: new Date() }, status: { $nin: ['Утверждён', 'В архиве'] } }),
    ]);

    const appeals = {};
    appealStatuses.forEach(s => (appeals[s] = 0));
    appealCounts.forEach(({ _id, count }) => (appeals[_id] = count));

    const documents = {};
    docStatuses.forEach(s => (documents[s] = 0));
    docCounts.forEach(({ _id, count }) => (documents[_id] = count));

    res.json({
      appeals, documents,
      totalAppeals: Object.values(appeals).reduce((a, b) => a + b, 0),
      totalDocuments: Object.values(documents).reduce((a, b) => a + b, 0),
      overdueAppeals, overdueDocs,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/departments', async (req, res) => {
  try {
    const { from, to } = req.query;
    const dateFilter = {};
    if (from || to) {
      dateFilter.createdAt = {};
      if (from) dateFilter.createdAt.$gte = new Date(from);
      if (to) dateFilter.createdAt.$lte = new Date(to + 'T23:59:59');
    }

    const [appealsByDept, docsByDept] = await Promise.all([
      Appeal.aggregate([{ $match: dateFilter }, { $group: { _id: '$department', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Document.aggregate([{ $match: dateFilter }, { $group: { _id: '$fromDepartment', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    ]);
    res.json({ appealsByDept, docsByDept });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
