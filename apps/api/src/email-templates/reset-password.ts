type PasswordResetEmailParams = {
  name?: string;
  resetUrl: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildPasswordResetEmail({ name, resetUrl }: PasswordResetEmailParams) {
  const safeName = escapeHtml((name || "there").split(" ")[0]);
  const safeUrl = escapeHtml(resetUrl);

  const subject = "Reset your EquipRent password";

  const text = [
    `Hi ${safeName},`,
    "",
    "We received a request to reset your EquipRent password.",
    "Please reset your password by opening the link below:",
    resetUrl,
    "",
    "This link will expire in 1 hour.",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;background:#0b1020;color:#e5e7eb;font-family:Inter,Segoe UI,Roboto,Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      Reset your EquipRent account password.
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b1020;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;">
            <tr>
              <td style="text-align:center;padding:0 0 14px 0;">
                <span style="display:inline-block;padding:6px 12px;border:1px solid #263044;border-radius:999px;background:#111827;color:#cbd5e1;font-size:12px;font-weight:600;letter-spacing:.02em;">
                  EquipRent · Password reset
                </span>
              </td>
            </tr>

            <tr>
              <td style="background:#111827;border:1px solid #263244;border-radius:16px;padding:30px;">
                <p style="margin:0 0 10px 0;font-size:15px;line-height:24px;color:#cbd5e1;">Hi ${safeName},</p>

                <h1 style="margin:0 0 12px 0;font-size:26px;line-height:34px;font-weight:700;color:#f8fafc;">
                  Reset your password
                </h1>

                <p style="margin:0 0 22px 0;font-size:15px;line-height:24px;color:#94a3b8;">
                  We received a request to reset your password. Click the button below to create a new password.
                </p>

                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 18px 0;">
                  <tr>
                    <td style="border-radius:10px;background:#f8fafc;">
                      <a
                        href="${safeUrl}"
                        target="_blank"
                        rel="noopener noreferrer"
                        style="display:inline-block;padding:12px 20px;font-size:14px;font-weight:700;line-height:20px;color:#0f172a;text-decoration:none;"
                      >
                        Reset password
                      </a>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="background:#0f172a;border:1px solid #263244;border-radius:10px;padding:12px;">
                      <p style="margin:0 0 6px 0;font-size:12px;line-height:18px;color:#94a3b8;">
                        If the button doesn't work, copy this link:
                      </p>
                      <p style="margin:0;word-break:break-all;font-size:13px;line-height:20px;">
                        <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" style="color:#93c5fd;text-decoration:underline;">
                          ${safeUrl}
                        </a>
                      </p>
                    </td>
                  </tr>
                </table>

                <p style="margin:18px 0 0 0;font-size:12px;line-height:18px;color:#94a3b8;">
                  This link will expire in 1 hour.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:14px 8px 0 8px;text-align:center;font-size:12px;line-height:18px;color:#94a3b8;">
                If you didn't request this, you can safely ignore this email.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html, text };
}