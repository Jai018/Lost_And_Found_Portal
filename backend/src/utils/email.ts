import nodemailer from 'nodemailer';

// ── Create reusable transporter ──────────────────────────────────────────────
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,          // STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// ── Send Password Reset Email ────────────────────────────────────────────────
export const sendPasswordResetEmail = async (
  toEmail: string,
  userName: string,
  resetToken: string
) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl    = `${frontendUrl}/reset-password?token=${resetToken}`;

  const transporter = createTransporter();

  const mailOptions = {
    from: `"FindIt Campus Portal" <${process.env.SMTP_USER}>`,
    to:   toEmail,
    subject: '🔑 Reset Your FindIt Password',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="540" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1 0%,#4f46e5 100%);padding:36px 40px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;">
                <div style="width:44px;height:44px;background:rgba(255,255,255,0.2);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;">
                  <span style="font-size:22px;">🔍</span>
                </div>
                <span style="color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">FindIt</span>
              </div>
              <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:13px;letter-spacing:0.5px;">CAMPUS LOST & FOUND PORTAL</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1e293b;">Hi ${userName}! 👋</h1>
              <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">
                We received a request to reset the password for your FindIt account. 
                Click the button below to set a new password.
              </p>

              <!-- CTA Button -->
              <div style="text-align:center;margin:32px 0;">
                <a href="${resetUrl}" 
                   style="display:inline-block;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;padding:16px 40px;border-radius:12px;letter-spacing:0.2px;">
                  Reset My Password
                </a>
              </div>

              <!-- Expiry notice -->
              <div style="background:#fef9ec;border:1px solid #fde68a;border-radius:10px;padding:14px 18px;margin-bottom:24px;">
                <p style="margin:0;font-size:13px;color:#92400e;">
                  ⏰ <strong>This link expires in 1 hour.</strong> If you didn't request this, you can safely ignore this email.
                </p>
              </div>

              <!-- Raw link fallback -->
              <p style="font-size:12px;color:#94a3b8;line-height:1.6;word-break:break-all;">
                If the button doesn't work, copy and paste this link:<br/>
                <a href="${resetUrl}" style="color:#6366f1;">${resetUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                © ${new Date().getFullYear()} FindIt Campus Portal &nbsp;·&nbsp; 
                This is an automated message, please do not reply.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };

  await transporter.sendMail(mailOptions);
};
