/* ============================================================
   NUROY — Shared Components
   Injects nav, footer, cursor glow, scroll reveals
   ============================================================ */

(function () {
  // Detect depth from this script's own src
  const _scriptSrc = (document.currentScript && document.currentScript.getAttribute('src')) || '';

  // Compute absolute root path (e.g. '/projects/abc123/') so nav links always resolve correctly
  function getRootPath() {
    const pathname = window.location.pathname; // e.g. /projects/abc/arbeiten/accountly.html
    const parts = pathname.split('/');
    parts.pop(); // remove filename
    if (_scriptSrc.startsWith('../')) {
      parts.pop(); // remove one subdir (arbeiten/ or leistungen/)
    }
    return parts.join('/') + '/';
  }

  function getBase() { return getRootPath(); }

  function buildNav(b) {
    return `
<nav class="site-nav" id="site-nav">
  <div class="nav-inner">
    <a href="${b}index.html" class="nav-logo">
      <span class="nav-logo-mark"></span>
      nuroy
    </a>
    <ul class="nav-links" id="nav-links">
      <li><div class="nav-link-wrap"><span class="nav-link-num">01</span><a href="${b}projekte.html" data-text="Arbeiten">Arbeiten</a></div></li>
      <li><div class="nav-link-wrap"><span class="nav-link-num">02</span><a href="${b}leistungen.html" data-text="Leistungen">Leistungen</a></div></li>
      <li><div class="nav-link-wrap"><span class="nav-link-num">03</span><a href="${b}team.html" data-text="Team">Team</a></div></li>
      <li><div class="nav-link-wrap"><span class="nav-link-num">04</span><a href="${b}kontakt.html" data-text="Kontakt">Kontakt</a></div></li>
      <span class="nav-hover-pill" id="nav-hover-pill"></span>
    </ul>
    <div class="nav-right">
      <span class="nav-status">
        <span class="nav-status-dot"></span>
        Alle Systeme operational
      </span>
      <a href="${b}kontakt.html" class="btn btn-primary nav-cta">Erstgespräch</a>
      <button class="nav-burger" id="nav-burger" aria-label="Menü öffnen">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</nav>

<!-- Mobile Menu Overlay -->
<div class="mobile-menu" id="mobile-menu">
  <div class="mobile-menu-inner">
    <nav class="mobile-nav-links">
      <a href="${b}projekte.html" class="mobile-nav-link" data-text="Arbeiten" data-num="01">
        <span class="mnl-num">01</span>
        <span class="mnl-text">Arbeiten</span>
        <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>
      <a href="${b}leistungen.html" class="mobile-nav-link" data-text="Leistungen" data-num="02">
        <span class="mnl-num">02</span>
        <span class="mnl-text">Leistungen</span>
        <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>
      <a href="${b}team.html" class="mobile-nav-link" data-text="Team" data-num="03">
        <span class="mnl-num">03</span>
        <span class="mnl-text">Team</span>
        <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>
      <a href="${b}kontakt.html" class="mobile-nav-link" data-text="Kontakt" data-num="04">
        <span class="mnl-num">04</span>
        <span class="mnl-text">Kontakt</span>
        <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>
    </nav>
    <div class="mobile-menu-footer">
      <a href="${b}kontakt.html" class="btn btn-primary" style="width:100%;justify-content:center;padding:16px">Erstgespräch buchen →</a>
      <p class="mobile-menu-meta">Paphos, Zypern · Remote-First DACH</p>
    </div>
  </div>
</div>`;
  }

  function buildFooter(b) {
    return `
<footer class="site-footer">
  <div class="footer-grid">
    <div class="footer-brand">
      <a href="${b}index.html" class="footer-logo">
        <span class="nav-logo-mark"></span>
        nuroy
      </a>
      <p class="footer-tagline">Die Technik-Abteilung für Unternehmen, die bauen wollen, statt zu verwalten.</p>
      <p class="t-mono c-dim">Paphos, Zypern — Remote-First DACH</p>
    </div>
    <div class="footer-col">
      <p class="footer-col-label">Arbeiten</p>
      <ul>
        <li><a href="${b}projekte.html">Alle Projekte</a></li>
        <li><a href="${b}arbeiten/accountly.html">Accountly</a></li>
        <li><a href="${b}arbeiten/voice-agent.html">KI-Voice-Agent</a></li>
        <li><a href="${b}arbeiten/csm-suite.html">CSM-Suite</a></li>
        <li><a href="${b}arbeiten/crm-system.html">CRM-System</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <p class="footer-col-label">Leistungen</p>
      <ul>
        <li><a href="${b}leistungen.html">Übersicht</a></li>
        <li><a href="${b}leistungen/software.html">Softwareentwicklung</a></li>
        <li><a href="${b}leistungen/automation.html">Automatisierung</a></li>
        <li><a href="${b}leistungen/strategie.html">Strategieberatung</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <p class="footer-col-label">Unternehmen</p>
      <ul>
        <li><a href="${b}team.html">Team</a></li>
        <li><a href="${b}kontakt.html">Kontakt</a></li>
        <li><a href="${b}impressum.html">Impressum</a></li>
        <li><a href="${b}datenschutz.html">Datenschutz</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <span class="footer-bottom-text">© 2024–2026 Nuroy. Gegründet in Paphos, Zypern.</span>
    <span class="footer-bottom-text">Software · Automation · Strategie</span>
  </div>
</footer>`;
  }

  const base = getBase();
  const NAV_HTML = buildNav(base);
  const FOOTER_HTML = buildFooter(base);

  function inject() {
    // Inject nav
    const navEl = document.getElementById('nav-mount');
    if (navEl) {
      const tmp = document.createElement('div');
      tmp.innerHTML = NAV_HTML;
      while (tmp.firstElementChild) {
        navEl.parentNode.insertBefore(tmp.firstElementChild, navEl);
      }
      navEl.parentNode.removeChild(navEl);
    }

    // Inject footer
    const footerEl = document.getElementById('footer-mount');
    if (footerEl) {
      const tmp = document.createElement('div');
      tmp.innerHTML = FOOTER_HTML;
      footerEl.parentNode.insertBefore(tmp.firstElementChild, footerEl);
      footerEl.parentNode.removeChild(footerEl);
    }

    // Mark active nav link
    const path = window.location.pathname;
    document.querySelectorAll('.nav-links a').forEach(a => {
      const href = a.getAttribute('href').replace('/index.html', '/');
      if (href !== '/index.html' && href !== '/' && path.includes(href.replace(/^\//, ''))) {
        a.classList.add('active');
      }
    });
  }

  function initCursorGlow() {
    const glow = document.getElementById('cursor-glow');
    if (!glow) return;

    const isTouch = ('ontouchstart' in window) || window.matchMedia('(hover: none)').matches;

    if (isTouch) {
      // Scroll-parallax glow for touch devices
      glow.style.left = '50%';
      glow.style.top = '50%';
      glow.style.position = 'fixed';
      let ticking = false;
      window.addEventListener('scroll', function() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function() {
          const scrollY = window.scrollY;
          const docH = document.documentElement.scrollHeight - window.innerHeight;
          const progress = docH > 0 ? scrollY / docH : 0;
          // Move glow vertically from 30% to 70% of viewport
          const gy = 30 + progress * 40;
          // Slight horizontal sway
          const gx = 50 + Math.sin(progress * Math.PI * 3) * 12;
          glow.style.left = gx + '%';
          glow.style.top = gy + 'vh';
          ticking = false;
        });
      }, { passive: true });
    } else {
      // Desktop: follow cursor
      let mx = window.innerWidth / 2, my = window.innerHeight / 2;
      let cx = mx, cy = my;
      window.addEventListener('mousemove', function(e) { mx = e.clientX; my = e.clientY; });
      function loop() {
        cx += (mx - cx) * 0.08;
        cy += (my - cy) * 0.08;
        glow.style.left = cx + 'px';
        glow.style.top = cy + 'px';
        requestAnimationFrame(loop);
      }
      loop();
    }
  }

  function initScrollReveal() {
    var isMobile = window.innerWidth <= 900;

    // Apply mobile-specific animation classes
    if (isMobile) {
      // Service cards: alternate slide-in direction via data attribute
      document.querySelectorAll('.service-card').forEach(function(card, i) {
        card.dataset.mobileDir = i % 2 === 0 ? 'left' : 'right';
      });

      // Process step numbers: add glow-flash on reveal
      document.querySelectorAll('.process-num-big').forEach(function(num) {
        num.dataset.glowFlash = '1';
      });
    }

    // Observe all reveal variants
    var selectors = '.reveal, .reveal-scale, .reveal-left, .reveal-right';
    var els = document.querySelectorAll(selectors);
    if (!els.length) return;
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          // Trigger glow-flash on process numbers
          if (isMobile) {
            var nums = e.target.querySelectorAll('[data-glow-flash]');
            nums.forEach(function(n) { n.classList.add('glow-flash'); });
            // Also check if the element itself has it
            if (e.target.dataset.glowFlash) e.target.classList.add('glow-flash');
          }
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function(el) { obs.observe(el); });

    // Stats: pulse after count-up finishes (mobile only)
    if (isMobile) {
      var statNums = document.querySelectorAll('.stat-number[data-count]');
      var statObs = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          if (!e.isIntersecting) return;
          statObs.unobserve(e.target);
          // Pulse after count-up duration (1200ms + 100ms buffer)
          setTimeout(function() { e.target.classList.add('stat-pulse'); }, 1350);
        });
      }, { threshold: 0.5 });
      statNums.forEach(function(el) { statObs.observe(el); });
    }
  }

  function initNavScroll() {
    const nav = document.getElementById('site-nav');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      nav.style.borderBottomColor = window.scrollY > 20
        ? 'rgba(245,242,236,0.10)'
        : 'rgba(245,242,236,0.07)';
    }, { passive: true });
  }

  function initNavPill() {
    const list = document.getElementById('nav-links');
    const pill = document.getElementById('nav-hover-pill');
    if (!list || !pill) return;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@!%&';

    function scramble(el) {
      const original = el.dataset.text || el.textContent;
      let frame = 0;
      const totalFrames = 10;
      const len = original.length;
      if (el._scramTimer) clearInterval(el._scramTimer);
      el.classList.add('scrambling');
      el._scramTimer = setInterval(() => {
        let out = '';
        for (let i = 0; i < len; i++) {
          if (original[i] === ' ') { out += ' '; continue; }
          if (frame / totalFrames > i / len) {
            out += original[i];
          } else {
            out += chars[Math.floor(Math.random() * chars.length)];
          }
        }
        el.textContent = out;
        frame++;
        if (frame > totalFrames) {
          clearInterval(el._scramTimer);
          el.textContent = original;
          el.classList.remove('scrambling');
        }
      }, 40);
    }

    const links = list.querySelectorAll('a');
    links.forEach(a => {
      a.addEventListener('mouseenter', () => {
        const wrap = a.closest('.nav-link-wrap');
        const lr = list.getBoundingClientRect();
        const wr = wrap ? wrap.getBoundingClientRect() : a.getBoundingClientRect();
        pill.style.left = (wr.left - lr.left) + 'px';
        pill.style.width = wr.width + 'px';
        pill.style.opacity = '1';
        scramble(a);
      });
    });
    list.addEventListener('mouseleave', () => {
      pill.style.opacity = '0';
    });
  }

  function initMobileNav() {
    const burger = document.getElementById('nav-burger');
    const menu = document.getElementById('mobile-menu');
    if (!burger || !menu) return;
    const links = menu.querySelectorAll('.mobile-nav-link');

    function openMenu() {
      burger.classList.add('open');
      menu.classList.add('open');
      document.body.style.overflow = 'hidden';
      // stagger links in
      links.forEach((l, i) => {
        l.style.opacity = '0';
        l.style.transform = 'translateX(-24px)';
        setTimeout(() => {
          l.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.2,0,0,1)';
          l.style.opacity = '1';
          l.style.transform = 'translateX(0)';
        }, 80 + i * 80);
      });
    }

    function closeMenu() {
      burger.classList.remove('open');
      menu.classList.remove('open');
      document.body.style.overflow = '';
      links.forEach(l => {
        l.style.transition = 'none';
        l.style.opacity = '0';
        l.style.transform = 'translateX(-24px)';
      });
    }

    burger.addEventListener('click', () => {
      burger.classList.contains('open') ? closeMenu() : openMenu();
    });

    // close on link click
    links.forEach(l => l.addEventListener('click', closeMenu));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      inject(); initCursorGlow(); initScrollReveal(); initNavScroll(); initNavPill(); initMobileNav();
    });
  } else {
    inject(); initCursorGlow(); initScrollReveal(); initNavScroll(); initNavPill(); initMobileNav();
  }
})();
