const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  message: String,
  date: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

const historySchema = new mongoose.Schema({
  status: String,
  note: String,
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  changedByName: String,
  date: { type: Date, default: Date.now },
});

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: String,
  createdAt: { type: Date, default: Date.now },
});

const appealSchema = new mongoose.Schema({
  appealNumber: { type: String, unique: true },
  citizenName: { type: String, required: true, trim: true },
  citizenContact: { type: String, required: true },
  appealType: {
    type: String,
    enum: ['Общий запрос', 'Жалоба', 'Правовой запрос', 'Запрос документов', 'Другое'],
    required: true,
  },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['Новое', 'Назначено', 'В работе', 'На рассмотрении', 'Завершено', 'Отклонено'],
    default: 'Новое',
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedToName: String,
  department: { type: String, required: true },
  deadline: { type: Date },
  citizenUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notifications: [notificationSchema],
  history: [historySchema],
  comments: [commentSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdByName: String,
}, { timestamps: true });

module.exports = mongoose.model('Appeal', appealSchema);
