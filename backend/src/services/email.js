const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

async function sendStatusUpdate(citizenEmail, citizenName, appealNumber, newStatus) {
  try {
    await transporter.sendMail({
      from: `"Министерство юстиции РК" <${process.env.GMAIL_USER}>`,
      to: citizenEmail,
      subject: `Обращение ${appealNumber} — статус изменён`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
          <div style="background:#1a3c5e;color:#fff;padding:20px 24px">
            <h2 style="margin:0;font-size:16px;font-weight:600">Министерство юстиции Республики Казахстан</h2>
            <p style="margin:4px 0 0;font-size:12px;opacity:.8">Система обработки обращений граждан</p>
          </div>
          <div style="padding:24px">
            <p style="margin:0 0 16px">Уважаемый(ая) <strong>${citizenName}</strong>,</p>
            <p style="margin:0 0 16px">Статус вашего обращения изменён.</p>
            <div style="background:#f4f6f9;border-left:4px solid #2563a8;padding:14px 18px;border-radius:0 6px 6px 0;margin-bottom:16px">
              <p style="margin:0 0 6px;font-size:13px;color:#6b7280">Номер обращения</p>
              <p style="margin:0 0 10px;font-size:18px;font-weight:700;color:#1a3c5e">${appealNumber}</p>
              <p style="margin:0 0 4px;font-size:13px;color:#6b7280">Новый статус</p>
              <p style="margin:0;font-size:16px;font-weight:600;color:#1d4ed8">${newStatus}</p>
            </div>
            <p style="margin:0;font-size:13px;color:#6b7280">Для получения подробной информации войдите в ваш <a href="http://localhost:5173/portal" style="color:#2563a8">личный кабинет</a>.</p>
          </div>
          <div style="background:#f9fafb;padding:14px 24px;text-align:center;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb">
            © 2024 Министерство юстиции Республики Казахстан
          </div>
        </div>
      `,
    });
    console.log(`📧 Email sent to ${citizenEmail}`);
  } catch (err) {
    console.error('Email error:', err.message);
  }
}

async function sendAppointmentConfirmation(citizenEmail, citizenName, department, dateStr, timeSlot) {
  try {
    await transporter.sendMail({
      from: `"Министерство юстиции РК" <${process.env.GMAIL_USER}>`,
      to: citizenEmail,
      subject: `Запись подтверждена — ${department}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
          <div style="background:#1a3c5e;color:#fff;padding:20px 24px">
            <h2 style="margin:0;font-size:16px;font-weight:600">Министерство юстиции Республики Казахстан</h2>
          </div>
          <div style="padding:24px">
            <p>Уважаемый(ая) <strong>${citizenName}</strong>,</p>
            <p>Ваша запись на приём <strong>подтверждена</strong>.</p>
            <div style="background:#f4f6f9;border-left:4px solid #16a34a;padding:14px 18px;border-radius:0 6px 6px 0;margin:16px 0">
              <p style="margin:0 0 6px"><strong>Отдел:</strong> ${department}</p>
              <p style="margin:0 0 6px"><strong>Дата:</strong> ${dateStr}</p>
              <p style="margin:0"><strong>Время:</strong> ${timeSlot}</p>
            </div>
            <p style="font-size:13px;color:#6b7280">Пожалуйста, приходите за 10 минут до назначенного времени с удостоверением личности.</p>
          </div>
          <div style="background:#f9fafb;padding:14px 24px;text-align:center;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb">
            © 2024 Министерство юстиции Республики Казахстан
          </div>
        </div>
      `,
    });
    console.log(`📧 Appointment confirmation sent to ${citizenEmail}`);
  } catch (err) {
    console.error('Email error:', err.message);
  }
}

module.exports = { sendStatusUpdate, sendAppointmentConfirmation };
