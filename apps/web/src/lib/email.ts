import { Resend } from 'resend';
import { buildVerificationEmail } from "@/lib/email-templates/verification-email";

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