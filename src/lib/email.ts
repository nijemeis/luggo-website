/**
 * Transactional email. Uses Resend when RESEND_API_KEY is set, otherwise prints the
 * message to the server console so local development still shows what would be sent.
 * Same pipeline as nije3d, in Luggo's colours.
 */
export type Mail = { to: string; subject: string; html: string; text?: string; replyTo?: string };

export async function sendMail(mail: Mail): Promise<{ ok: boolean; id?: string; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Luggo <orders@luggo.net>";
  if (!key) {
    console.log(`\n📧 [email → ${mail.to}] ${mail.subject}\n${mail.text ?? stripHtml(mail.html)}\n`);
    return { ok: true, id: "console" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: mail.to, subject: mail.subject, html: mail.html, text: mail.text, reply_to: mail.replyTo }),
    });
    if (!res.ok) return { ok: false, error: `${res.status} ${await res.text()}` };
    const json = (await res.json()) as { id?: string };
    return { ok: true, id: json.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

function stripHtml(html: string): string {
  return html.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, "").replace(/\n{3,}/g, "\n\n").trim();
}

export function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Branded HTML wrapper: cream page, white card, coral accents, the app-icon mark. */
export function layout(title: string, bodyHtml: string, footer = "Luggo by The RO Brand · Leusden, The Netherlands"): string {
  return `<!doctype html><html><body style="margin:0;background:#faf7f2;font-family:Nunito,'Helvetica Neue',Helvetica,Arial,sans-serif;color:#2b2723">
  <div style="max-width:560px;margin:0 auto;padding:28px 20px">
    <table role="presentation" style="border-collapse:collapse"><tr>
      <td style="width:34px;height:34px;border-radius:10px;background:#e0805c;text-align:center;vertical-align:middle;color:#fff;font-weight:700;font-size:17px">L</td>
      <td style="padding-left:10px;font-weight:700;font-size:21px;letter-spacing:-0.3px">Luggo</td>
    </tr></table>
    <div style="border-radius:24px;background:#ffffff;padding:26px 26px 22px;margin-top:16px;box-shadow:0 10px 30px rgba(120,90,50,.08)">
      <h1 style="font-size:24px;line-height:1.15;margin:0 0 14px;letter-spacing:-0.3px">${title}</h1>
      ${bodyHtml}
    </div>
    <p style="font-size:12.5px;color:#8a8175;margin-top:18px;line-height:1.5">${footer}</p>
  </div></body></html>`;
}

export function p(text: string): string {
  return `<p style="font-size:15px;line-height:1.6;margin:0 0 12px;color:#6e6559">${text}</p>`;
}
export function button(href: string, label: string): string {
  return `<p style="margin:20px 0 6px"><a href="${href}" style="display:inline-block;background:#e0805c;color:#ffffff;border-radius:16px;padding:14px 24px;font-weight:700;text-decoration:none">${label}</a></p>`;
}
export function table(rows: [string, string][]): string {
  return `<table style="width:100%;border-collapse:collapse;font-size:14.5px;margin:10px 0 16px">${rows
    .map(([a, b]) => `<tr><td style="padding:7px 0;border-bottom:1px solid #efe7da">${a}</td><td style="padding:7px 0;border-bottom:1px solid #efe7da;text-align:right;font-weight:700;white-space:nowrap">${b}</td></tr>`)
    .join("")}</table>`;
}
