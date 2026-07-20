const logger = require('../utils/logger');

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const sendTransactionalEmail = async ({ to, toName, subject, html }) => {
  if (!process.env.BREVO_API_KEY || !process.env.EMAIL_FROM_EMAIL) {
    logger.error(
      `[Brevo] Missing mailer config — BREVO_API_KEY set: ${!!process.env.BREVO_API_KEY}, EMAIL_FROM_EMAIL set: ${!!process.env.EMAIL_FROM_EMAIL}`
    );
  }

  const payload = {
    sender: { name: process.env.EMAIL_FROM_NAME, email: process.env.EMAIL_FROM_EMAIL },
    to: [{ email: to, name: toName }],
    subject,
    htmlContent: html,
  };

  logger.info(`[Brevo] Sending email to: ${to} | Subject: ${subject}`);

  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const body = await res.text();

  if (!res.ok) {
    logger.error(`[Brevo] ERROR response for ${to}: ${res.status} ${body}`);
    throw new Error(`Brevo API error (${res.status}): ${body}`);
  }

  const messageId = (() => {
    try {
      return JSON.parse(body).messageId;
    } catch {
      return undefined;
    }
  })();
  logger.info(`[Brevo] Email accepted for ${to}${messageId ? ` | messageId: ${messageId}` : ''}`);
};

module.exports = { sendTransactionalEmail };
