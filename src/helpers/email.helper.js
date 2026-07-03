const { sendTransactionalEmail } = require('../config/mailer');

/**
 * Send an OTP verification email
 * @param {string} to - recipient email
 * @param {string} name - recipient name
 * @param {string} otp - plaintext OTP to embed in the email
 */
const sendOtpEmail = async (to, name, otp) => {
  await sendTransactionalEmail({
    to,
    toName: name,
    subject: 'Verify your email — OTP inside',
    html: `
      <p>Hi ${name},</p>
      <p>Your one-time verification code is:</p>
      <h2 style="letter-spacing: 4px;">${otp}</h2>
      <p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
    `,
  });
};

module.exports = { sendOtpEmail };
