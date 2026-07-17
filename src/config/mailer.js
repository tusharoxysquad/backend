const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const sendTransactionalEmail = async ({ to, toName, subject, html }) => {
  const payload = {
    sender: { name: process.env.EMAIL_FROM_NAME, email: process.env.EMAIL_FROM_EMAIL },
    to: [{ email: to, name: toName }],
    subject,
    htmlContent: html,
  };

  console.log('[Brevo] Sending email to:', to, '| Subject:', subject);
  console.log('[Brevo] BREVO_API_KEY set:', !!process.env.BREVO_API_KEY);
  console.log('[Brevo] EMAIL_FROM_EMAIL:', process.env.EMAIL_FROM_EMAIL);

  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('[Brevo] ERROR response:', res.status, body);
    throw new Error(`Brevo API error (${res.status}): ${body}`);
  }

  console.log('[Brevo] Email sent successfully to:', to);
};

module.exports = { sendTransactionalEmail };
