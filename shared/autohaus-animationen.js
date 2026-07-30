/**
 * Autohaus-Animationen
 *
 * Drei handgebaute Stuecke im selben Stil wie die Hero-Animation der
 * Startseite: die Bewegung liegt in CSS-Keyframes, hier laeuft nur der
 * Zaehler-Antrieb. Jede Animation pausiert ausserhalb des Sichtfelds und
 * bleibt bei "prefers-reduced-motion" komplett stehen, zeigt dann aber
 * den Endzustand, damit die Aussage trotzdem ankommt.
 *
 *   .aha-overflow    Anruf laeuft ins Leere, Assistent uebernimmt, Termin steht
 *   .aha-uhr         Erstreaktion: Uhr laeuft weiter gegen Antwort in Sekunden
 *   .aha-standtage   Fahrzeuge wandern ueber die Zeitachse, ab Tag 90 kippt die Farbe
 */
(function () {
  'use strict';

  var sparsam = window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Zahl weich hochzaehlen. Die Beschriftung kommt aus "formatiere",
     damit der Endwert nicht per Zeitgeber nachgereicht werden muss und
     gegen den letzten Frame des Zaehlers verlieren kann. */
  function zaehle(el, von, bis, dauer, formatiere) {
    var start = null;
    function schritt(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dauer, 1);
      el.textContent = formatiere(von + (bis - von) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(schritt);
    }
    requestAnimationFrame(schritt);
  }

  /* Laeuft erst, wenn der Block im Bild ist, und nur einmal je Sichtbarkeit */
  function beiSicht(el, tuWas) {
    if (!('IntersectionObserver' in window)) { tuWas(); return; }
    var beobachter = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (e.isIntersecting) { el.classList.add('aha-laeuft'); tuWas(); }
        else { el.classList.remove('aha-laeuft'); }
      });
    }, { threshold: 0.35 });
    beobachter.observe(el);
  }

  /* ── Anruf-Overflow ─────────────────────────────────────── */
  function overflow(wurzel) {
    var schritte = wurzel.querySelectorAll('.aho-schritt');
    if (!schritte.length) return;
    if (sparsam) {
      schritte[schritte.length - 1].classList.add('aktiv');
      return;
    }
    var i = 0, timer = null;
    function weiter() {
      schritte.forEach(function (s) { s.classList.remove('aktiv'); });
      schritte[i].classList.add('aktiv');
      i = (i + 1) % schritte.length;
      timer = setTimeout(weiter, i === 0 ? 2600 : 1900);
    }
    beiSicht(wurzel, function () {
      if (timer) return;
      weiter();
    });
  }

  /* ── Speed-to-Lead-Uhr ──────────────────────────────────── */
  function uhr(wurzel) {
    var offen = wurzel.querySelector('[data-aha="offen"]');
    var schnell = wurzel.querySelector('[data-aha="schnell"]');
    if (!offen || !schnell) return;

    if (sparsam) {
      offen.textContent = 'laeuft weiter';
      schnell.textContent = '47 Sek.';
      wurzel.classList.add('aha-fertig');
      return;
    }

    var gestartet = false;
    beiSicht(wurzel, function () {
      if (gestartet) return;
      gestartet = true;

      /* Rechts: Antwort ist nach 47 Sekunden raus und bleibt stehen */
      zaehle(schnell, 0, 47, 1800, function (v) { return Math.round(v) + ' Sek.'; });
      setTimeout(function () { wurzel.classList.add('aha-fertig'); }, 1900);

      /* Links: die Uhr laeuft einfach weiter, das ist der Punkt */
      var beginn = Date.now();
      (function tick() {
        if (!wurzel.classList.contains('aha-laeuft')) {
          return requestAnimationFrame(tick);
        }
        var min = Math.floor((Date.now() - beginn) / 1000) * 7;
        var std = Math.floor(min / 60);
        offen.textContent = std > 0
          ? std + ' Std. ' + String(min % 60).padStart(2, '0') + ' Min.'
          : min + ' Min.';
        requestAnimationFrame(tick);
      })();
    });
  }

  /* ── Standtage ──────────────────────────────────────────── */
  function standtage(wurzel) {
    var balken = wurzel.querySelectorAll('.ast-balken');
    var summe = wurzel.querySelector('[data-aha="kosten"]');
    if (!balken.length) return;

    /* Standkosten je Fahrzeug und Tag: 25 bis 30 Euro laut DAT.
       Gerechnet wird mit dem unteren Wert, damit das Beispiel nicht
       zu guenstig fuer uns aussieht. */
    var EURO_PRO_TAG = 25;

    function setzen(sofort) {
      var tageGesamt = 0;
      balken.forEach(function (b) {
        var tage = parseInt(b.dataset.tage, 10) || 0;
        tageGesamt += tage;
        var anteil = Math.min(tage / 120, 1) * 100;
        if (sofort) b.style.transition = 'none';
        b.style.width = anteil + '%';
        if (tage > 90) b.classList.add('ast-kritisch');
      });
      if (summe) {
        var betrag = tageGesamt * EURO_PRO_TAG;
        var euro = function (v) {
          return Math.round(v).toLocaleString('de-DE') + ' €';
        };
        if (sparsam || sofort) summe.textContent = euro(betrag);
        else zaehle(summe, 0, betrag, 1600, euro);
      }
    }

    if (sparsam) { setzen(true); return; }
    var gestartet = false;
    beiSicht(wurzel, function () {
      if (gestartet) return;
      gestartet = true;
      setzen(false);
    });
  }

  function start() {
    document.querySelectorAll('.aha-overflow').forEach(overflow);
    document.querySelectorAll('.aha-uhr').forEach(uhr);
    document.querySelectorAll('.aha-standtage').forEach(standtage);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
