const nodemailer = require('nodemailer');

const getTransporter = async () => {
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

  // Fallback: Create dynamic Ethereal test SMTP account on the fly
  try {
    console.log('SMTP config not provided. Creating dynamic Ethereal test SMTP account...');
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  } catch (err) {
    console.error('Failed to create Ethereal test account:', err);
    return null;
  }
};

// Send notifications template email
const sendNotificationEmail = async (to, subject, text, html) => {
  try {
    const transporter = await getTransporter();

    if (transporter) {
      const fromEmail = process.env.SMTP_FROM_EMAIL || 'no-reply@joygurutravels.com';
      const info = await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'Joy Guru Travels'}" <${fromEmail}>`,
        to,
        subject,
        text,
        html
      });
      console.log(`Notification email sent successfully: ${info.messageId}`);
      
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`Ethereal Test Mail Preview URL: ${previewUrl}`);
      }
      return true;
    }
  } catch (err) {
    console.error('Nodemailer send email failure:', err);
  }
  return false;
};

module.exports = { sendNotificationEmail };
