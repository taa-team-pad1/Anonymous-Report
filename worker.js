const RECIPIENT_EMAIL = "birolyb@amazon.com";
const SENDER_EMAIL = "hinweisgebersystem@taa-team.de";
const SENDER_NAME = "TAA-Team Hinweisgebersystem";

const ALLOWED_ORIGINS = [
  "https://taa-team-pad1.github.io",
  "https://birolyb.github.io",
  "http://localhost",
  "null"
];

export default {
  async fetch(request) {
    const origin = request.headers.get("Origin") || "";
    const corsHeaders = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }

    try {
      const data = await request.json();
      const { id, login, category, urgency, description, photoCount, timestamp } = data;

      if (!id || !login || !category || !description) {
        return new Response(JSON.stringify({ error: "Fehlende Pflichtfelder" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const urgencyColors = { high: "#d32f2f", medium: "#f57c00", low: "#388e3c" };
      const urgencyLabels = { high: "HOCH", medium: "Mittel", low: "Niedrig" };
      const urgencyColor = urgencyColors[urgency] || urgencyColors.medium;
      const urgencyLabel = urgencyLabels[urgency] || "Mittel";

      const dateFormatted = new Date(timestamp).toLocaleString("de-DE", {
        timeZone: "Europe/Berlin",
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit"
      });

      const htmlEmail = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:24px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
<tr><td style="background:#232f3e;padding:20px 32px">
<table width="100%"><tr>
<td><span style="color:#ff9900;font-weight:700;font-size:18px">TAA-Team</span><span style="color:#fff;font-size:13px;margin-left:12px;opacity:.85">Hinweisgebersystem</span></td>
<td align="right"><span style="background:${urgencyColor};color:#fff;padding:4px 12px;border-radius:4px;font-size:12px;font-weight:600">${urgencyLabel}</span></td>
</tr></table>
</td></tr>
<tr><td style="padding:28px 32px 0">
<h1 style="margin:0;font-size:20px;color:#1a1a2e">Neue Meldung eingegangen</h1>
<p style="margin:6px 0 0;color:#666;font-size:14px">Referenz: <strong style="font-family:monospace;color:#1a1a2e">${id}</strong></p>
</td></tr>
<tr><td style="padding:24px 32px">
<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8e8e8;border-radius:6px;overflow:hidden">
<tr style="background:#f8f9fa"><td style="padding:10px 16px;font-size:13px;color:#666;width:140px;border-bottom:1px solid #e8e8e8">Eingegangen</td><td style="padding:10px 16px;font-size:13px;color:#333;border-bottom:1px solid #e8e8e8">${dateFormatted}</td></tr>
<tr><td style="padding:10px 16px;font-size:13px;color:#666;border-bottom:1px solid #e8e8e8">Login / Alias</td><td style="padding:10px 16px;font-size:13px;color:#333;font-weight:600;border-bottom:1px solid #e8e8e8">${login}</td></tr>
<tr style="background:#f8f9fa"><td style="padding:10px 16px;font-size:13px;color:#666;border-bottom:1px solid #e8e8e8">Kategorie</td><td style="padding:10px 16px;font-size:13px;color:#333;border-bottom:1px solid #e8e8e8">${category}</td></tr>
<tr><td style="padding:10px 16px;font-size:13px;color:#666;border-bottom:1px solid #e8e8e8">Dringlichkeit</td><td style="padding:10px 16px;font-size:13px;border-bottom:1px solid #e8e8e8"><span style="color:${urgencyColor};font-weight:600">${urgencyLabel}</span></td></tr>
<tr style="background:#f8f9fa"><td style="padding:10px 16px;font-size:13px;color:#666">Fotos</td><td style="padding:10px 16px;font-size:13px;color:#333">${photoCount || 0} Datei(en)</td></tr>
</table>
</td></tr>
<tr><td style="padding:0 32px 28px">
<div style="background:#f8f9fa;border-radius:6px;padding:16px;border-left:4px solid #232f3e">
<p style="margin:0 0 8px;font-size:12px;color:#666;font-weight:600;text-transform:uppercase;letter-spacing:.5px">Beschreibung</p>
<p style="margin:0;font-size:14px;color:#333;line-height:1.6;white-space:pre-wrap">${description}</p>
</div>
</td></tr>
<tr><td style="background:#f8f9fa;padding:16px 32px;border-top:1px solid #e8e8e8">
<p style="margin:0;font-size:11px;color:#888;text-align:center">Diese Meldung wurde ueber das anonyme Hinweisgebersystem (HinSchG) eingereicht.<br>Bitte behandeln Sie diese Information vertraulich.</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;

      const mailRequest = {
        personalizations: [{
          to: [{ email: RECIPIENT_EMAIL }],
          subject: "[" + urgencyLabel.toUpperCase() + "] Meldung " + id + ": " + category,
        }],
        from: { email: SENDER_EMAIL, name: SENDER_NAME },
        content: [
          { type: "text/plain", value: "Neue Meldung " + id + "\nKategorie: " + category + "\nVon: " + login + "\nDringlichkeit: " + urgencyLabel + "\n\n" + description },
          { type: "text/html", value: htmlEmail }
        ],
      };

      const mailResponse = await fetch("https://api.mailchannels.net/tx/v1/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mailRequest),
      });

      if (!mailResponse.ok && mailResponse.status !== 202) {
        return new Response(JSON.stringify({ error: "Email-Versand fehlgeschlagen" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify({ success: true, id: id }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: "Interner Fehler" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};
