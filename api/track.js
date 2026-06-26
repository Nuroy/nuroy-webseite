/**
 * ═══════════════════════════════════════════════════════════════
 * NUROY FUNNEL — ANALYTICS ENDPOINT (Vercel Serverless)
 * ═══════════════════════════════════════════════════════════════
 *
 * POST /api/track
 * - Bot-Filter
 * - Land aus Vercel-Header
 * - Weiterleitung an Google Sheets Webhook
 */

const BOT_PATTERNS = [
  'bot', 'crawl', 'spider', 'slurp', 'lighthouse',
  'pagespeed', 'pingdom', 'headlesschrome', 'phantomjs',
  'prerender', 'wget', 'curl', 'httpie'
];

const REQUIRED_FIELDS = ['page', 'device', 'browser'];
const MAX_BODY_LENGTH = 4096;

// Erwartete Felder im Payload (in Sheet-Spaltenreihenfolge)
const FIELD_ORDER = [
  'date', 'time', 'page', 'device', 'browser', 'os',
  'referrer', 'utm_source', 'utm_medium', 'utm_campaign',
  'scroll_depth', 'last_section', 'sections_seen', 'time_on_page',
  'vsl_played', 'qualification_started', 'interest_answer', 'revenue_answer',
  'qualified', 'calendly_shown', 'booking_completed', 'form_submitted',
  'load_time', 'ttfb', 'lcp', 'country', 'email'
];

function isBot(ua) {
  if (!ua) return true;
  var lower = ua.toLowerCase();
  return BOT_PATTERNS.some(function (pattern) {
    return lower.includes(pattern);
  });
}

function sanitize(value, maxLen) {
  if (value === null || value === undefined) return '';
  var str = String(value).substring(0, maxLen || 200);
  // Steuerzeichen entfernen
  return str.replace(/[\x00-\x1f]/g, '');
}

module.exports = async function handler(req, res) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://nuroy.de');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  // Nur POST
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  // Bot-Check
  var ua = req.headers['user-agent'] || '';
  if (isBot(ua)) {
    return res.status(204).end();
  }

  // Body parsen
  var body;
  try {
    // sendBeacon sendet als text/plain, Vercel parsed das nicht automatisch
    var raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (raw.length > MAX_BODY_LENGTH) {
      return res.status(204).end();
    }
    body = typeof req.body === 'object' && req.body !== null ? req.body : JSON.parse(raw);
  } catch (e) {
    return res.status(204).end();
  }

  // Pflichtfelder prüfen
  for (var i = 0; i < REQUIRED_FIELDS.length; i++) {
    if (!body[REQUIRED_FIELDS[i]]) {
      return res.status(204).end();
    }
  }

  // Erweiterter Bot-Filter (Crawler-Wellen ohne Bot-UA):
  // - LCP ~23.000 ms ist die typische Signatur der FB-Ad-Review-/Scraper-Bots
  // - ein literales '+' in der UTM-Campaign = un-decodierte UTM (automatisierter Aufruf)
  var lcpVal = parseInt(body.lcp, 10);
  if (!isNaN(lcpVal) && lcpVal >= 20000) {
    return res.status(204).end();
  }
  if (typeof body.utm_campaign === 'string' && body.utm_campaign.indexOf('+') !== -1) {
    return res.status(204).end();
  }

  // Datum + Uhrzeit (UTC)
  var now = new Date();
  body.date = now.toISOString().substring(0, 10);
  body.time = now.toISOString().substring(11, 16);

  // Land aus Vercel-Header
  body.country = req.headers['x-vercel-ip-country'] || '';

  // Felder sanitisieren
  var sanitized = {};
  FIELD_ORDER.forEach(function (key) {
    sanitized[key] = sanitize(body[key]);
  });

  // An Google Sheets Webhook weiterleiten
  var webhookUrl = process.env.SHEETS_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('SHEETS_WEBHOOK_URL not configured');
    return res.status(204).end();
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitized)
    });
  } catch (e) {
    console.error('Sheet webhook error:', e.message);
  }

  return res.status(204).end();
};
