/**
 * ═══════════════════════════════════════════════════════════════
 * NUROY FUNNEL — BOOKING & QUALIFIZIERUNG
 * ═══════════════════════════════════════════════════════════════
 *
 * 2-Schritt-Qualifizierungs-Flow:
 * - Frage 1: Tool-Anzahl
 * - Frage 2: Jahresumsatz
 *
 * Verzweigung:
 * - Qualifiziert → Calendly-Widget
 * - Nicht qualifiziert → Kontaktformular (Soft-No)
 */

// ═══════════════════════════════════════════════════════════════
// STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEYS = {
  TOOLS_COUNT: 'nuroy_tools_count',
  REVENUE_RANGE: 'nuroy_revenue_range',
  BOOKING_CONFIRMED: 'nuroy_booking_confirmed',
  BOOKING_EVENT: 'nuroy_booking_event',
  QUALIFICATION_STATUS: 'nuroy_qualification_status'
};

const EVENTS = {
  QUALIFICATION_STARTED: 'qualification_started',
  TOOLS_SELECTED: 'tools_selected',
  REVENUE_SELECTED: 'revenue_selected',
  QUALIFIED: 'qualified_for_calendly',
  UNQUALIFIED: 'unqualified_soft_no',
  CALENDLY_SHOWN: 'calendly_shown',
  CALENDLY_LOADED: 'calendly_loaded',
  BOOKING_COMPLETED: 'booking_completed'
};

/**
 * Speichert Antwort in sessionStorage
 */
function saveAnswer(key, value) {
  sessionStorage.setItem(key, value);
}

/**
 * Lädt Antwort aus sessionStorage
 */
function getAnswer(key) {
  return sessionStorage.getItem(key);
}

/**
 * Prüft, ob Lead qualifiziert ist
 */
function isQualified(toolsCount, revenueRange) {
  // Disqualifizierung bei:
  // - "Nur 1-2 Tools"
  // - "Noch in der Startphase" (unter 100k €)

  if (toolsCount === 'tools-1-2') return false;
  if (revenueRange === 'revenue-0-100k') return false;

  return true;
}


// ═══════════════════════════════════════════════════════════════
// FLOW NAVIGATION
// ═══════════════════════════════════════════════════════════════

let currentStep = 1;

/**
 * Zeigt einen bestimmten Step an
 */
function showStep(stepNumber) {
  // Alle Steps ausblenden
  document.querySelectorAll('.qualification-step').forEach(step => {
    step.classList.remove('active');
  });

  // Gewünschten Step anzeigen
  const targetStep = document.getElementById(`qualification-step-${stepNumber}`);
  if (targetStep) {
    targetStep.classList.add('active');
    currentStep = stepNumber;

    // KEIN Scroll - bleibt an gleicher Stelle für smoother Übergang
  }
}

/**
 * Zeigt Calendly-Widget
 */
