const router = require('express').Router();
const Document = require('../models/Document');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];

    const total = await Document.countDocuments(filter);
    const documents = await Document.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ documents, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Документ не найден' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, category, description, fromDepartment, toDepartment, deadline } = req.body;
    const doc = await Document.create({
      title, category, description, fromDepartment, toDepartment, deadline,
      createdBy: req.user._id,
      createdByName: req.user.name,
      history: [{ status: 'Создан', changedBy: req.user._id, changedByName: req.user.name, note: 'Документ создан' }],
    });
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Документ не найден' });

    const { status, note, ...rest } = req.body;
    Object.assign(doc, rest);

    if (status && status !== doc.status) {
      doc.status = status;
      doc.history.push({ status, note: note || '', changedBy: req.user._id, changedByName: req.user.name });
    }

    await doc.save();
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    const doc = await Document.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Документ не найден' });
    res.json({ message: 'Удалено' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
