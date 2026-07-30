/* ============================================================
   NUROY: Service Page Content Population
   Reads SERVICE_DATA object and populates HTML sections
   ============================================================ */

(function() {
  console.log('[populate-service] Starting...');
  console.log('[populate-service] window.ICONS loaded?', !!window.ICONS, window.ICONS ? Object.keys(window.ICONS).length + ' icons' : 'NO ICONS');
  console.log('[populate-service] window.SERVICE_DATA loaded?', !!window.SERVICE_DATA);

  if (!window.SERVICE_DATA) {
    console.error('[populate-service] ERROR: No SERVICE_DATA found!');
    return;
  }

  const data = window.SERVICE_DATA;
  console.log('[populate-service] SERVICE_DATA:', data);

  // Populate hero
  const heroEyebrow = document.getElementById('hero-eyebrow');
  const heroHeadline = document.getElementById('hero-headline');
  const heroSubline = document.getElementById('hero-subline');

  if (heroEyebrow) heroEyebrow.textContent = `LEISTUNG ${data.meta.number}/${data.meta.total}`;
  if (heroHeadline) heroHeadline.textContent = data.hero.headline;
  if (heroSubline) heroSubline.textContent = data.hero.subline;

  // Populate sneak-peek
  const sneakHeadline = document.getElementById('sneak-headline');
  const sneakContext = document.getElementById('sneak-context');

  if (sneakHeadline) sneakHeadline.textContent = data.sneakPeek.headline;
  if (sneakContext) sneakContext.textContent = data.sneakPeek.context;

  // Populate mockup (simple placeholder - can be enhanced)
  const mockupContainer = document.getElementById('mockup-container');
  if (mockupContainer && data.sneakPeek.mockupType) {
    let mockupHTML = '';

    if (data.sneakPeek.mockupType === 'dashboard') {
      mockupHTML = `
        <div style="background: var(--bg); border: 1px solid var(--line-strong); border-radius: 8px; padding: 32px; text-align: center;">
          <div class="feature-icon" style="margin: 0 auto 16px;">${window.ICONS.chart || ''}</div>
          <p class="t-body c-muted">Dashboard-Visualisierung</p>
        </div>
      `;
    } else if (data.sneakPeek.mockupType === 'flow') {
      mockupHTML = `
        <div style="background: var(--bg); border: 1px solid var(--line-strong); border-radius: 8px; padding: 32px; text-align: center;">
          <div class="feature-icon" style="margin: 0 auto 16px;">${window.ICONS.workflow || ''}</div>
          <p class="t-body c-muted">Workflow-Visualisierung</p>
        </div>
      `;
    } else if (data.sneakPeek.mockupType === 'code') {
      mockupHTML = `
        <div style="background: var(--bg); border: 1px solid var(--line-strong); border-radius: 8px; padding: 32px; text-align: center;">
          <div class="feature-icon" style="margin: 0 auto 16px;">${window.ICONS.code || ''}</div>
          <p class="t-body c-muted">Code-Visualisierung</p>
        </div>
      `;
    } else {
      mockupHTML = `
        <div style="background: var(--bg); border: 1px solid var(--line-strong); border-radius: 8px; padding: 32px; text-align: center;">
          <p class="t-body c-muted">Mockup-Platzhalter</p>
        </div>
      `;
    }

    mockupContainer.innerHTML = mockupHTML;
  }

  // Populate features (grid or list)
  const featuresGrid = document.getElementById('features-grid');
  const featuresList = document.getElementById('features-list');

  if ((featuresGrid || featuresList) && data.features) {
    // Grid-style (for _template)
    if (featuresGrid) {
      console.log('[populate-service] Populating', data.features.length, 'features (grid)...');
      featuresGrid.innerHTML = '';
      data.features.forEach((feature, index) => {
        const card = document.createElement('div');
        card.className = 'feature-card';
        const iconSvg = window.ICONS?.[feature.icon] || window.ICONS?.['target'] || '';

        if (!iconSvg) {
          console.warn(`[populate-service] Missing icon for feature #${index + 1}: "${feature.icon}"`);
        }

        card.innerHTML = `
          <div class="feature-icon">${iconSvg}</div>
          <h3>${feature.title}</h3>
          <p>${feature.desc}</p>
        `;
        featuresGrid.appendChild(card);
      });
      console.log('[populate-service] ✓ Features grid populated');
    }

    // List-style (for strategy-audit and others)
    if (featuresList) {
      console.log('[populate-service] Populating', data.features.length, 'features (list)...');
      featuresList.innerHTML = '';
      data.features.forEach(feature => {
        const li = document.createElement('li');
        li.textContent = feature;
        featuresList.appendChild(li);
      });
      console.log('[populate-service] ✓ Features list populated');
    }
  } else {
    if (!featuresGrid && !featuresList) {
      console.error('[populate-service] ERROR: Neither #features-grid nor #features-list found!');
    }
    if (!data.features) console.error('[populate-service] ERROR: data.features missing!');
  }

  // Populate KPIs
  const kpisGrid = document.getElementById('kpis-grid');
  if (kpisGrid && data.kpis) {
    console.log('[populate-service] Populating', data.kpis.length, 'KPIs...');
    kpisGrid.innerHTML = '';
    data.kpis.forEach((kpi, index) => {
      const card = document.createElement('div');
      card.className = 'service-kpi-card reveal';
      card.style.animationDelay = `${index * 0.1}s`;
      const iconSvg = window.ICONS?.[kpi.icon] || '';

      if (!iconSvg) {
        console.warn(`[populate-service] Missing icon for KPI: "${kpi.icon}"`);
      }

      card.innerHTML = `
        <div class="kpi-icon">${iconSvg}</div>
        <div class="kpi-value">${kpi.value}</div>
        <div class="kpi-label">${kpi.label}</div>
      `;
      kpisGrid.appendChild(card);
    });
    console.log('[populate-service] ✓ KPIs populated');
  }

  // Populate Problem Cards (conditional)
  const problemSection = document.getElementById('problem-section');
  const problemGrid = document.getElementById('problem-grid');
  if (problemGrid && data.problemCards && data.problemCards.length > 0) {
    console.log('[populate-service] Populating', data.problemCards.length, 'Problem Cards...');
    problemSection.style.display = 'block';
    problemGrid.innerHTML = '';
    data.problemCards.forEach((card, index) => {
      const cardDiv = document.createElement('div');
      cardDiv.className = 'service-problem-card reveal';
      cardDiv.style.animationDelay = `${index * 0.1}s`;
      const iconSvg = window.ICONS?.[card.icon] || '';

      cardDiv.innerHTML = `
        <div class="problem-icon">${iconSvg}</div>
        <h3 class="problem-title">${card.title}</h3>
        <p class="problem-desc">${card.desc}</p>
      `;
      problemGrid.appendChild(cardDiv);
    });
    console.log('[populate-service] ✓ Problem Cards populated');
  }

  // Inject Data Flow Visualization (conditional)
  const flowSection = document.getElementById('flow-section');
  const flowViz = document.getElementById('flow-viz');
  if (flowViz && data.hasDataFlow) {
    console.log('[populate-service] Injecting Data Flow Visualization...');
    flowSection.style.display = 'block';

    flowViz.innerHTML = `
      <svg class="dashboard-flow-svg" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#FF2D7A;stop-opacity:0.2" />
            <stop offset="100%" style="stop-color:#FF2D7A;stop-opacity:1" />
          </linearGradient>
        </defs>

        <!-- Source Nodes -->
        <g class="source-nodes">
          <circle cx="50" cy="50" r="24" fill="rgba(255,45,122,0.1)" stroke="#FF2D7A" stroke-width="2"/>
          <text x="50" y="56" text-anchor="middle" fill="#FF2D7A" font-size="12" font-weight="600">CRM</text>

          <circle cx="50" cy="130" r="24" fill="rgba(255,45,122,0.1)" stroke="#FF2D7A" stroke-width="2"/>
          <text x="50" y="136" text-anchor="middle" fill="#FF2D7A" font-size="12" font-weight="600">ERP</text>

          <circle cx="50" cy="210" r="24" fill="rgba(255,45,122,0.1)" stroke="#FF2D7A" stroke-width="2"/>
          <text x="50" y="216" text-anchor="middle" fill="#FF2D7A" font-size="12" font-weight="600">GA4</text>

          <circle cx="50" cy="290" r="24" fill="rgba(255,45,122,0.1)" stroke="#FF2D7A" stroke-width="2"/>
          <text x="50" y="296" text-anchor="middle" fill="#FF2D7A" font-size="12" font-weight="600">Shop</text>

          <circle cx="50" cy="370" r="24" fill="rgba(255,45,122,0.1)" stroke="#FF2D7A" stroke-width="2"/>
          <text x="50" y="376" text-anchor="middle" fill="#FF2D7A" font-size="12" font-weight="600">DB</text>
        </g>

        <!-- Paths -->
        <path class="path-trace" d="M 80 50 Q 300 50 550 200" stroke="url(#pathGradient)" stroke-width="3" fill="none" opacity="0.6" stroke-dasharray="10 5"/>
        <path class="path-trace" d="M 80 130 Q 280 130 550 200" stroke="url(#pathGradient)" stroke-width="3" fill="none" opacity="0.6" stroke-dasharray="10 5" style="animation-delay: 0.2s"/>
        <path class="path-trace" d="M 80 210 Q 300 210 550 200" stroke="url(#pathGradient)" stroke-width="3" fill="none" opacity="0.6" stroke-dasharray="10 5" style="animation-delay: 0.4s"/>
        <path class="path-trace" d="M 80 290 Q 280 290 550 200" stroke="url(#pathGradient)" stroke-width="3" fill="none" opacity="0.6" stroke-dasharray="10 5" style="animation-delay: 0.6s"/>
        <path class="path-trace" d="M 80 370 Q 300 370 550 200" stroke="url(#pathGradient)" stroke-width="3" fill="none" opacity="0.6" stroke-dasharray="10 5" style="animation-delay: 0.8s"/>

        <!-- Center Hub -->
        <circle cx="550" cy="200" r="40" fill="rgba(255,45,122,0.15)" stroke="#FF2D7A" stroke-width="3"/>
        <text x="550" y="206" text-anchor="middle" fill="#FF2D7A" font-size="14" font-weight="700">Dashboard</text>

        <!-- Output Paths -->
        <path class="path-trace" d="M 590 180 L 720 130" stroke="url(#pathGradient)" stroke-width="3" fill="none" opacity="0.6" stroke-dasharray="10 5" style="animation-delay: 1s"/>
        <path class="path-trace" d="M 590 220 L 720 270" stroke="url(#pathGradient)" stroke-width="3" fill="none" opacity="0.6" stroke-dasharray="10 5" style="animation-delay: 1.2s"/>

        <!-- Target Nodes -->
        <circle cx="750" cy="130" r="24" fill="rgba(255,45,122,0.1)" stroke="#FF2D7A" stroke-width="2"/>
        <text x="750" y="136" text-anchor="middle" fill="#FF2D7A" font-size="12" font-weight="600">Team</text>

        <circle cx="750" cy="270" r="24" fill="rgba(255,45,122,0.1)" stroke="#FF2D7A" stroke-width="2"/>
        <text x="750" y="276" text-anchor="middle" fill="#FF2D7A" font-size="12" font-weight="600">Slack</text>
      </svg>
    `;
    console.log('[populate-service] ✓ Data Flow Visualization injected');
  }

  // Populate "Für wen"
  const matchYes = document.getElementById('match-yes');
  if (matchYes && data.forWho && data.forWho.yes) {
    console.log('[populate-service] Populating', data.forWho.yes.length, 'YES matches...');
    matchYes.innerHTML = '';
    data.forWho.yes.forEach(point => {
      const card = document.createElement('div');
      card.className = 'match-card match-yes';
      card.textContent = point;
      matchYes.appendChild(card);
    });
    console.log('[populate-service] ✓ YES matches populated');
  }

  const matchNo = document.getElementById('match-no');
  if (matchNo && data.forWho && data.forWho.no) {
    console.log('[populate-service] Populating', data.forWho.no.length, 'NO matches...');
    matchNo.innerHTML = '';
    data.forWho.no.forEach(point => {
      const card = document.createElement('div');
      card.className = 'match-card match-no';
      card.textContent = point;
      matchNo.appendChild(card);
    });
    console.log('[populate-service] ✓ NO matches populated');
  }

  // Populate process timeline
  const processTimeline = document.getElementById('process-timeline');
  if (processTimeline && data.process) {
    console.log('[populate-service] Populating', data.process.length, 'process steps...');
    processTimeline.innerHTML = '';
    data.process.forEach(step => {
      const stepDiv = document.createElement('div');
      stepDiv.className = 'process-step';
      stepDiv.innerHTML = `
        <div class="process-num-big">${step.num}</div>
        <h3>${step.title}</h3>
        <p class="desc">${step.desc}</p>
        ${step.duration ? `<p class="details">${step.duration}</p>` : ''}
      `;
      processTimeline.appendChild(stepDiv);
    });
    console.log('[populate-service] ✓ Process steps populated');
  }

  // Populate testimonials
  const testimonialsContainer = document.getElementById('testimonials-container');
  if (testimonialsContainer && data.testimonials && window.GLOBAL_TESTIMONIALS) {
    testimonialsContainer.innerHTML = '';
    data.testimonials.forEach(id => {
      const testimonial = window.GLOBAL_TESTIMONIALS[id];
      if (!testimonial) return;

      const card = document.createElement('div');
      card.className = 'testimonial-card';
      card.innerHTML = `
        <div class="testimonial-video">
          <lite-youtube videoid="${testimonial.videoId}" playlabel="${testimonial.company} Testimonial"></lite-youtube>
        </div>
      `;
      testimonialsContainer.appendChild(card);
    });
  }

  // Populate FAQ
  const faqContainer = document.getElementById('faq-container');
  if (faqContainer && data.faq) {
    console.log('[populate-service] Populating', data.faq.length, 'FAQ items...');
    faqContainer.innerHTML = '';
    data.faq.forEach(item => {
      const details = document.createElement('details');
      details.className = 'faq-item';
      details.innerHTML = `
        <summary>${item.q}</summary>
        <p>${item.a}</p>
      `;
      faqContainer.appendChild(details);
    });
    console.log('[populate-service] ✓ FAQ populated');
  }

  // Populate related services
  const relatedContainer = document.getElementById('related-container');
  if (relatedContainer && data.related && window.ALL_SERVICES) {
    relatedContainer.innerHTML = '';
    data.related.forEach(serviceId => {
      const service = window.ALL_SERVICES.find(s => s.id === serviceId);
      if (!service) return;

      const card = document.createElement('div');
      card.className = 'service-card';
      card.innerHTML = `
        <span class="service-num">${service.num}</span>
        <h3>${service.title}</h3>
        <p>${service.tagline}</p>
        <a href="${service.url}" class="btn btn-glass-secondary">Mehr erfahren</a>
      `;
      relatedContainer.appendChild(card);
    });
  }

  // ============================================================
  // NEW: Populate Benefit Cards (for Solution Section)
  // ============================================================
  const benefitCardsStack = document.getElementById('benefit-cards-stack');
  if (benefitCardsStack && data.benefitCards && data.benefitCards.length > 0) {
    console.log('[populate-service] Populating', data.benefitCards.length, 'Benefit Cards...');
    benefitCardsStack.innerHTML = '';
    data.benefitCards.forEach((card, index) => {
      const cardDiv = document.createElement('div');
      cardDiv.className = 'dashboard-card benefit-card';
      const iconSvg = window.ICONS?.[card.icon] || '';

      if (!iconSvg) {
        console.warn(`[populate-service] Missing icon for benefit card: "${card.icon}"`);
      }

      cardDiv.innerHTML = `
        <div class="dashboard-card-icon pink">${iconSvg}</div>
        <div class="dashboard-card-content">
          <h3><span class="benefit-number">${card.number}</span> ${card.label}</h3>
          <p>${card.desc}</p>
        </div>
      `;
      benefitCardsStack.appendChild(cardDiv);
    });
    console.log('[populate-service] ✓ Benefit Cards populated');
  }

  // Populate ROI Content (right side of Solution Section)
  const roiHeadline = document.getElementById('roi-headline');
  const roiSubline = document.getElementById('roi-subline');
  if (roiHeadline && data.roiHeadline) {
    roiHeadline.textContent = data.roiHeadline;
  }
  if (roiSubline && data.roiSubline) {
    roiSubline.textContent = data.roiSubline;
  }

  // Features Checklist is now handled in the features grid/list section above (lines 72-116)

  // ============================================================
  // NEW: Initialize Wave Animation (if available)
  // ============================================================
  if (data.hasWaveBackground && typeof WavesAnimation !== 'undefined') {
    console.log('[populate-service] Initializing Wave Animation...');
    try {
      const wavesContainer = document.getElementById('waves-container');
      if (wavesContainer) {
        new WavesAnimation('waves-container');
        console.log('[populate-service] ✓ Wave Animation initialized');
      } else {
        console.warn('[populate-service] #waves-container not found, skipping wave animation');
      }
    } catch (error) {
      console.error('[populate-service] Error initializing wave animation:', error);
    }
  }

  // ============================================================
  // Populate Showcase Accordion with Service Types
  // ============================================================
  const dashboardAccordion = document.getElementById('dashboard-accordion');
  if (dashboardAccordion && data.serviceTypes && data.serviceTypes.length > 0) {
    console.log('[populate-service] Populating', data.serviceTypes.length, 'Service Types...');
    dashboardAccordion.innerHTML = '';

    data.serviceTypes.forEach((type, index) => {
      const accordionItem = document.createElement('div');
      accordionItem.className = 'accordion-item reveal';
      accordionItem.style.animationDelay = `${index * 0.1}s`;

      // Get icon SVG
      const iconSvg = window.ICONS?.[type.icon] || window.ICONS?.['target'] || '';

      accordionItem.innerHTML = `
        <div class="accordion-header" data-index="${index}">
          <div class="accordion-header-left">
            <div class="accordion-icon">${iconSvg}</div>
            <div>
              <h3 class="accordion-title">${type.title}</h3>
              <p class="accordion-desc">${type.desc}</p>
            </div>
          </div>
          <div class="accordion-header-right">
            ${type.tag ? `<span class="accordion-tag">${type.tag}</span>` : ''}
            <svg class="accordion-chevron" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 9l-7 7-7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        <div class="accordion-content">
          <div class="accordion-content-inner">
            ${type.image ? `
              <div class="accordion-mockup">
                <object type="image/svg+xml" data="${type.image}" aria-label="${type.title} Mockup">
                  <img src="${type.image}" alt="${type.title} Mockup">
                </object>
              </div>
            ` : ''}
            ${type.detailedDesc ? `
              <p class="accordion-detailed-desc">${type.detailedDesc}</p>
            ` : ''}
            ${type.features && type.features.length > 0 ? `
              <ul class="accordion-features">
                ${type.features.map(feature => `<li>${feature}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        </div>
      `;

      dashboardAccordion.appendChild(accordionItem);
    });

    // Add click handlers for accordion
    initAccordionInteractions();

    console.log('[populate-service] ✓ Accordion populated with', data.serviceTypes.length, 'items');
  }

  // Accordion interaction handler
  function initAccordionInteractions() {
    const headers = document.querySelectorAll('.accordion-header');

    headers.forEach(header => {
      header.addEventListener('click', () => {
        const item = header.closest('.accordion-item');
        const content = item.querySelector('.accordion-content');

        // Toggle active state
        const isActive = item.classList.contains('active');

        // Close all others
        document.querySelectorAll('.accordion-item').forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            otherItem.querySelector('.accordion-content').style.maxHeight = null;
          }
        });

        // Toggle current
        if (isActive) {
          item.classList.remove('active');
          content.style.maxHeight = null;
        } else {
          item.classList.add('active');
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    });
  }

})();
