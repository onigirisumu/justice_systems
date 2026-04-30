const router = require('express').Router();
const Appointment = require('../models/Appointment');
const { protect, requireRole } = require('../middleware/auth');
const { sendAppointmentConfirmation } = require('../services/email');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { status, department, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (req.user.role === 'citizen') filter.citizenUserId = req.user._id;
    if (status) filter.status = status;
    if (department) filter.department = department;

    const total = await Appointment.countDocuments(filter);
    const appointments = await Appointment.find(filter)
      .sort({ date: 1, timeSlot: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ appointments, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Запись не найдена' });
    if (req.user.role === 'citizen' && String(appt.citizenUserId) !== String(req.user._id))
      return res.status(403).json({ message: 'Нет доступа' });
    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    if (req.user.role === 'citizen') {
      const { department, date, timeSlot, purpose } = req.body;
      const appt = await Appointment.create({
        citizenUserId: req.user._id,
        citizenName: req.user.name,
        citizenEmail: req.user.email,
        citizenPhone: req.user.phone || '',
        department, date, timeSlot, purpose,
      });
      return res.status(201).json(appt);
    }
    const appt = await Appointment.create(req.body);
    res.status(201).json(appt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Запись не найдена' });

    if (req.user.role === 'citizen') {
      if (String(appt.citizenUserId) !== String(req.user._id))
        return res.status(403).json({ message: 'Нет доступа' });
      if (!['Запланировано'].includes(appt.status))
        return res.status(400).json({ message: 'Невозможно изменить запись с текущим статусом' });
      if (req.body.status === 'Отменено') {
        appt.status = 'Отменено';
        await appt.save();
        return res.json(appt);
      }
      return res.status(403).json({ message: 'Нет доступа' });
    }

    const prevStatus = appt.status;
    Object.assign(appt, req.body);
    await appt.save();

    if (req.body.status === 'Подтверждено' && prevStatus !== 'Подтверждено') {
      const dateStr = new Date(appt.date).toLocaleDateString('ru-RU');
      sendAppointmentConfirmation(appt.citizenEmail, appt.citizenName, appt.department, dateStr, appt.timeSlot);
    }

    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Удалено' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
