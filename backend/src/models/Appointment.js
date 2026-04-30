const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  citizenUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  citizenName: { type: String, required: true },
  citizenEmail: { type: String, required: true },
  citizenPhone: { type: String, default: '' },
  department: { type: String, required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  purpose: { type: String, required: true },
  status: {
    type: String,
    enum: ['Запланировано', 'Подтверждено', 'Завершено', 'Отменено'],
    default: 'Запланировано',
  },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
