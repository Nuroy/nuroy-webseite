/**
 * ═══════════════════════════════════════════════════════════════
 * NUROY — LEAD-WEBHOOK PROXY (Vercel Serverless)
 * ═══════════════════════════════════════════════════════════════
 *
 * POST /api/lead
 * - nimmt den Rückruf-Lead vom Formular entgegen (same-origin, KEIN Secret im Client)
 * - hängt server-seitig den X-Webhook-Secret an
 * - leitet an das Cockpit weiter (cockpit.nuroy.de/api/webhook/leads)
 *
 * Secret NUR als Env-Var: LEAD_WEBHOOK_SECRET (nie im Repo / nie im Client).
 */

const COCKPIT_WEBHOOK = 'https://cockpit.nuroy.de/api/webhook/leads';

const BOT_PATTERNS = [
  'bot', 'crawl', 'spider', 'slurp', 'lighthouse',
  'pagespeed', 'pingdom', 'headlesschrome', 'phantomjs',
  'prerender', 'wget', 'curl', 'httpie'
];
const MAX_BODY_LENGTH = 2048;

function isBot(ua) {
  if (!ua) return true;
  var lower = ua.toLowerCase();
  return BOT_PATTERNS.some(function (p) { return lower.includes(p); });
}

function sanitize(value, maxLen) {
  if (value === null || value === undefined) return '';
  return String(value).substring(0, maxLen || 200).replace(/[\x00-\x1f]/g, '');
}

module.exports = async function handler(req, res) {
  // CORS (nur nuroy.de)
  res.setHeader('Access-Control-Allow-Origin', 'https://nuroy.de');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).end();

  // Bot-Filter
  if (isBot(req.headers['user-agent'] || '')) return res.status(204).end();

  // Body parsen
  var body;
  try {
    var raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (raw.length > MAX_BODY_LENGTH) return res.status(204).end();
    body = typeof req.body === 'object' && req.body !== null ? req.body : JSON.parse(raw);
  } catch (e) {
    return res.status(400).json({ ok: false, error: 'bad_body' });
  }

  // Pflichtfelder
  var name = sanitize(body.name, 120);
  var telefon = sanitize(body.telefon || body.phone, 60);
  if (!name || !telefon) {
    return res.status(400).json({ ok: false, error: 'name_and_telefon_required' });
  }
  var email = sanitize(body.email, 160);
  var anruf_zeit = sanitize(body.anruf_zeit || body.call_time, 20);

  // Secret NUR aus Env
  var secret = process.env.LEAD_WEBHOOK_SECRET;
  if (!secret) {
    console.error('LEAD_WEBHOOK_SECRET not configured');
    // 200 zurück, damit die Formular-UX nicht bricht (E-Mail ist der Fallback)
    return res.status(200).json({ ok: false, error: 'not_configured' });
  }

  // Ans Cockpit weiterleiten
  try {
    var r = await fetch(COCKPIT_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': secret
      },
      body: JSON.stringify({ name: name, telefon: telefon, email: email, anruf_zeit: anruf_zeit })
    });
    return res.status(r.ok ? 200 : 502).json({ ok: r.ok });
  } catch (e) {
    console.error('Cockpit webhook error:', e.message);
    return res.status(502).json({ ok: false, error: 'forward_failed' });
  }
};
