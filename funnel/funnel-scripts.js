/* ============================================================
   NUROY FUNNEL: Scripts
   VSL-Player, Sticky-CTA, Tracking Events
   ============================================================ */

(function() {
  'use strict';

  // ────────────────────────────────────────────────────────────
  // Debug Mode: Set window.FUNNEL_DEBUG = true in Console
  // ────────────────────────────────────────────────────────────
  // Um Debug-Logs zu aktivieren: In Browser Console eingeben:
  // window.FUNNEL_DEBUG = true

  // ────────────────────────────────────────────────────────────
  // Sticky CTA Logic
  // ────────────────────────────────────────────────────────────
  const stickyCTA = document.getElementById('sticky-cta');
  const bookingSection = document.getElementById('booking');

  if (stickyCTA && bookingSection) {
    window.addEventListener('scroll', function() {
      const heroHeight = window.innerHeight;
      const scrollY = window.scrollY;
      const bookingTop = bookingSection.offsetTop;

      // Show after hero, hide at booking section
      if (scrollY > heroHeight && scrollY < bookingTop - 200) {
        stickyCTA.classList.add('visible');
      } else {
        stickyCTA.classList.remove('visible');
      }
    }, { passive: true });
  }

  // ────────────────────────────────────────────────────────────
  // VSL Play Event Tracking
  // ────────────────────────────────────────────────────────────
  const vslPlayer = document.querySelector('lite-youtube');
  if (vslPlayer) {
    vslPlayer.addEventListener('liteYouTubeIframeLoaded', function() {
      // Track: video_play
      if (typeof fbq !== 'undefined') {
        fbq('track', 'ViewContent', { content_name: 'Dashboard VSL' });
      }
      if (typeof gtag !== 'undefined') {
        gtag('event', 'video_play', { video_title: 'Dashboard VSL' });
      }
      console.log('[Funnel Tracking] VSL played');
    });
  }

  // ────────────────────────────────────────────────────────────
  // CTA Click Tracking
  // ────────────────────────────────────────────────────────────
  document.querySelectorAll('.btn-primary').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      const section = this.closest('section');
      const location = section ? section.id : 'unknown';

      // Track: cta_click (Lead-Event entfernt, feuert jetzt nur auf danke)
      if (typeof gtag !== 'undefined') {
        gtag('event', 'cta_click', { location: location });
      }
      console.log('[Funnel Tracking] CTA clicked:', location);
    });
  });

  // ────────────────────────────────────────────────────────────
  // Calendly Widget Event: ENTFERNT
  // Schedule-Event feuert jetzt nur 1x auf danke
  // (funnel-booking.js handhabt den Calendly-Redirect)
  // ────────────────────────────────────────────────────────────

  // ────────────────────────────────────────────────────────────
  // Solution Mockup Variants (Tab-Switcher)
  // ────────────────────────────────────────────────────────────
  const variantButtons = document.querySelectorAll('.funnel-solution-variant');
  const mockupImage = document.getElementById('solution-mockup-img');

  if (variantButtons.length > 0 && mockupImage) {
    variantButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        // Remove active class from all
        variantButtons.forEach(function(b) { b.classList.remove('active'); });

        // Add active to clicked
        this.classList.add('active');

        // Change mockup image
        const newSrc = this.getAttribute('data-img');
        if (newSrc) {
          mockupImage.src = newSrc;
        }
      });
    });
  }

  // ────────────────────────────────────────────────────────────
  // Smooth Scroll for Anchor Links
  // ────────────────────────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href.length > 1) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // ────────────────────────────────────────────────────────────
  // Hero VSL Scroll-Animation (3D-Transform): KORRIGIERT
  // ────────────────────────────────────────────────────────────
  (function initHeroScrollAnimation() {
    const hero = document.getElementById('hero');
    const vslWrapper = document.querySelector('.funnel-vsl-wrapper');
    const heroContent = document.querySelector('.funnel-hero-content');

    if (!hero || !vslWrapper || !heroContent) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Check if mobile
    let isMobile = window.innerWidth <= 768;

    // Animation ranges: KORRIGIERT für bessere Sichtbarkeit
    let scaleRange = isMobile ? [0.85, 1.0] : [1.15, 0.95]; // GRÖSSERER Unterschied!
    const rotateXRange = [20, 0]; // degrees
    const translateRange = [0, -100]; // pixels

    // Throttle helper für 60fps Performance
    function throttle(func, delay) {
      if (delay === void 0) { delay = 16; }
      let lastCall = 0;
      return function() {
        const args = arguments;
        const now = Date.now();
        if (now - lastCall >= delay) {
          func.apply(this, args);
          lastCall = now;
        }
      };
    }

    // Hauptfunktion: Berechne und wende Transforms an: VIDEO-POSITION-BASIERT
    function updateHeroAnimation() {
      const heroRect = hero.getBoundingClientRect();
      const videoRect = vslWrapper.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // VIDEO-POSITION-BASIERTE Animation
      // Ziel: Video ist FLACH (rotateX: 0deg) wenn Video-Mitte = Viewport-Mitte
      const viewportCenter = windowHeight / 2;
      const videoCenterY = videoRect.top + videoRect.height / 2;
      const offsetFromCenter = videoCenterY - viewportCenter;

      // Animation-Range: Video startet 400px unter der finalen Position
      const animationStartOffset = 400; // px: Anpassbar für kürzere/längere Animation

      // scrollProgress: 0 = Animation Start (Video 400px unter Mitte)
      //                 1 = Animation Ende (Video in Mitte, FLACH)
      const scrollProgress = Math.max(0, Math.min(1,
        (animationStartOffset - offsetFromCenter) / animationStartOffset
      ));

      // Interpolate values
      const rotateX = rotateXRange[0] + (rotateXRange[1] - rotateXRange[0]) * scrollProgress;
      const scale = scaleRange[0] + (scaleRange[1] - scaleRange[0]) * scrollProgress;

      // Apply transforms
      vslWrapper.style.transform =
        'rotateX(' + rotateX + 'deg) ' +
        'scale(' + scale + ')';

      // TEXT-PARALLAX: Basiert weiterhin auf Hero-Scroll (nicht Video-Position)
      const heroScrollProgress = Math.max(0, Math.min(1, -heroRect.top / heroRect.height));
      const translateY = translateRange[0] + (translateRange[1] - translateRange[0]) * heroScrollProgress;
      heroContent.style.transform = 'translateY(' + (translateY * 0.5) + 'px)';

      // Data-Attribut für CSS-Hooks
      vslWrapper.setAttribute('data-scroll-progress', scrollProgress.toFixed(2));

      // DEBUG: Temporär für Verification (später entfernen)
      if (window.FUNNEL_DEBUG) {
        console.log('Video Animation Debug:', {
          scrollProgress: scrollProgress.toFixed(3),
          rotateX: rotateX.toFixed(2) + 'deg',
          scale: scale.toFixed(3),
          videoCenterY: Math.round(videoCenterY),
          viewportCenter: Math.round(viewportCenter),
          offsetFromCenter: Math.round(offsetFromCenter)
        });
      }
    }

    // Event Listener mit Throttle (60fps)
    window.addEventListener('scroll', throttle(updateHeroAnimation, 16), { passive: true });

    // Initial-Call für korrekten Start-State
    updateHeroAnimation();

    // Re-Calculate auf Resize (für Orientation-Change auf Mobile)
    let resizeTimeout;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function() {
        const wasMobile = isMobile;
        const nowMobile = window.innerWidth <= 768;
        if (wasMobile !== nowMobile) {
          // Update scale range if device orientation changed
          isMobile = nowMobile;
          scaleRange = nowMobile ? [0.85, 1.0] : [1.15, 0.95];
          updateHeroAnimation();
        }
      }, 100);
    });
  })();

  // ────────────────────────────────────────────────────────────
  // Testimonial Modal Handler
  // ────────────────────────────────────────────────────────────
  (function initTestimonialModal() {
    const modal = document.getElementById('testimonial-modal');
    const modalVideo = document.getElementById('testimonial-modal-video');
    const modalBackdrop = document.querySelector('.testimonial-modal-backdrop');
    const modalClose = document.querySelector('.testimonial-modal-close');
    const testimonialCards = document.querySelectorAll('.funnel-testimonial-card');

    if (!modal || !modalVideo || testimonialCards.length === 0) {
      // Die Video-Kundenstimmen wurden entfernt, das ist der Normalfall.
      return;
    }

    /**
     * Open Modal
     * @param {string} videoId - YouTube video ID
     */
    function openModal(videoId) {
      // Create lite-youtube element
      const liteYoutube = document.createElement('lite-youtube');
      liteYoutube.setAttribute('videoid', videoId);

      // Clear previous content and inject new video
      modalVideo.innerHTML = '';
      modalVideo.appendChild(liteYoutube);

      // Show modal
      modal.classList.add('is-active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');

      // Focus trap: Focus close button
      if (modalClose) {
        modalClose.focus();
      }

      // Track modal open
      if (typeof fbq !== 'undefined') {
        fbq('track', 'ViewContent', { content_name: 'Testimonial Video', video_id: videoId });
      }
      if (typeof gtag !== 'undefined') {
        gtag('event', 'testimonial_modal_open', { video_id: videoId });
      }
      console.log('[Funnel Tracking] Testimonial modal opened:', videoId);
    }

    /**
     * Close Modal
     */
    function closeModal() {
      modal.classList.remove('is-active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');

      // Clean up video (stops playback)
      setTimeout(function() {
        modalVideo.innerHTML = '';
      }, 300); // Wait for fade-out animation

      console.log('[Funnel Tracking] Testimonial modal closed');
    }

    /**
     * Event Listeners
     */

    // Open modal on testimonial card click (ANYWHERE on card)
    testimonialCards.forEach(function(card) {
      card.addEventListener('click', function(e) {
        // Prevent default video playback in card
        e.preventDefault();
        e.stopPropagation();

        const videoId = card.getAttribute('data-video-id');
        if (videoId) {
          openModal(videoId);
        }
      });

      // Add cursor pointer to indicate clickable
      card.style.cursor = 'pointer';
    });

    // Close modal on backdrop click
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', closeModal);
    }

    // Close modal on close button click
    if (modalClose) {
      modalClose.addEventListener('click', closeModal);
    }

    // Close modal on ESC key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.classList.contains('is-active')) {
        closeModal();
      }
    });
  })();

})();
