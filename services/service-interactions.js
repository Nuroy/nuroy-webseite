/* ============================================================
   SERVICE INTERACTIONS — Scroll-Linked Animations
   ============================================================ */

class FeatureCardParallax {
  constructor() {
    this.cards = document.querySelectorAll('.feature-card');
    this.ticking = false;
    this.isTouchDevice = 'ontouchstart' in window;
    if (this.isTouchDevice) return; // Disable auf Mobile
    this.init();
  }

  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
        }
      });
    }, { threshold: 0.1 });

    const grid = document.querySelector('#features-grid') || document.querySelector('.feature-cards-grid');
    if (grid) observer.observe(grid);
  }

  handleScroll() {
    if (!this.ticking) {
      requestAnimationFrame(() => this.updateParallax());
      this.ticking = true;
    }
  }

  updateParallax() {
    this.cards.forEach((card, index) => {
      const row = Math.floor(index / 3);
      const speed = [20, 10, 5][row] || 0;
      const rect = card.getBoundingClientRect();
      const scrollProgress = (window.innerHeight - rect.top) / window.innerHeight;
      const offset = Math.max(0, Math.min(1, scrollProgress)) * speed;

      card.style.setProperty('--parallax-y', `${offset}px`);
    });
    this.ticking = false;
  }
}

class TimelineProgressBar {
  constructor() {
    this.timeline = document.querySelector('.process-steps');
    this.steps = document.querySelectorAll('.process-step');
    if (!this.timeline) return;
    this.init();
  }

  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          window.addEventListener('scroll', () => this.updateProgress(), { passive: true });
        }
      });
    }, { threshold: 0.3 });

    observer.observe(this.timeline);
  }

  updateProgress() {
    const rect = this.timeline.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    const start = windowHeight * 0.7;
    const end = windowHeight * 0.3;

    let progress = 0;
    if (rect.top < start && rect.top > end) {
      progress = (start - rect.top) / (start - end);
    } else if (rect.top <= end) {
      progress = 1;
    }

    this.timeline.style.setProperty('--timeline-progress', progress);

    // Activate circles sequentially
    this.steps.forEach((step, index) => {
      const stepProgress = index / (this.steps.length - 1);
      if (progress >= stepProgress) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });
  }
}

// Enhanced "Für wen" Cards Renderer
function renderEnhancedForWhoCards() {
  const container = document.getElementById('match-yes-enhanced');
  if (!container) return;

  const data = window.SERVICE_DATA?.forWho?.yes || [];
  if (!data.length) return;

  // Icons for each card (simple checkmark SVG)
  const checkIcon = `
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
    </svg>
  `;

  container.innerHTML = data.map(text => `
    <div class="fuer-wen-card">
      <div class="fuer-wen-card-icon">
        ${checkIcon}
      </div>
      <p class="fuer-wen-card-text">${text}</p>
    </div>
  `).join('');
}

/* ============================================================
   SERVICE ACCORDION — Animated Expandable Sections
   ============================================================ */

(function() {
  'use strict';

  // Service Type Icons (SVG from global ICONS library)
  const SERVICE_TAG_ICONS = {
    'Vertrieb': 'presentation-chart-line',    // Sales chart
    'Marketing': 'megaphone',            // Marketing megaphone
    'Operations': 'cog-6-tooth',                 // Operations gear
    'CX': 'users',                       // Customer Success users
    'Finance': 'currency-euro'                // Finance currency
  };

  // Wait for DOM
  document.addEventListener('DOMContentLoaded', initServiceAccordion);

  function initServiceAccordion() {
    // Support multiple IDs (dashboards, service pages, funnel page)
    const container = document.querySelector('#dashboard-accordion') ||
                      document.querySelector('#service-accordion') ||
                      document.querySelector('#funnel-dashboard-accordion');

    // Support both old dashboardModules and new serviceTypes
    const modules = window.SERVICE_DATA?.serviceTypes ||
                    window.SERVICE_DATA?.dashboardModules;

    if (!container || !modules || !modules.length) return;

    // Render accordion items
    renderAccordion(container, modules);

    // Attach click handlers
    attachAccordionHandlers(container);
  }

  function renderAccordion(container, modules) {
    container.innerHTML = modules.map((mod, index) => {
      // Get icon name: use explicit icon from data, or map from tag, or fallback to 'chart-bar'
      const iconName = mod.icon || SERVICE_TAG_ICONS[mod.tag] || 'chart-bar';
      // Get SVG from global ICONS library
      const icon = window.ICONS?.[iconName] || window.ICONS?.['chart-bar'] || '';

      return `
        <div class="accordion-item" data-index="${index}">
          <div class="accordion-header">
            <div class="accordion-header-left">
              <div class="accordion-icon-wrapper">
                ${icon}
              </div>
              <div class="accordion-header-content">
                <h3>${mod.title}</h3>
                <p class="accordion-header-desc">${mod.desc}</p>
              </div>
            </div>
            <span class="accordion-tag">${mod.tag}</span>
            <div class="accordion-chevron">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
          <div class="accordion-body">
            <div class="accordion-body-inner">
              ${mod.image ? `
                <div class="accordion-mockup">
                  <img src="${mod.image}" alt="${mod.title} Mockup" loading="lazy">
                </div>
              ` : ''}
              <p class="accordion-detailed-desc">${mod.detailedDesc || mod.desc}</p>
              <div class="accordion-features">
                <strong>Was drin ist:</strong>
                <ul>
                  ${(mod.features || []).map(f => `<li>${f}</li>`).join('')}
                </ul>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function attachAccordionHandlers(container) {
    const items = container.querySelectorAll('.accordion-item');

    items.forEach(item => {
      const header = item.querySelector('.accordion-header');
      const body = item.querySelector('.accordion-body');

      header.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all other items
        items.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
          }
        });

        // Toggle current item
        if (isActive) {
          item.classList.remove('active');
        } else {
          item.classList.add('active');

          // Smooth scroll to item if it's below viewport
          setTimeout(() => {
            const rect = item.getBoundingClientRect();
            const isBelow = rect.top < 0;

            if (isBelow) {
              item.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 100);
        }
      });
    });

    // Open first item by default
    if (items.length > 0) {
      setTimeout(() => {
        items[0].classList.add('active');
      }, 300);
    }
  }
})();

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const isDashboardPage = document.querySelector('.service-hero-enhanced') ||
                          document.querySelector('.feature-card');

  if (!isDashboardPage) return;

  new FeatureCardParallax();
  new TimelineProgressBar();
  renderEnhancedForWhoCards();
});
