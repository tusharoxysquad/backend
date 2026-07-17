const { sendTransactionalEmail } = require('../config/mailer');

/**
 * Send an OTP verification email
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

/**
 * Send a welcome email with login credentials + OTP for account creation
 * @param {string} to
 * @param {string} name
 * @param {string} password - plaintext password
 * @param {string} otp - plaintext OTP
 * @param {string} loginUrl - role-specific login URL
 * @param {string} role - 'ADMIN' | 'EMPLOYEE'
 */
const sendWelcomeEmail = async (to, name, password, otp, loginUrl, role) => {
  const roleLabel = role === 'ADMIN' ? 'Admin' : 'Employee';
  await sendTransactionalEmail({
    to,
    toName: name,
    subject: `Welcome to AttendTrack — Your ${roleLabel} Account is Ready`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #0F0F10;">
        <div style="background: #0F0F10; padding: 24px 32px; border-radius: 12px 12px 0 0;">
          <h2 style="color: #fff; margin: 0; font-size: 20px;">Welcome to AttendTrack 👋</h2>
        </div>
        <div style="background: #F9FAFB; padding: 32px; border: 1px solid #E2E8F0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="margin: 0 0 16px;">Hi <strong>${name}</strong>,</p>
          <p style="margin: 0 0 24px; color: #555;">Your <strong>${roleLabel}</strong> account has been created. Here are your login credentials:</p>

          <div style="background: #fff; border: 1px solid #E2E8F0; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #94A1B8; width: 110px;">Email</td>
                <td style="padding: 8px 0; font-weight: 600;">${to}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94A1B8;">Password</td>
                <td style="padding: 8px 0; font-weight: 600; font-family: monospace; letter-spacing: 1px;">${password}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94A1B8;">Role</td>
                <td style="padding: 8px 0; font-weight: 600;">${roleLabel}</td>
              </tr>
            </table>
          </div>

          <p style="margin: 0 0 12px; color: #555;">Use the OTP below to verify your email before logging in:</p>
          <div style="background: #0F0F10; border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <p style="margin: 0 0 4px; font-size: 12px; color: rgba(255,255,255,0.5); letter-spacing: 1px; text-transform: uppercase;">One-Time Password</p>
            <h2 style="margin: 0; color: #fff; font-size: 32px; letter-spacing: 8px; font-family: monospace;">${otp}</h2>
            <p style="margin: 8px 0 0; font-size: 11px; color: rgba(255,255,255,0.4);">Expires in 10 minutes</p>
          </div>

          <a href="${loginUrl}" style="display: inline-block; background: #0F0F10; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; border: 2px solid #0F0F10;">Go to Login →</a>

          <p style="margin: 24px 0 0; font-size: 12px; color: #94A1B8;">Please change your password after your first login. If you did not expect this email, please contact your administrator.</p>
        </div>
      </div>
    `,
  });
};

module.exports = { sendOtpEmail, sendWelcomeEmail };
