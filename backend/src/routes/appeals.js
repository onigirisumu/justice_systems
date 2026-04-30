const router = require('express').Router();
const Appeal = require('../models/Appeal');
const User = require('../models/User');
const { protect, requireRole } = require('../middleware/auth');
const { sendStatusUpdate } = require('../services/email');

async function generateAppealNumber() {
  const year = new Date().getFullYear();
  const count = await Appeal.countDocuments({ appealNumber: { $regex: `^ОБ-${year}-` } });
  return `ОБ-${year}-${String(count + 1).padStart(4, '0')}`;
}

// Public — no auth
router.get('/track/:number', async (req, res) => {
  try {
    const appeal = await Appeal.findOne({ appealNumber: req.params.number });
    if (!appeal) return res.status(404).json({ message: 'Обращение не найдено. Проверьте номер.' });
    res.json({
      appealNumber: appeal.appealNumber,
      status: appeal.status,
      appealType: appeal.appealType,
      department: appeal.department,
      createdAt: appeal.createdAt,
      deadline: appeal.deadline,
      history: appeal.history.map(h => ({ status: h.status, date: h.date, note: h.note })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { status, department, search, page = 1, limit = 10, from, to } = req.query;
    const filter = {};

    if (req.user.role === 'citizen') filter.citizenUserId = req.user._id;
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to + 'T23:59:59');
    }
    if (search) filter.$or = [
      { citizenName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { appealType: { $regex: search, $options: 'i' } },
      { appealNumber: { $regex: search, $options: 'i' } },
    ];

    const total = await Appeal.countDocuments(filter);
    const appeals = await Appeal.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ appeals, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/export', async (req, res) => {
  try {
    const { status, department, from, to } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to + 'T23:59:59');
    }
    const appeals = await Appeal.find(filter).sort({ createdAt: -1 }).limit(1000);
    res.json(appeals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const appeal = await Appeal.findById(req.params.id);
    if (!appeal) return res.status(404).json({ message: 'Обращение не найдено' });
    if (req.user.role === 'citizen' && String(appeal.citizenUserId) !== String(req.user._id))
      return res.status(403).json({ message: 'Нет доступа' });
    res.json(appeal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const appealNumber = await generateAppealNumber();
    let data = { ...req.body, appealNumber };

    if (req.user.role === 'citizen') {
      data.citizenName = req.user.name;
      data.citizenContact = req.user.phone || req.user.email;
      data.citizenUserId = req.user._id;
      data.department = req.body.department || 'Правовой отдел';
    }

    const appeal = await Appeal.create({
      ...data,
      createdBy: req.user._id,
      createdByName: req.user.name,
      history: [{ status: 'Новое', changedBy: req.user._id, changedByName: req.user.name, note: 'Обращение зарегистрировано' }],
    });
    res.status(201).json(appeal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const appeal = await Appeal.findById(req.params.id);
    if (!appeal) return res.status(404).json({ message: 'Обращение не найдено' });
    if (req.user.role === 'citizen') return res.status(403).json({ message: 'Нет доступа' });

    const { status, note, ...rest } = req.body;
    Object.assign(appeal, rest);

    if (status && status !== appeal.status) {
      appeal.status = status;
      appeal.history.push({ status, note: note || '', changedBy: req.user._id, changedByName: req.user.name });

      if (appeal.citizenUserId) {
        appeal.notifications.push({ message: `Статус изменён на: «${status}»` });
        const citizen = await User.findById(appeal.citizenUserId).select('email name');
        if (citizen?.email) {
          sendStatusUpdate(citizen.email, citizen.name, appeal.appealNumber, status);
        }
      }
    }

    await appeal.save();
    res.json(appeal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/comments', async (req, res) => {
  try {
    if (req.user.role === 'citizen') return res.status(403).json({ message: 'Нет доступа' });
    const appeal = await Appeal.findById(req.params.id);
    if (!appeal) return res.status(404).json({ message: 'Обращение не найдено' });
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Текст комментария обязателен' });

    appeal.comments.push({ text: text.trim(), author: req.user._id, authorName: req.user.name });
    await appeal.save();
    res.json(appeal.comments[appeal.comments.length - 1]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id/comments/:commentId', requireRole('admin'), async (req, res) => {
  try {
    const appeal = await Appeal.findById(req.params.id);
    if (!appeal) return res.status(404).json({ message: 'Не найдено' });
    appeal.comments = appeal.comments.filter(c => String(c._id) !== req.params.commentId);
    await appeal.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/read-notifications', async (req, res) => {
  try {
    const appeal = await Appeal.findById(req.params.id);
    if (!appeal) return res.status(404).json({ message: 'Не найдено' });
    if (String(appeal.citizenUserId) !== String(req.user._id))
      return res.status(403).json({ message: 'Нет доступа' });
    appeal.notifications.forEach(n => { n.read = true; });
    await appeal.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    const appeal = await Appeal.findByIdAndDelete(req.params.id);
    if (!appeal) return res.status(404).json({ message: 'Обращение не найдено' });
    res.json({ message: 'Удалено' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
