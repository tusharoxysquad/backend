const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Send a transactional email via Brevo's HTTP API
 * @param {{ to: string, toName: string, subject: string, html: string }} params
 */
const sendTransactionalEmail = async ({ to, toName, subject, html }) => {
  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: process.env.EMAIL_FROM_NAME, email: process.env.EMAIL_FROM_EMAIL },
      to: [{ email: to, name: toName }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo API error (${res.status}): ${body}`);
  }
};

module.exports = { sendTransactionalEmail };
