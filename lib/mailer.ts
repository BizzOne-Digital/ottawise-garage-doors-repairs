import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

/**
 * SMTP email notifications. Configure with SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS,
 * plus NOTIFY_EMAIL (recipient) and MAIL_FROM (sender). For Gmail, use an App Password.
 * Returns "not-configured" when SMTP is not set up, so form submissions still save.
 */
export function mailConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.NOTIFY_EMAIL);
}

let transporter: Transporter | null = null;
function getTransport() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 465);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

export const escapeHtml = (v: unknown) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Strips CR/LF so user input can never inject email headers. */
const oneLine = (v: string) => v.replace(/[\r\n]+/g, " ").slice(0, 200);

export async function sendNotification(opts: { subject: string; rows: [string, string][]; replyTo?: string }): Promise<"sent" | "failed" | "not-configured"> {
  if (!mailConfigured()) return "not-configured";
  const html = `
    <div style="font-family:Arial,sans-serif;color:#102331;max-width:600px">
      <h2 style="margin:0 0 12px">${escapeHtml(opts.subject)}</h2>
      <table cellpadding="8" style="border-collapse:collapse;width:100%;font-size:14px">
        ${opts.rows.map(([k, v]) => `<tr><td style="border:1px solid #E6E1D9;background:#F3EDE3;font-weight:bold;width:35%;vertical-align:top">${escapeHtml(k)}</td><td style="border:1px solid #E6E1D9;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`).join("")}
      </table>
      <p style="font-size:12px;color:#414854;margin-top:16px">Sent from the website. Manage this request in the admin dashboard.</p>
    </div>`;
  const text = opts.rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  try {
    await getTransport().sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: process.env.NOTIFY_EMAIL,
      replyTo: opts.replyTo ? oneLine(opts.replyTo) : undefined,
      subject: oneLine(opts.subject),
      text,
      html,
    });
    return "sent";
  } catch (e) {
    console.error("[mailer] send failed:", (e as Error).message);
    return "failed";
  }
}
