type VerificationEmailParams = {
  name?: string;
  verificationUrl: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildVerificationEmail({ name, verificationUrl }: VerificationEmailParams) {
  const safeName = escapeHtml((name || "there").split(" ")[0]);
  const safeUrl = escapeHtml(verificationUrl);

  const subject = "Verify your EquipRent account";

  const text = [
    `Hi ${safeName},`,
    "",
    "Welcome to EquipRent.",
    "Please verify your email address by opening the link below:",
    safeUrl,
    "",
    "If you did not create this account, you can ignore this email.",
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
      Verify your email to finish setting up your EquipRent account.
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b1020;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;">
            <tr>
              <td style="text-align:center;padding:0 0 14px 0;">
                <span style="display:inline-block;padding:6px 12px;border:1px solid #263044;border-radius:999px;background:#111827;color:#cbd5e1;font-size:12px;font-weight:600;letter-spacing:.02em;">
                  EquipRent · Email verification
                </span>
              </td>
            </tr>

            <tr>
              <td style="background:#111827;border:1px solid #263244;border-radius:16px;padding:30px;">
                <p style="margin:0 0 10px 0;font-size:15px;line-height:24px;color:#cbd5e1;">Hi ${safeName},</p>

                <h1 style="margin:0 0 12px 0;font-size:26px;line-height:34px;font-weight:700;color:#f8fafc;">
                  Confirm your email
                </h1>

                <p style="margin:0 0 22px 0;font-size:15px;line-height:24px;color:#94a3b8;">
                  Thanks for creating your EquipRent account. Click the button below to verify your email and continue.
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
                        Verify email
                      </a>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="background:#0f172a;border:1px solid #263244;border-radius:10px;padding:12px;">
                      <p style="margin:0 0 6px 0;font-size:12px;line-height:18px;color:#94a3b8;">
                        If the button doesn’t work, copy this link:
                      </p>
                      <p style="margin:0;word-break:break-all;font-size:13px;line-height:20px;">
                        <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" style="color:#93c5fd;text-decoration:underline;">
                          ${safeUrl}
                        </a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:14px 8px 0 8px;text-align:center;font-size:12px;line-height:18px;color:#94a3b8;">
                If this wasn’t you, you can safely ignore this email.
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