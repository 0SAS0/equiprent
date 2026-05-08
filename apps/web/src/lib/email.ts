import { Resend } from 'resend';
import { buildVerificationEmail } from "@/lib/email-templates/verification-email";
import { buildPasswordResetEmail } from './email-templates/reset-password';

export async function sendEmail(to: string, verificationUrl: string, name?: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Resend API key is not configured");
  }
  const resend = new Resend(apiKey);



  const template = buildVerificationEmail({ name, verificationUrl });

  const { error } = await resend.emails.send({
    from: "EquipRent <onboarding@equiprent.me>",
    to: [to],
    subject: template.subject,
    html: template.html,
    text: template.text,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}
export async function sendResetPasswordEmail(to: string, resetUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Resend API key is not configured");
  }
  const resend = new Resend(apiKey);

  const template = buildPasswordResetEmail({ resetUrl });

  const { error } = await resend.emails.send({
    from: "EquipRent <onboarding@equiprent.me>",
    to: [to],
    subject: template.subject,
    html: template.html,
    text: template.text,
  });


  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}