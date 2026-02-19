import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 587);
const SMTP_SECURE = String(process.env.SMTP_SECURE ?? 'false').toLowerCase() === 'true';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM;

function hasSmtpConfig(): boolean {
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS && EMAIL_FROM);
}

function createTransport() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

type SendEmailInput = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
};

export async function sendEmail(input: SendEmailInput): Promise<{ ok: boolean; error?: string }> {
  if (!hasSmtpConfig()) {
    return { ok: false, error: 'SMTP email not configured' };
  }

  try {
    const transporter = createTransport();
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Email send failed' };
  }
}
