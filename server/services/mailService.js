const nodemailer = require('nodemailer');

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && port && user && pass && user !== 'dummy') {
    try {
      return nodemailer.createTransport({
        host,
        port: parseInt(port),
        secure: parseInt(port) === 465,
        auth: { user, pass }
      });
    } catch (err) {
      console.error('SMTP configuration error:', err);
    }
  }
  return null;
};

// Send notifications template email
const sendNotificationEmail = async (to, subject, text, html) => {
  const transporter = getTransporter();

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'Joy Guru Travels'}" <${process.env.SMTP_FROM_EMAIL || 'no-reply@joygurutravels.com'}>`,
        to,
        subject,
        text,
        html
      });
      console.log(`Notification email sent successfully: ${info.messageId}`);
      return true;
    } catch (err) {
      console.error('Nodemailer send email failure:', err);
    }
  } else {
    // Stub console logger for development / offline testing
    console.log(`[EMAIL NOTIFICATION STUB]
To: ${to}
Subject: ${subject}
Message: ${text}
------------------------`);
  }
  return false;
};

module.exports = { sendNotificationEmail };
