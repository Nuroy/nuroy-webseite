/* ============================================================
   NUROY SERVICES — Mockup Interactions
   Handles mockup variant switching and animations
   ============================================================ */

class MockupSwitcher {
  constructor(container) {
    this.container = container;
    this.image = container.querySelector('#mockup-image');
    this.variants = container.querySelectorAll('.mockup-variant-btn');

    if (!this.image || !this.variants.length) {
      console.warn('MockupSwitcher: Missing image or variant buttons');
      return;
    }

    this.init();
  }

  init() {
    this.variants.forEach(btn => {
      btn.addEventListener('click', () => this.switchVariant(btn));
    });
  }

  switchVariant(btn) {
    const mockupPath = btn.dataset.mockup;

    if (!mockupPath) {
      console.warn('MockupSwitcher: No mockup path specified');
      return;
    }

    // Remove active class from all buttons
    this.variants.forEach(b => b.classList.remove('active'));

    // Add active class to clicked button
    btn.classList.add('active');

    // Fade out image
    this.image.style.opacity = '0';
    this.image.style.transition = 'opacity 0.2s ease';

    // Switch image after fade
    setTimeout(() => {
      this.image.src = mockupPath;

      // Fade in new image
      setTimeout(() => {
        this.image.style.opacity = '1';
      }, 50);
    }, 200);
  }
}

// Initialize all mockup switchers on page
document.addEventListener('DOMContentLoaded', () => {
  const mockupContainers = document.querySelectorAll('.service-vsl-wrapper');

  mockupContainers.forEach(container => {
    new MockupSwitcher(container);
  });
});

/* ============================================================
   Dashboard Mockup Rendering Functions
   ============================================================ */

/**
 * Renders a complete dashboard mockup with stats, chart, and table
 * @param {Object} data - Dashboard data configuration
 * @returns {string} HTML string
 */
function renderDashboardMockup(data) {
  const { stats, chartPath, tableRows, title, badge } = data;

  return `
    <div class="cs-mockup-frame">
      <div class="mockup-topbar">
        <div class="mockup-dots">
          <div class="mockup-dot mockup-dot-red"></div>
          <div class="mockup-dot mockup-dot-yellow"></div>
          <div class="mockup-dot mockup-dot-green"></div>
        </div>
        <span class="mockup-title">${title || 'dashboard'}</span>
        ${badge ? `
          <div class="mockup-badge">
            <span class="badge-dot"></span>
            <span style="color:var(--ok)">${badge}</span>
          </div>
        ` : ''}
      </div>
      <div class="mockup-body">
        ${renderStats(stats)}
        ${chartPath ? renderChart(chartPath) : ''}
        ${tableRows ? renderTable(tableRows) : ''}
      </div>
    </div>
  `;
}

/**
 * Renders stats grid
 */
function renderStats(stats) {
  if (!stats || !stats.length) return '';

  return `
    <div class="m-stats">
      ${stats.map(stat => `
        <div class="m-stat">
          <div class="m-stat-label">${stat.label}</div>
          <div class="m-stat-value" ${stat.color ? `style="color:${stat.color}"` : ''}>
            ${stat.value}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Renders SVG chart
 */
function renderChart(pathData) {
  return `
    <div class="m-chart">
      <svg width="100%" height="48" viewBox="0 0 500 48" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#FF2D7A" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="#FF2D7A" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <path d="${pathData}" fill="url(#chart-gradient)"/>
        <path d="${pathData.split('L500,48')[0]}" fill="none" stroke="#FF2D7A" stroke-width="1.5"/>
      </svg>
    </div>
  `;
}

/**
 * Renders table with rows
 */
function renderTable(rows) {
  if (!rows || !rows.length) return '';

  return `
    <div class="m-table-header">
      <span>Nr.</span>
      <span>Name</span>
      <span>Wert</span>
      <span>Datum</span>
      <span>Status</span>
    </div>
    ${rows.map(row => `
      <div class="m-table-row">
        <span class="m-id">${row.id}</span>
        <span>${row.name}</span>
        <span class="m-amount">${row.value}</span>
        <span>${row.date}</span>
        <span class="m-status ${row.statusClass}">${row.status}</span>
      </div>
    `).join('')}
  `;
}

/**
 * Example usage for dashboards.html
 */
const DASHBOARD_MOCKUP_DATA = {
  main: {
    title: 'custom dashboard — all-in-one',
    badge: 'Live sync aktiv',
    stats: [
      { label: 'Total Revenue', value: '€ 84.200' },
      { label: 'Active Users', value: '1.243', color: 'var(--ok)' },
      { label: 'Conversion', value: '3.2%', color: 'var(--pink)' }
    ],
    chartPath: 'M0,44 C40,40 70,34 110,30 C150,26 170,36 210,32 C250,28 270,18 310,14 C350,10 380,20 420,16 C450,13 470,6 500,4 L500,48 L0,48Z',
    tableRows: [
      { id: '#1042', name: 'Google Analytics', value: '2.4k', date: 'heute', status: 'synced', statusClass: 'status-ok' },
      { id: '#1043', name: 'Stripe', value: '€ 8.7k', date: 'heute', status: 'synced', statusClass: 'status-ok' },
      { id: '#1044', name: 'HubSpot', value: '142', date: '10 min', status: 'syncing', statusClass: 'status-pending' },
      { id: '#1045', name: 'Shopify', value: '€ 4.2k', date: 'heute', status: 'synced', statusClass: 'status-ok' }
    ]
  },
  marketing: {
    title: 'marketing dashboard',
    badge: 'GA4 + Meta Ads',
    stats: [
      { label: 'Ad Spend', value: '€ 12.400' },
      { label: 'Conversions', value: '342', color: 'var(--ok)' },
      { label: 'ROAS', value: '4.2x', color: 'var(--pink)' }
    ],
    chartPath: 'M0,40 C50,35 100,30 150,28 C200,26 250,32 300,30 C350,28 400,24 450,20 C470,18 490,15 500,12 L500,48 L0,48Z',
    tableRows: [
      { id: '#M01', name: 'Meta Ads', value: '€ 6.2k', date: 'heute', status: 'aktiv', statusClass: 'status-ok' },
      { id: '#M02', name: 'Google Ads', value: '€ 4.8k', date: 'heute', status: 'aktiv', statusClass: 'status-ok' },
      { id: '#M03', name: 'LinkedIn', value: '€ 1.4k', date: 'heute', status: 'paused', statusClass: 'status-warning' }
    ]
  },
  sales: {
    title: 'sales dashboard',
    badge: 'CRM sync',
    stats: [
      { label: 'Pipeline', value: '€ 142k' },
      { label: 'Closed', value: '€ 84k', color: 'var(--ok)' },
      { label: 'Win Rate', value: '68%', color: 'var(--pink)' }
    ],
    chartPath: 'M0,38 C60,36 120,34 180,32 C240,30 300,28 360,26 C420,24 480,22 500,20 L500,48 L0,48Z',
    tableRows: [
      { id: '#D142', name: 'Acme Corp', value: '€ 24k', date: '15.02', status: 'closing', statusClass: 'status-pending' },
      { id: '#D143', name: 'TechStart GmbH', value: '€ 18k', date: '20.02', status: 'won', statusClass: 'status-ok' },
      { id: '#D144', name: 'DataFlow Inc', value: '€ 32k', date: '28.02', status: 'negotiation', statusClass: 'status-warning' }
    ]
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MockupSwitcher,
    renderDashboardMockup,
    DASHBOARD_MOCKUP_DATA
  };
}
