(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════
  // ROI-KONSTANTEN (für einfache Anpassung)
  // ═══════════════════════════════════════════════════════════
  const ROI_CONFIG = {
    mitarbeiter: 8,           // Anzahl Mitarbeiter
    stundenProWoche: 5,       // Stunden/Woche manuelles Reporting
    stundensatz: 55,          // € pro Stunde
    wochenProMonat: 4.33,     // Durchschnitt (52 Wochen / 12 Monate)
    einsparquote: 0.8,        // 80% Einsparung durch Dashboard
  };

  // Berechnungen
  const stundenProMonat = ROI_CONFIG.mitarbeiter * ROI_CONFIG.stundenProWoche * ROI_CONFIG.wochenProMonat;
  const kostenProMonat = stundenProMonat * ROI_CONFIG.stundensatz;
  const kostenProJahr = Math.round(kostenProMonat * 12);
  const ersparnisProJahr = Math.round(kostenProJahr * ROI_CONFIG.einsparquote);

  // ═══════════════════════════════════════════════════════════
  // COUNT-UP ANIMATION
  // ═══════════════════════════════════════════════════════════

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateCountUp(element, target, duration = 2000) {
    // If reduced motion, set final value immediately
    if (prefersReducedMotion) {
      element.textContent = target.toLocaleString('de-DE');
      return;
    }

    const start = 0;
    const startTime = Date.now();
    const endTime = startTime + duration;

    function update() {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);

      // Ease-out cubic for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeOut * target);

      element.textContent = current.toLocaleString('de-DE');

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = target.toLocaleString('de-DE');
      }
    }

    update();
  }

  // ═══════════════════════════════════════════════════════════
  // INTERSECTION OBSERVER (starte Count-up beim Scrollen)
  // ═══════════════════════════════════════════════════════════

  function initROICountUp() {
    const countUpElements = document.querySelectorAll('[data-count-to]');

    if (!countUpElements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const target = parseInt(element.dataset.countTo, 10);

          if (!isNaN(target) && !element.dataset.counted) {
            element.dataset.counted = 'true';
            animateCountUp(element, target, 2000);
            observer.unobserve(element);
          }
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: '0px'
    });

    countUpElements.forEach(el => observer.observe(el));
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initROICountUp);
  } else {
    initROICountUp();
  }

})();
