/**
 * ═══════════════════════════════════════════════════════════════
 * NUROY FUNNEL: ANONYME SESSION-ANALYTICS
 * ═══════════════════════════════════════════════════════════════
 *
 * Sammelt anonymisierte Session-Daten (keine IP, keine Cookies,
 * keine PII) und sendet EINE Zusammenfassung beim Verlassen.
 *
 * WICHTIG: Dieses Script muss NACH funnel-booking.js laden,
 * da es globale Funktionen (selectInterest, selectRevenueRange,
 * showCalendly) patcht.
 *
 * DSGVO: Art. 6 Abs. 1 lit. f (berechtigtes Interesse)
 */
(function () {
  'use strict';

  // ── Konfiguration ──────────────────────────────────────────
  var endpoint = (window.NUROY_CONFIG && window.NUROY_CONFIG.ANALYTICS_ENDPOINT) || '/api/track';

  // ── Session-State ──────────────────────────────────────────
  var sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
  var startTime = Date.now();
  var maxScroll = 0;
  var sectionsSet = {};
  var lastSection = '';
  var vslPlayed = false;
  var qualificationStarted = false;
  var interestAnswer = '';
  var revenueAnswer = '';
  var calendlyShown = false;
  var formSubmitted = false;
  var _sent = false;
  var _convSent = false;
  // Lead-Daten (nur bei tatsächlichem Submit befüllt, via callback_requested-Event)
  var leadName = '';
  var leadPhone = '';
  var leadCallTime = '';

  // ── Device / Browser / OS Erkennung ────────────────────────
  function detectDevice() {
    var ua = navigator.userAgent || '';
    if (/Mobi|Android/i.test(ua)) return 'mobile';
    if (/Tablet|iPad/i.test(ua)) return 'tablet';
    return 'desktop';
  }

  function detectBrowser() {
    var ua = navigator.userAgent || '';
    if (/Edg\//i.test(ua)) return 'Edge';
    if (/OPR\//i.test(ua) || /Opera/i.test(ua)) return 'Opera';
    if (/Chrome\//i.test(ua) && !/Edg/i.test(ua)) return 'Chrome';
    if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) return 'Safari';
    if (/Firefox\//i.test(ua)) return 'Firefox';
    return 'Sonstiger';
  }

  function detectOS() {
    var ua = navigator.userAgent || '';
    if (/Windows/i.test(ua)) return 'Windows';
    if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
    if (/Mac OS/i.test(ua)) return 'macOS';
    if (/Android/i.test(ua)) return 'Android';
    if (/Linux/i.test(ua)) return 'Linux';
    return 'Sonstiges';
  }

  // ── UTM-Parameter ──────────────────────────────────────────
  function getUTM(key) {
    try {
      return new URLSearchParams(window.location.search).get(key) || '';
    } catch (e) {
      return '';
    }
  }

  // ── Referrer bereinigen ────────────────────────────────────
  function cleanReferrer() {
    try {
      if (!document.referrer) return '';
      var url = new URL(document.referrer);
      // Eigene Domain ignorieren
      if (url.hostname === window.location.hostname) return '';
      return url.hostname;
    } catch (e) {
      return '';
    }
  }

  // ── Scroll-Tracking (throttled) ────────────────────────────
  var scrollTick = false;
  function onScroll() {
    if (scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(function () {
      var docHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      );
      var viewportHeight = window.innerHeight;
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var percent = Math.round(((scrollTop + viewportHeight) / docHeight) * 100);
      if (percent > maxScroll) maxScroll = Math.min(percent, 100);
      scrollTick = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // ── Section-Tracking (IntersectionObserver) ────────────────
  function initSectionObserver() {
    if (!('IntersectionObserver' in window)) return;
    var sections = document.querySelectorAll('section[id]');
    if (!sections.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.target.id) {
          sectionsSet[entry.target.id] = true;
          lastSection = entry.target.id;
        }
      });
    }, { threshold: 0.3 });

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  // ── VSL-Tracking (Wistia) ──────────────────────────────────
  // Wistia API: erkennt play (inkl. autoplay)
  window._wq = window._wq || [];
  window._wq.push({ id: '_all', onReady: function(video) {
    video.bind('play', function() {
      vslPlayed = true;
    });
  }});

  // Fallback: lite-youtube (falls auf anderen Seiten verwendet)
  window.addEventListener('liteYouTubeIframeLoaded', function () {
    vslPlayed = true;
  });
  document.addEventListener('click', function (e) {
    if (e.target && e.target.closest && e.target.closest('lite-youtube')) {
      vslPlayed = true;
    }
  });

  // ── Monkey-Patch: selectInterest ──────────────────────────
  function patchSelectInterest() {
    if (typeof window.selectInterest !== 'function') return;
    var original = window.selectInterest;
    window.selectInterest = function (value) {
      qualificationStarted = true;
      interestAnswer = value || '';
      return original.apply(this, arguments);
    };
  }

  // ── Monkey-Patch: selectRevenueRange ──────────────────────
  function patchSelectRevenueRange() {
    if (typeof window.selectRevenueRange !== 'function') return;
    var original = window.selectRevenueRange;
    window.selectRevenueRange = function (value) {
      revenueAnswer = value || '';
      return original.apply(this, arguments);
    };
  }

  // ── Monkey-Patch: showCalendly ────────────────────────────
  function patchShowCalendly() {
    if (typeof window.showCalendly !== 'function') return;
    var original = window.showCalendly;
    window.showCalendly = function () {
      calendlyShown = true;
      return original.apply(this, arguments);
    };
  }

  // ── dataLayer: soft_no_form_submitted / callback_requested ─────────────────────
  function watchDataLayer() {
    window.dataLayer = window.dataLayer || [];
    var origPush = window.dataLayer.push;
    window.dataLayer.push = function () {
      for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] && (arguments[i].event === 'soft_no_form_submitted' || arguments[i].event === 'callback_requested')) {
          formSubmitted = true;
          if (arguments[i].lead_name) leadName = arguments[i].lead_name;
          if (arguments[i].lead_phone) leadPhone = arguments[i].lead_phone;
          if (arguments[i].call_time) leadCallTime = arguments[i].call_time;
          sendConversion();
        }
      }
      return origPush.apply(window.dataLayer, arguments);
    };
  }

  // ── Performance Metriken ──────────────────────────────────
  function getPerformanceMetrics() {
    var metrics = { load_time: 0, ttfb: 0, lcp: 0 };
    try {
      var nav = performance.getEntriesByType('navigation');
      if (nav && nav.length) {
        metrics.load_time = Math.round(nav[0].loadEventEnd - nav[0].startTime);
        metrics.ttfb = Math.round(nav[0].responseStart - nav[0].startTime);
      }
    } catch (e) { /* ignore */ }
    return metrics;
  }

  // LCP via PerformanceObserver
  var lcpValue = 0;
  function observeLCP() {
    try {
      if (!('PerformanceObserver' in window)) return;
      var observer = new PerformanceObserver(function (list) {
        var entries = list.getEntries();
        if (entries.length) {
          lcpValue = Math.round(entries[entries.length - 1].startTime);
        }
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) { /* ignore */ }
  }

  // ── Payload zusammenbauen ─────────────────────────────────
  function buildPayload() {
    var perf = getPerformanceMetrics();
    var qualStatus = '';
    var bookingDone = '';
    try {
      qualStatus = sessionStorage.getItem('nuroy_qualification_status') || '';
      bookingDone = sessionStorage.getItem('nuroy_booking_confirmed') || '';
    } catch (e) { /* ignore */ }

    var sectionKeys = Object.keys(sectionsSet);

    var email = '';
    try { email = sessionStorage.getItem('nuroy_email') || ''; } catch (e) { /* ignore */ }

    return {
      session_id: sessionId,
      email: email,
      page: window.location.pathname,
      device: detectDevice(),
      browser: detectBrowser(),
      os: detectOS(),
      referrer: cleanReferrer(),
      utm_source: getUTM('utm_source'),
      utm_medium: getUTM('utm_medium'),
      utm_campaign: getUTM('utm_campaign'),
      scroll_depth: maxScroll,
      last_section: lastSection,
      sections_seen: sectionKeys.join(','),
      time_on_page: Math.round((Date.now() - startTime) / 1000),
      vsl_played: vslPlayed ? 'ja' : 'nein',
      qualification_started: qualificationStarted ? 'ja' : 'nein',
      interest_answer: interestAnswer,
      revenue_answer: revenueAnswer,
      qualified: qualStatus === 'qualified' ? 'ja' : (qualStatus === 'disqualified' ? 'nein' : ''),
      calendly_shown: calendlyShown ? 'ja' : 'nein',
      booking_completed: bookingDone === 'true' ? 'ja' : 'nein',
      form_submitted: formSubmitted ? 'ja' : 'nein',
      load_time: perf.load_time,
      ttfb: perf.ttfb,
      lcp: lcpValue,
      name: leadName,
      phone: leadPhone,
      call_time: leadCallTime
    };
  }

  // ── Senden ────────────────────────────────────────────────
  function send() {
    if (_sent) return;
    _sent = true;

    var payload = buildPayload();
    var json = JSON.stringify(payload);

    // sendBeacon bevorzugt (überlebt Tab-Schließen)
    if (navigator.sendBeacon) {
      var sent = navigator.sendBeacon(endpoint, json);
      if (sent) return;
    }

    // Fallback: fetch mit keepalive
    try {
      fetch(endpoint, {
        method: 'POST',
        body: json,
        headers: { 'Content-Type': 'text/plain' },
        keepalive: true
      });
    } catch (e) { /* silent fail */ }
  }

  // ── Conversion SOFORT senden (Bulletproof, nicht erst beim Verlassen) ──
  function sendConversion() {
    if (_convSent) return;
    _convSent = true;
    _sent = true; // Unload-Beacon danach unterdrücken → keine Doppel-Zeile

    var json = JSON.stringify(buildPayload()); // form_submitted ist jetzt 'ja'
    if (navigator.sendBeacon) {
      if (navigator.sendBeacon(endpoint, json)) return;
    }
    try {
      fetch(endpoint, { method: 'POST', body: json, headers: { 'Content-Type': 'text/plain' }, keepalive: true });
    } catch (e) { /* silent fail */ }
  }

  // ── Trigger: visibilitychange + pagehide ──────────────────
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') send();
  });
  window.addEventListener('pagehide', send);

  // ── Init ──────────────────────────────────────────────────
  function init() {
    initSectionObserver();
    patchSelectInterest();
    patchSelectRevenueRange();
    patchShowCalendly();
    watchDataLayer();
    observeLCP();
  }

  // Warten bis DOM bereit
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
