const nodemailer = require('nodemailer');

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const isConfigured = host && port && user && pass && 
                      user !== 'dummy' && user !== 'dummy_user' &&
                      host !== 'smtp.mailtrap.io'; // mailtrap default placeholder

  if (!isConfigured) {
    console.warn('[SMTP WARNING] Nodemailer SMTP configuration is missing or holds dummy keys. Email delivery will be skipped.');
    return null;
  }

  try {
    return nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: parseInt(port) === 465,
      auth: { user, pass }
    });
  } catch (err) {
    console.error('SMTP configuration error:', err);
    return null;
  }
};

// Send notifications template email
const sendNotificationEmail = async (to, subject, text, html) => {
  const transporter = getTransporter();

  if (!transporter) {
    console.warn(`[EMAIL BLOCKED] Unable to send email to ${to}. Reason: SMTP server configuration is missing.`);
    return false;
  }

  try {
    const fromEmail = process.env.SMTP_FROM_EMAIL || 'no-reply@joygurutravels.com';
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Joy Guru Travels'}" <${fromEmail}>`,
      to,
      subject,
      text,
      html
    });
    console.log(`Notification email sent successfully: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error('Nodemailer send email failure:', err);
    return false;
  }
};

module.exports = { sendNotificationEmail };
