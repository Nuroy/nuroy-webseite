/**
 * ═══════════════════════════════════════════════════════════════
 * NUROY FUNNEL — ZENTRALE KONFIGURATION
 * ═══════════════════════════════════════════════════════════════
 *
 * Diese Datei ist die EINZIGE Stelle, an der externe Werte
 * eingetragen werden müssen.
 *
 * ANLEITUNG:
 * 1. Suche nach "PLACEHOLDER" in dieser Datei
 * 2. Ersetze jeden Platzhalter durch den echten Wert
 * 3. Speichern & fertig
 *
 * ═══════════════════════════════════════════════════════════════
 */

window.NUROY_CONFIG = {

  // ─────────────────────────────────────────────────────────────
  // CALENDLY
  // ─────────────────────────────────────────────────────────────

  /**
   * Vollständige URL des Calendly-Event-Types
   * Beispiel: 'https://calendly.com/nuroy/kennenlerngespraech'
   */
  CALENDLY_URL: 'https://calendly.com/alee-hammod-nuroy/30min?hide_event_type_details=1&hide_gdpr_banner=1',

  /**
   * Die Question-IDs aus dem Calendly-Event-Type
   * Diese findet man in den Calendly-Event-Settings unter "Questions"
   * Format ist meist: a1, a2, a3... oder custom_1, custom_2...
   */
  CALENDLY_QUESTION_TOOLS_ID: 'CALENDLY_Q1_PLACEHOLDER',
  CALENDLY_QUESTION_REVENUE_ID: 'CALENDLY_Q2_PLACEHOLDER',


  // ─────────────────────────────────────────────────────────────
  // META PIXEL (FACEBOOK PIXEL)
  // ─────────────────────────────────────────────────────────────

  /**
   * Die numerische Pixel-ID (15-stellig)
   * Zu finden im Meta Business Manager unter Events Manager
   */
  META_PIXEL_ID: '1012481877892496',

  /**
   * Welches Event soll auf der Danke-Seite gefeuert werden?
   * Übliche Werte: 'Schedule', 'Lead', 'CompleteRegistration'
   * Empfohlen: 'Schedule'
   */
  META_PIXEL_CONVERSION_EVENT: 'Schedule',


  // ─────────────────────────────────────────────────────────────
  // GOOGLE ADS CONVERSION TRACKING
  // ─────────────────────────────────────────────────────────────

  /**
   * Google Ads Conversion-ID
   * Format: AW-123456789
   * Zu finden in Google Ads unter Tools → Conversions
   */
  GOOGLE_ADS_CONVERSION_ID: 'GOOGLE_ADS_CONVERSION_ID_PLACEHOLDER',

  /**
   * Conversion-Label (der Teil nach dem Slash)
   * Format: AbCdEfGhIjKlMnOp
   */
  GOOGLE_ADS_CONVERSION_LABEL: 'GOOGLE_ADS_LABEL_PLACEHOLDER',


  // ─────────────────────────────────────────────────────────────
  // GOOGLE TAG MANAGER (Optional)
  // ─────────────────────────────────────────────────────────────

  /**
   * GTM-Container-ID (falls Google Tag Manager genutzt wird)
   * Format: GTM-XXXXXX
   * Leer lassen, wenn nicht genutzt
   */
  GTM_CONTAINER_ID: 'GTM_CONTAINER_ID_PLACEHOLDER',


  // ─────────────────────────────────────────────────────────────
  // KONTAKTFORMULAR (Soft-No-Leads)
  // ─────────────────────────────────────────────────────────────

  /**
   * Form-Service-Endpoint
   *
   * Empfohlene Services:
   * - Formspree: https://formspree.io/f/YOUR_FORM_ID
   * - Web3Forms: https://api.web3forms.com/submit
   * - FormSubmit: https://formsubmit.co/YOUR_EMAIL
   */
  FORM_SERVICE_ENDPOINT: 'WEBHOOK_URL_PLACEHOLDER', // TODO: Morgen vom Marketing-Team

  /**
   * Interne E-Mail-Adresse für Soft-No-Leads
   * An diese Adresse werden die Kontaktformular-Anfragen geschickt
   */
  LEADS_EMAIL: 'leads@nuroy.de',

  /**
   * Webhook-URL für unqualifizierte Leads
   * Diese Leads haben den Qualifizierungs-Flow nicht bestanden
   * und werden stattdessen über das Kontaktformular erfasst
   */
  UNQUALIFIED_LEADS_WEBHOOK: 'WEBHOOK_URL_PLACEHOLDER' // TODO: Vom Marketing-Team

};


// ═══════════════════════════════════════════════════════════════
// VALIDIERUNG (Entwickler-Hilfe)
// ═══════════════════════════════════════════════════════════════

/**
 * Diese Funktion prüft, ob noch Platzhalter im Config stehen
 * und gibt eine Warnung in der Browser-Console aus.
 */
(function validateConfig() {
  const config = window.NUROY_CONFIG;
  const warnings = [];

  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'string' && value.includes('PLACEHOLDER')) {
      warnings.push(`⚠️  ${key} ist noch nicht konfiguriert`);
    }
  }

  if (warnings.length > 0) {
    console.group('🔧 NUROY CONFIG — Fehlende Werte');
    console.warn('Die folgenden Werte müssen noch in config/funnel-config.js eingetragen werden:');
    warnings.forEach(w => console.warn(w));
    console.warn('→ Siehe config/funnel-config.js für Details');
    console.groupEnd();
  } else {
    console.log('✅ NUROY CONFIG — Alle Werte konfiguriert');
  }
})();
