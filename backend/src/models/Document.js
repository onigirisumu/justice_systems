const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  status: String,
  note: String,
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  changedByName: String,
  date: { type: Date, default: Date.now },
});

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['Приказ', 'Инструкция', 'Отчёт', 'Запрос', 'Уведомление', 'Протокол', 'Другое'],
    required: true,
  },
  description: { type: String, required: true },
  fromDepartment: { type: String, required: true },
  toDepartment: { type: String, required: true },
  status: {
    type: String,
    enum: ['Создан', 'Передан в отдел', 'Рассмотрен', 'Утверждён', 'В архиве'],
    default: 'Создан',
  },
  deadline: { type: Date },
  history: [historySchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdByName: String,
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