function showCalendly() {
  const container = document.getElementById('calendly-container');
  const qualificationContainer = document.getElementById('qualification-container');
  const embedContainer = document.getElementById('calendly-embed');

  // 1. Loading-State anzeigen (bevor Calendly lädt)
  embedContainer.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 600px;
      background: #FAFAF7;
      border-radius: 16px;
    ">
      <div style="
        width: 64px;
        height: 64px;
        border: 4px solid #E8E8E0;
        border-top-color: #FF2D7A;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      "></div>
      <p style="
        margin-top: 24px;
        font-family: 'Geist', system-ui, sans-serif;
        font-size: 16px;
        color: #666;
      ">Calendly wird geladen...</p>
      <style>
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    </div>
  `;

  // 2. Smooth Fade-out der Qualifizierung
  qualificationContainer.style.transition = 'opacity 0.4s ease-out';
  qualificationContainer.style.opacity = '0';

  setTimeout(() => {
    qualificationContainer.classList.remove('active');
    qualificationContainer.style.display = 'none';

    // 3. Calendly-Container einblenden
    container.style.opacity = '0';
    container.classList.add('active');
    container.style.display = 'block';

    // Smooth Fade-in
    requestAnimationFrame(() => {
      container.style.transition = 'opacity 0.5s ease-in';
      container.style.opacity = '1';
    });

    // 4. Auto-Scroll zum Calendly-Widget (sanft)
    setTimeout(() => {
      const headerHeight = 80; // Fixed header height
      const containerTop = container.getBoundingClientRect().top + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: containerTop,
        behavior: 'smooth'
      });

      console.log('✅ Auto-scrolled to Calendly widget');
    }, 100);

    // 5. Calendly initialisieren (nach kurzem Delay für smooth UX)
    setTimeout(() => {
      initCalendly();
    }, 300);

  }, 400); // Warte auf Fade-out

  // Track event
  if (typeof window.dataLayer !== 'undefined') {
    window.dataLayer.push({
      event: EVENTS.CALENDLY_SHOWN
    });
  }
}

/**
 * Zeigt Kontaktformular (Soft-No)
 */
function showContactForm() {
  document.getElementById('qualification-container').style.display = 'none';
  document.getElementById('contact-form-container').style.display = 'block';

  // Kein Scroll - bleibt an Stelle
}

/**
 * Ermittelt den Disqualifizierungs-Grund basierend auf den Antworten
 */
function determineDisqualificationReason() {
  const toolsCount = getAnswer(STORAGE_KEYS.TOOLS_COUNT);
  const revenueRange = getAnswer(STORAGE_KEYS.REVENUE_RANGE);

  if (toolsCount === 'tools-1-2') {
    return 'Zu wenige Tools (1-2)';
  }
  if (revenueRange === 'revenue-0-100k') {
    return 'Noch in Startphase (unter 100k €)';
  }
  return 'Unbekannt';
}


// ═══════════════════════════════════════════════════════════════
// FRAGE 1: TOOL-ANZAHL
// ═══════════════════════════════════════════════════════════════

function selectToolsCount(value) {
  saveAnswer(STORAGE_KEYS.TOOLS_COUNT, value);

  // Visual feedback
  document.querySelectorAll('#qualification-step-1 .qualification-option').forEach(btn => {
    btn.classList.remove('selected');
  });
  event.target.closest('.qualification-option').classList.add('selected');

  // Disqualifizierung bei "Nur 1-2 Tools"
  if (value === 'tools-1-2') {
    saveAnswer(STORAGE_KEYS.QUALIFICATION_STATUS, 'disqualified');

    setTimeout(() => {
      showContactForm();
    }, 400);
    return;
  }

  // Weiter zu Frage 2
  setTimeout(() => {
    showStep(2);
  }, 400);
}


// ═══════════════════════════════════════════════════════════════
// FRAGE 2: JAHRESUMSATZ
// ═══════════════════════════════════════════════════════════════

function selectRevenueRange(value) {
  saveAnswer(STORAGE_KEYS.REVENUE_RANGE, value);

  // Visual feedback
  document.querySelectorAll('#qualification-step-2 .qualification-option').forEach(btn => {
    btn.classList.remove('selected');
  });
  event.target.closest('.qualification-option').classList.add('selected');

  // Qualifizierungsprüfung
  const toolsCount = getAnswer(STORAGE_KEYS.TOOLS_COUNT);
  const qualified = isQualified(toolsCount, value);

  saveAnswer(STORAGE_KEYS.QUALIFICATION_STATUS, qualified ? 'qualified' : 'disqualified');

  setTimeout(() => {
    if (qualified) {
      showCalendly();
    } else {
      showContactForm();
    }
  }, 400);
}


// ═══════════════════════════════════════════════════════════════
// CALENDLY INITIALISIERUNG
// ═══════════════════════════════════════════════════════════════

function initCalendly() {
  // Prüfen ob Calendly-Script geladen ist
  if (typeof Calendly === 'undefined') {
    console.error('❌ Calendly-Script nicht geladen. Bitte <script src="https://assets.calendly.com/assets/external/widget.js" async></script> im HTML einbinden.');
    return;
  }

  // Config-Prüfung
  const config = window.NUROY_CONFIG;
  if (!config || config.CALENDLY_URL.includes('PLACEHOLDER')) {
    console.warn('⚠️  Calendly-URL noch nicht konfiguriert. Siehe config/funnel-config.js');

    // Fallback: Zeige Platzhalter-Nachricht
    document.getElementById('calendly-embed').innerHTML = `
      <div style="padding: 60px 20px; text-align: center; background: #FAFAF7; border-radius: 12px; border: 2px dashed #E8E8E0;">
        <p style="color: #999; font-size: 14px; margin: 0;">
          📅 Calendly-Widget wird hier angezeigt<br>
          <small>Calendly-URL in <code>config/funnel-config.js</code> eintragen</small>
        </p>
      </div>
    `;
    return;
  }

  // Calendly mit Prefill initialisieren
  Calendly.initInlineWidget({
    url: config.CALENDLY_URL,
    parentElement: document.getElementById('calendly-embed'),
    prefill: {
      customAnswers: {
        // TODO: Diese Keys müssen mit den tatsächlichen Calendly Question-IDs matchen
        // Sobald Calendly-Account konfiguriert ist, hier die echten IDs eintragen
        [config.CALENDLY_QUESTION_TOOLS_ID]: getAnswer(STORAGE_KEYS.TOOLS_COUNT),
        [config.CALENDLY_QUESTION_REVENUE_ID]: getAnswer(STORAGE_KEYS.REVENUE_RANGE)
      }
    },
    utm: {
      utmSource: 'nuroy_funnel',
      utmMedium: 'dashboard_jetzt',
      utmCampaign: 'qualification_flow'
    }
  });

  // Success-Tracking nach Calendly-Load
  setTimeout(() => {
    const iframe = document.querySelector('#calendly-embed iframe');
    if (iframe) {
      console.log('✅ Calendly iframe successfully loaded');

      // Track successful Calendly load
      if (typeof window.dataLayer !== 'undefined') {
        window.dataLayer.push({
          event: EVENTS.CALENDLY_LOADED
        });
      }
    }
  }, 2000);
}


// ═══════════════════════════════════════════════════════════════
// CALENDLY EVENT LISTENER (für Redirect zur Danke-Seite)
// ═══════════════════════════════════════════════════════════════

function initCalendlyEventListener() {
  window.addEventListener('message', function(e) {
    // Sicherheitsprüfung: Nur Calendly-Events akzeptieren
    if (e.origin !== 'https://calendly.com') return;

    // Event-Typ prüfen
    if (e.data.event && e.data.event === 'calendly.event_scheduled') {
      console.log('✅ Calendly-Buchung erfolgreich:', e.data.payload);

      // Booking-Status in sessionStorage speichern
      saveAnswer(STORAGE_KEYS.BOOKING_CONFIRMED, 'true');
      saveAnswer(STORAGE_KEYS.BOOKING_EVENT, JSON.stringify(e.data.payload || {}));

      // dataLayer-Push für GTM (falls genutzt)
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'calendly_booking_completed',
        booking_payload: e.data.payload,
        qualification_data: {
          tools_count: getAnswer(STORAGE_KEYS.TOOLS_COUNT),
          revenue_range: getAnswer(STORAGE_KEYS.REVENUE_RANGE)
        }
      });

      // Redirect zur Danke-Seite
      setTimeout(() => {
        window.location.href = '/danke.html';
      }, 500);
    }
  });

  console.log('🎧 Calendly Event Listener aktiviert');
}


// ═══════════════════════════════════════════════════════════════
// KONTAKTFORMULAR (Soft-No)
// ═══════════════════════════════════════════════════════════════

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;

    // Loading-State
    submitBtn.disabled = true;
    submitBtn.textContent = 'Wird gesendet...';

    // Form-Daten sammeln
    const formData = new FormData(form);

    // Qualification-Daten hinzufügen
    formData.append('tools_count', getAnswer(STORAGE_KEYS.TOOLS_COUNT) || 'Nicht angegeben');
    formData.append('revenue_range', getAnswer(STORAGE_KEYS.REVENUE_RANGE) || 'Nicht angegeben');
    formData.append('qualification_status', 'soft_no');
    formData.append('source', 'nuroy_funnel_soft_no');

    // Config-Prüfung
    const config = window.NUROY_CONFIG;
    if (!config || config.FORM_SERVICE_ENDPOINT.includes('PLACEHOLDER')) {
      console.error('❌ Form-Service-Endpoint nicht konfiguriert');
      alert('Formular noch nicht konfiguriert. Bitte später erneut versuchen.');
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
      return;
    }

    try {
      // Form-Daten an Service senden
      const response = await fetch(config.FORM_SERVICE_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        // Erfolg: Formular ausblenden, Bestätigung anzeigen
        form.style.display = 'none';
        document.getElementById('contact-form-success').style.display = 'block';

        // dataLayer-Push für GTM
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'soft_no_form_submitted',
          form_data: {
            name: formData.get('name'),
            email: formData.get('email'),
            company: formData.get('company')
          }
        });

        // Webhook für unqualifizierte Leads (falls konfiguriert)
        const webhookUrl = config.UNQUALIFIED_LEADS_WEBHOOK;
        if (webhookUrl && !webhookUrl.includes('PLACEHOLDER')) {
          try {
            fetch(webhookUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: formData.get('name'),
                email: formData.get('email'),
                company: formData.get('company'),
                phone: formData.get('phone') || '',
                message: formData.get('message') || '',
                tools_count: getAnswer(STORAGE_KEYS.TOOLS_COUNT),
                revenue_range: getAnswer(STORAGE_KEYS.REVENUE_RANGE),
                qualification_status: 'unqualified',
                disqualification_reason: determineDisqualificationReason(),
                timestamp: new Date().toISOString(),
                source: 'nuroy_funnel_dashboard_jetzt'
              })
            }).then(res => {
              if (res.ok) {
                console.log('✅ Webhook-Notification gesendet');
              } else {
                console.warn('⚠️  Webhook-Call fehlgeschlagen:', res.status);
              }
            }).catch(err => {
              console.error('❌ Webhook-Error:', err);
            });
          } catch (error) {
            console.error('❌ Webhook-Call Error:', error);
          }
        }
      } else {
        throw new Error('Server-Fehler');
      }
    } catch (error) {
      console.error('❌ Formular-Fehler:', error);
      alert('Es gab einen Fehler beim Absenden. Bitte versuche es erneut oder schreibe uns direkt eine E-Mail.');
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });
}


// ═══════════════════════════════════════════════════════════════
// CALENDLY PREFETCH
// ═══════════════════════════════════════════════════════════════

/**
 * Prefetch Calendly-Ressourcen für schnellere Anzeige
 */
function prefetchCalendly() {
  console.log('🚀 Prefetching Calendly resources...');

  // Calendly-Domain preconnect (DNS + TLS bereits vorbereiten)
  const preconnect = document.createElement('link');
  preconnect.rel = 'preconnect';
  preconnect.href = 'https://calendly.com';
  preconnect.crossOrigin = 'anonymous';
  document.head.appendChild(preconnect);

  // Calendly Assets preconnect
  const preconnectAssets = document.createElement('link');
  preconnectAssets.rel = 'preconnect';
  preconnectAssets.href = 'https://assets.calendly.com';
  preconnectAssets.crossOrigin = 'anonymous';
  document.head.appendChild(preconnectAssets);

  console.log('✅ Calendly preconnect links added');
}


// ═══════════════════════════════════════════════════════════════
// INITIALISIERUNG
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  // Calendly Event Listener starten (muss immer aktiv sein)
  initCalendlyEventListener();

  // Kontaktformular initialisieren
  initContactForm();

  // Initial: Zeige Step 1
  showStep(1);

  // Calendly-Script vorladen für schnellere Anzeige
  prefetchCalendly();

  console.log('✅ Booking-Flow initialisiert');
});
