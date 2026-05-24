import { Resend } from 'resend';
import { buildVerificationEmail } from './email-templates/verification-email';
import { buildPasswordResetEmail } from './email-templates/reset-password';

const from = 'EquipRent <onboarding@equiprent.me>';

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  return new Resend(apiKey);
}

export async function sendVerificationEmail(
  to: string,
  verificationUrl: string,
  name?: string | null,
) {
  const template = buildVerificationEmail({
    name: name ?? undefined,
    verificationUrl,
  });

  const { error } = await getResend().emails.send({
    from,
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });

  if (error) {
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
}

export async function sendResetPasswordEmail(
  to: string,
  resetUrl: string,
  name?: string | null,
) {
  const template = buildPasswordResetEmail({
    name: name ?? undefined,
    resetUrl,
  });

  const { error } = await getResend().emails.send({
    from,
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });

  if (error) {
    throw new Error(`Failed to send reset password email: ${error.message}`);
  }
}
