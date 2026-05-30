/* ============================================================
   ROI-CALCULATOR — JavaScript-Logik
   Berechnungen, Tweening, SVG-Drawing, Event Handling
   ============================================================ */

(function() {
  'use strict';

  // ═════════════════════════════════════════════
  // CONSTANTS (einfach änderbar oben im Code)
  // ═════════════════════════════════════════════

  const CONFIG = {
    SAVING_PERCENTAGE: 0.8,      // 80% Ersparnis mit Dashboard
    WEEKS_PER_MONTH: 4.33,       // Durchschn. Wochen/Monat
    MONTHS_PER_YEAR: 12,

    DEFAULT_EMPLOYEES: 8,
    DEFAULT_HOURS: 5,
    DEFAULT_RATE: 55,

    TWEEN_DURATION: 800,         // ms für Count-Up Animation
    DEBOUNCE_DELAY: 100,         // ms Debounce für Slider
  };

  // ═════════════════════════════════════════════
  // STATE
  // ═════════════════════════════════════════════

  let state = {
    employees: CONFIG.DEFAULT_EMPLOYEES,
    hoursPerWeek: CONFIG.DEFAULT_HOURS,
    hourlyRate: CONFIG.DEFAULT_RATE,
    costPerMonth: 0,
    costPerYear: 0,
    savingPerMonth: 0,
    savingPerYear: 0,
  };

  // ═════════════════════════════════════════════
  // UTILITY FUNCTIONS
  // ═════════════════════════════════════════════

  /**
   * Formatiert Zahlen als EUR (deutsches Format, kein Dezimal)
   * Beispiel: 9500 → "€9.500"
   */
  function formatEUR(num) {
    return '€' + Math.round(num).toLocaleString('de-DE');
  }

  /**
   * Debounce Function: Verzögert Funktion-Calls
   */
  function debounce(func, delay) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Checked ob User Reduced Motion bevorzugt
   */
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Easing Function: Ease Out Quart (smooth deceleration)
   */
  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  // ═════════════════════════════════════════════
  // BERECHNUNGEN
  // ═════════════════════════════════════════════

  function calculate() {
    const hoursPerMonth = state.employees * state.hoursPerWeek * CONFIG.WEEKS_PER_MONTH;
    state.costPerMonth = hoursPerMonth * state.hourlyRate;
    state.costPerYear = state.costPerMonth * CONFIG.MONTHS_PER_YEAR;
    state.savingPerMonth = state.costPerMonth * CONFIG.SAVING_PERCENTAGE;
    state.savingPerYear = state.costPerYear * CONFIG.SAVING_PERCENTAGE;
  }

  // ═════════════════════════════════════════════
  // NUMBER TWEENING (Count-Up Animation)
  // ═════════════════════════════════════════════

  function tweenNumber(element, fromValue, toValue, duration, formatFunc) {
    if (prefersReducedMotion()) {
      element.textContent = formatFunc(toValue);
      return;
    }

    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);

      const currentValue = fromValue + (toValue - fromValue) * easedProgress;
      element.textContent = formatFunc(currentValue);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        // Add 'animating' class für Glow-Effekt
        element.classList.add('animating');
        setTimeout(() => element.classList.remove('animating'), 200);
      }
    }

    requestAnimationFrame(update);
  }

  // ═════════════════════════════════════════════
  // SVG DRAWING: BEFORE/AFTER BARS
  // ═════════════════════════════════════════════

  function drawBars() {
    const svg = document.getElementById('roi-bars-svg');
    const { costPerMonth, savingPerMonth } = state;

    const withoutDashboard = costPerMonth;
    const withDashboard = costPerMonth - savingPerMonth; // 20% des Originals

    // SVG komplett clearen
    svg.innerHTML = '';

    // Dimensions
    const width = 400;
    const height = 240;
    const barWidth = 80;
    const maxBarHeight = 160;
    const bottomPadding = 60;
    const topPadding = 20;

    // Skalierung: Max Value = withoutDashboard
    const scale = maxBarHeight / withoutDashboard;

    // Bar Heights
    const bar1Height = withoutDashboard * scale;
    const bar2Height = withDashboard * scale;

    // Bar Positions
    const bar1X = 80;
    const bar2X = 240;
    const barY1 = height - bottomPadding - bar1Height;
    const barY2 = height - bottomPadding - bar2Height;

    // ─── BAR 1: Ohne Dashboard (Warning Color) ───
    const rect1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect1.setAttribute('x', bar1X);
    rect1.setAttribute('y', barY1);
    rect1.setAttribute('width', barWidth);
    rect1.setAttribute('height', bar1Height);
    rect1.setAttribute('rx', 6);
    rect1.setAttribute('fill', '#D1A85C'); // var(--warn)
    svg.appendChild(rect1);

    // Label 1: "Ohne Dashboard"
    const label1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label1.setAttribute('x', bar1X + barWidth / 2);
    label1.setAttribute('y', height - bottomPadding + 20);
    label1.setAttribute('text-anchor', 'middle');
    label1.setAttribute('font-size', '12');
    label1.setAttribute('fill', 'var(--fg-muted)');
    label1.textContent = 'Ohne Dashboard';
    svg.appendChild(label1);

    // Value Label 1
    const value1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    value1.setAttribute('x', bar1X + barWidth / 2);
    value1.setAttribute('y', barY1 - 8);
    value1.setAttribute('text-anchor', 'middle');
    value1.setAttribute('font-size', '14');
    value1.setAttribute('font-weight', '600');
    value1.setAttribute('fill', '#F5F2EC');
    value1.textContent = formatEUR(withoutDashboard);
    svg.appendChild(value1);

    // ─── BAR 2: Mit Nuroy (Mint Green) ───
    const rect2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect2.setAttribute('x', bar2X);
    rect2.setAttribute('y', barY2);
    rect2.setAttribute('width', barWidth);
    rect2.setAttribute('height', bar2Height);
    rect2.setAttribute('rx', 6);
    rect2.setAttribute('fill', '#3fe6c0'); // Mint
    svg.appendChild(rect2);

    // Label 2: "Mit Nuroy"
    const label2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label2.setAttribute('x', bar2X + barWidth / 2);
    label2.setAttribute('y', height - bottomPadding + 20);
    label2.setAttribute('text-anchor', 'middle');
    label2.setAttribute('font-size', '12');
    label2.setAttribute('fill', 'var(--fg-muted)');
    label2.textContent = 'Mit Nuroy';
    svg.appendChild(label2);

    // Value Label 2
    const value2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    value2.setAttribute('x', bar2X + barWidth / 2);
    value2.setAttribute('y', barY2 - 8);
    value2.setAttribute('text-anchor', 'middle');
    value2.setAttribute('font-size', '14');
    value2.setAttribute('font-weight', '600');
    value2.setAttribute('fill', '#F5F2EC');
    value2.textContent = formatEUR(withDashboard);
    svg.appendChild(value2);

    // ─── ERSPARNIS-MARKER (gestrichelte Linie + Label) ───
    const arrowY = (barY1 + barY2) / 2;
    const arrowStartX = bar1X + barWidth + 12;
    const arrowEndX = bar2X - 12;

    // Gestrichelte Linie
    const arrowLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    arrowLine.setAttribute('x1', arrowStartX);
    arrowLine.setAttribute('y1', arrowY);
    arrowLine.setAttribute('x2', arrowEndX);
    arrowLine.setAttribute('y2', arrowY);
    arrowLine.setAttribute('stroke', '#FF2D7A'); // Pink
    arrowLine.setAttribute('stroke-width', '2');
    arrowLine.setAttribute('stroke-dasharray', '4 4');
    svg.appendChild(arrowLine);

    // Pfeil-Spitze (rechts)
    const arrowHead = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    arrowHead.setAttribute('points', `${arrowEndX},${arrowY} ${arrowEndX - 6},${arrowY - 4} ${arrowEndX - 6},${arrowY + 4}`);
    arrowHead.setAttribute('fill', '#FF2D7A');
    svg.appendChild(arrowHead);

    // Label "Ihre Ersparnis"
    const savingLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    savingLabel.setAttribute('x', (arrowStartX + arrowEndX) / 2 + 35);
    savingLabel.setAttribute('y', arrowY - 10);
    savingLabel.setAttribute('text-anchor', 'middle');
    savingLabel.setAttribute('font-size', '12');
    savingLabel.setAttribute('font-weight', '600');
    savingLabel.setAttribute('fill', '#F5F2EC'); // Weiß für bessere Lesbarkeit
    savingLabel.setAttribute('class', 'saving-label');
    savingLabel.textContent = 'Ihre Ersparnis';
    svg.appendChild(savingLabel);

    // Value Label Ersparnis
    const savingValue = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    savingValue.setAttribute('x', (arrowStartX + arrowEndX) / 2 + 35);
    savingValue.setAttribute('y', arrowY + 20);
    savingValue.setAttribute('text-anchor', 'middle');
    savingValue.setAttribute('font-size', '13');
    savingValue.setAttribute('font-weight', '700');
    savingValue.setAttribute('fill', '#F5F2EC'); // Weiß für bessere Lesbarkeit
    savingValue.setAttribute('class', 'saving-label');
    savingValue.textContent = formatEUR(savingPerMonth);
    svg.appendChild(savingValue);
  }

  // ═════════════════════════════════════════════
  // SVG DRAWING: 12-MONTH CUMULATIVE CURVE
  // ═════════════════════════════════════════════

  function drawCurve() {
    const svg = document.getElementById('roi-curve-svg');
    const { costPerMonth, savingPerMonth } = state;

    // SVG clearen
    svg.innerHTML = '';

    // Dimensions
    const width = 400;
    const height = 200;
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const months = 12;

    // Kumulative Kosten berechnen
    const cumulativeWithout = [];
    const cumulativeWith = [];

    for (let i = 0; i <= months; i++) {
      cumulativeWithout.push(costPerMonth * i);
      cumulativeWith.push((costPerMonth - savingPerMonth) * i);
    }

    // Max Value für Skalierung
    const maxValue = cumulativeWithout[months];
    const scaleY = chartHeight / maxValue;
    const scaleX = chartWidth / months;

    // ─── Y-AXIS (Grid Lines + Labels) ───
    const ySteps = 4;
    for (let i = 0; i <= ySteps; i++) {
      const value = (maxValue / ySteps) * i;
      const y = padding.top + chartHeight - (value * scaleY);

      // Grid Line
      const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      gridLine.setAttribute('x1', padding.left);
      gridLine.setAttribute('y1', y);
      gridLine.setAttribute('x2', padding.left + chartWidth);
      gridLine.setAttribute('y2', y);
      gridLine.setAttribute('class', 'grid-line');
      svg.appendChild(gridLine);

      // Y-Label
      const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      yLabel.setAttribute('x', padding.left - 8);
      yLabel.setAttribute('y', y + 4);
      yLabel.setAttribute('text-anchor', 'end');
      yLabel.setAttribute('font-size', '11');
      yLabel.setAttribute('fill', 'var(--fg-muted)');
      yLabel.textContent = formatEUR(value);
      svg.appendChild(yLabel);
    }

    // ─── X-AXIS (Labels) ───
    const xLabels = [0, 3, 6, 9, 12];
    xLabels.forEach(month => {
      const x = padding.left + (month * scaleX);
      const y = padding.top + chartHeight + 20;

      const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      xLabel.setAttribute('x', x);
      xLabel.setAttribute('y', y);
      xLabel.setAttribute('text-anchor', 'middle');
      xLabel.setAttribute('font-size', '11');
      xLabel.setAttribute('fill', '#F5F2EC');
      xLabel.textContent = month + 'M';
      svg.appendChild(xLabel);
    });

    // ─── FILLED AREA (Gap zwischen Linien, Pink Glow) ───
    const areaPoints = [];

    // Start: "Mit Nuroy" Linie (unten)
    for (let i = 0; i <= months; i++) {
      const x = padding.left + (i * scaleX);
      const y = padding.top + chartHeight - (cumulativeWith[i] * scaleY);
      areaPoints.push(`${x},${y}`);
    }

    // Reverse: "Ohne Dashboard" Linie (oben)
    for (let i = months; i >= 0; i--) {
      const x = padding.left + (i * scaleX);
      const y = padding.top + chartHeight - (cumulativeWithout[i] * scaleY);
      areaPoints.push(`${x},${y}`);
    }

    const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    areaPath.setAttribute('points', areaPoints.join(' '));
    areaPath.setAttribute('fill', 'rgba(255, 45, 122, 0.15)'); // Pink glow
    svg.appendChild(areaPath);

    // ─── LINE 1: Ohne Dashboard (Warning Color) ───
    const points1 = [];
    for (let i = 0; i <= months; i++) {
      const x = padding.left + (i * scaleX);
      const y = padding.top + chartHeight - (cumulativeWithout[i] * scaleY);
      points1.push(`${x},${y}`);
    }

    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    line1.setAttribute('points', points1.join(' '));
    line1.setAttribute('fill', 'none');
    line1.setAttribute('stroke', '#D1A85C'); // Warning
    line1.setAttribute('stroke-width', '2');
    svg.appendChild(line1);

    // ─── LINE 2: Mit Nuroy (Mint Green) ───
    const points2 = [];
    for (let i = 0; i <= months; i++) {
      const x = padding.left + (i * scaleX);
      const y = padding.top + chartHeight - (cumulativeWith[i] * scaleY);
      points2.push(`${x},${y}`);
    }

    const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    line2.setAttribute('points', points2.join(' '));
    line2.setAttribute('fill', 'none');
    line2.setAttribute('stroke', '#3fe6c0'); // Mint
    line2.setAttribute('stroke-width', '2');
    svg.appendChild(line2);

    // ─── LEGEND (top-right) ───
    const legendX = width - padding.right - 120;
    const legendY = 5;

    // Legend Item 1: Ohne Dashboard
    const legendRect1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    legendRect1.setAttribute('x', legendX);
    legendRect1.setAttribute('y', legendY);
    legendRect1.setAttribute('width', 16);
    legendRect1.setAttribute('height', 3);
    legendRect1.setAttribute('fill', '#D1A85C');
    svg.appendChild(legendRect1);

    const legendLabel1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    legendLabel1.setAttribute('x', legendX + 22);
    legendLabel1.setAttribute('y', legendY + 3);
    legendLabel1.setAttribute('font-size', '12');
    legendLabel1.setAttribute('fill', '#F5F2EC');
    legendLabel1.setAttribute('class', 'legend-label');
    legendLabel1.textContent = 'Ohne Dashboard';
    svg.appendChild(legendLabel1);

    // Legend Item 2: Mit Nuroy
    const legendRect2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    legendRect2.setAttribute('x', legendX);
    legendRect2.setAttribute('y', legendY + 14);
    legendRect2.setAttribute('width', 16);
    legendRect2.setAttribute('height', 3);
    legendRect2.setAttribute('fill', '#3fe6c0');
    svg.appendChild(legendRect2);

    const legendLabel2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    legendLabel2.setAttribute('x', legendX + 22);
    legendLabel2.setAttribute('y', legendY + 17);
    legendLabel2.setAttribute('font-size', '12');
    legendLabel2.setAttribute('fill', '#F5F2EC');
    legendLabel2.setAttribute('class', 'legend-label');
    legendLabel2.textContent = 'Mit Nuroy';
    svg.appendChild(legendLabel2);
  }

  // ═════════════════════════════════════════════
  // UI UPDATE
  // ═════════════════════════════════════════════

  function updateUI() {
    calculate();

    // Slider-Value-Displays aktualisieren
    document.getElementById('roi-employees-value').textContent = state.employees;
    document.getElementById('roi-hours-value').textContent = state.hoursPerWeek;
    document.getElementById('roi-rate-value').textContent = state.hourlyRate + ' €';

    // Big Counter animiert zählen
    const costDisplay = document.getElementById('roi-cost-month');
    const previousCost = parseFloat(costDisplay.textContent.replace(/[^0-9]/g, '')) || 0;
    tweenNumber(costDisplay, previousCost, state.costPerMonth, CONFIG.TWEEN_DURATION, formatEUR);

    // Explainer-Text aktualisieren (bold values)
    document.getElementById('explainer-employees').textContent = state.employees + ' Mitarbeitern';
    document.getElementById('explainer-hours').textContent = state.hoursPerWeek + ' Std./Woche';
    document.getElementById('explainer-cost-month').textContent = formatEUR(state.costPerMonth) + ' pro Monat';
    document.getElementById('explainer-cost-year').textContent = formatEUR(state.costPerYear) + ' im Jahr';
    document.getElementById('explainer-saving-month').textContent = formatEUR(state.savingPerMonth) + ' pro Monat';

    // SVGs neu zeichnen
    drawBars();
    drawCurve();
  }

  // Debounced version für Slider (smooth interaction)
  const debouncedUpdate = debounce(updateUI, CONFIG.DEBOUNCE_DELAY);

  // ═════════════════════════════════════════════
  // EVENT LISTENERS
  // ═════════════════════════════════════════════

  function attachListeners() {
    const employeesSlider = document.getElementById('roi-employees');
    const hoursSlider = document.getElementById('roi-hours');
    const rateSlider = document.getElementById('roi-rate');

    if (employeesSlider) {
      employeesSlider.addEventListener('input', (e) => {
        state.employees = parseInt(e.target.value, 10);
        debouncedUpdate();
      });
    }

    if (hoursSlider) {
      hoursSlider.addEventListener('input', (e) => {
        state.hoursPerWeek = parseFloat(e.target.value);
        debouncedUpdate();
      });
    }

    if (rateSlider) {
      rateSlider.addEventListener('input', (e) => {
        state.hourlyRate = parseInt(e.target.value, 10);
        debouncedUpdate();
      });
    }
  }

  // ═════════════════════════════════════════════
  // INIT
  // ═════════════════════════════════════════════

  function init() {
    updateUI();         // Initial render
    attachListeners();  // Attach slider events
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
