/**
 * ═══════════════════════════════════════════════════════════════
 * NUROY: LEAD-WEBHOOK PROXY (Vercel Serverless)
 * ═══════════════════════════════════════════════════════════════
 *
 * POST /api/lead
 * - nimmt Leads vom Formular entgegen (same-origin, KEIN Secret im Client)
 *   typ 'callback' (Default): Rückruf-Formular (name + telefon Pflicht)
 *   typ 'calendly':           Buchungs-Ping ohne Kontaktdaten (Details in Calendly)
 * - schickt eine Telegram-Nachricht in den Lead-Channel
 * - leitet Rückruf-Leads zusätzlich ans Cockpit weiter (best effort)
 *
 * Secrets NUR als Env-Vars (nie im Repo / nie im Client):
 *   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, LEAD_WEBHOOK_SECRET
 */

const COCKPIT_WEBHOOK = 'https://cockpit.nuroy.de/api/webhook/leads';

const BOT_PATTERNS = [
  'bot', 'crawl', 'spider', 'slurp', 'lighthouse',
  'pagespeed', 'pingdom', 'headlesschrome', 'phantomjs',
  'prerender', 'wget', 'curl', 'httpie'
];
const MAX_BODY_LENGTH = 2048;

// Nationale 0 → wahrscheinliche Landesvorwahl (DACH-Zielmarkt, Land aus Vercel-Geo)
const COUNTRY_PREFIX = { AT: '+43', DE: '+49', CH: '+41' };

function isBot(ua) {
  if (!ua) return true;
  var lower = ua.toLowerCase();
  return BOT_PATTERNS.some(function (p) { return lower.includes(p); });
}

function sanitize(value, maxLen) {
  if (value === null || value === undefined) return '';
  return String(value).substring(0, maxLen || 200).replace(/[\x00-\x1f]/g, '');
}

async function sendTelegram(text) {
  var token = process.env.TELEGRAM_BOT_TOKEN;
  var chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error('TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not configured');
    return false;
  }
  try {
    var r = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Bewusst OHNE parse_mode: User-Eingaben (Name) können Markdown-Sonderzeichen enthalten
      body: JSON.stringify({ chat_id: chatId, text: text })
    });
    if (!r.ok) console.error('Telegram sendMessage failed:', r.status);
    return r.ok;
  } catch (e) {
    console.error('Telegram error:', e.message);
    return false;
  }
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

  var typ = sanitize(body.typ, 20) || 'callback';
  var seite = sanitize(body.seite, 60);
  var country = sanitize(req.headers['x-vercel-ip-country'] || '', 5);

  // ── Calendly-Buchung: nur Telegram-Ping, keine Kontaktdaten im Browser verfügbar ──
  if (typ === 'calendly') {
    var okCal = await sendTelegram(
      '📅 Neue Calendly-Buchung' +
      (seite ? '\n📍 ' + seite : '') +
      (country ? '\n🌍 Land: ' + country : '') +
      '\nℹ️ Name & Termin stehen im Calendly-Kalender / der Bestätigungs-Mail.'
    );
    return res.status(okCal ? 200 : 502).json({ ok: okCal });
  }

  // ── Rückruf-Lead: Pflichtfelder ──
  var name = sanitize(body.name, 120);
  var telefon = sanitize(body.telefon || body.phone, 60);
  if (!name || !telefon) {
    return res.status(400).json({ ok: false, error: 'name_and_telefon_required' });
  }
  var email = sanitize(body.email, 160);
  var anruf_zeit = sanitize(body.anruf_zeit || body.call_time, 20);

  // Nationale Nummer (führende 0) → Vorwahl-Hinweis anhand Besucherland
  var vorwahlHinweis = '';
  if (/^0[1-9]/.test(telefon) && COUNTRY_PREFIX[country]) {
    vorwahlHinweis = ' (evtl. ' + COUNTRY_PREFIX[country] + ' ' + telefon.replace(/^0/, '') + ')';
  }

  // 1) Telegram (Haupt-Benachrichtigung)
  var telegramOk = await sendTelegram(
    '🔔 Neuer Rückruf-Lead\n' +
    '👤 ' + name + '\n' +
    '📞 ' + telefon + vorwahlHinweis + '\n' +
    '🕐 Wunschzeit: ' + (anruf_zeit || 'egal') +
    (country ? '\n🌍 Land: ' + country : '') +
    (seite ? '\n📍 ' + seite : '')
  );

  // 2) Cockpit (best effort: Secret NUR aus Env)
  var cockpitOk = false;
  var secret = process.env.LEAD_WEBHOOK_SECRET;
  if (secret) {
    try {
      var r = await fetch(COCKPIT_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': secret
        },
        body: JSON.stringify({ name: name, telefon: telefon, email: email, anruf_zeit: anruf_zeit })
      });
      cockpitOk = r.ok;
      if (!r.ok) console.error('Cockpit webhook rejected:', r.status);
    } catch (e) {
      console.error('Cockpit webhook error:', e.message);
    }
  } else {
    console.error('LEAD_WEBHOOK_SECRET not configured');
  }

  // Erfolg, wenn mindestens ein Kanal durchging (E-Mail via web3forms läuft separat im Client)
  var anyOk = telegramOk || cockpitOk;
  return res.status(anyOk ? 200 : 502).json({ ok: anyOk, telegram: telegramOk, cockpit: cockpitOk });
};
