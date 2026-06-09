/* ═══════════════════════════════════════════════════════════════
   HAVEN — Luxury Resort & Fine Dining
   Main JavaScript — Animations, Interactions, Scroll Effects
   
   Libraries: GSAP 3.12.5 + ScrollTrigger, Lenis Smooth Scroll
   Author: HAVEN Digital
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─────────────────────────────────────────────
  // 0. SAFETY CHECK — Ensure libraries are loaded
  // ─────────────────────────────────────────────
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('HAVEN: GSAP or ScrollTrigger not loaded. Animations disabled.');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ─────────────────────────────────────────────
  // UTILITY: Safe element selector with null guard
  // ─────────────────────────────────────────────
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

  /** Pad a number to 2 digits: 1 → "01" */
  const pad = (n) => String(n).padStart(2, '0');


  /* ═══════════════════════════════════════════════
     1. LENIS SMOOTH SCROLL
     ═══════════════════════════════════════════════ */
  let lenis = null;

  function initLenis() {
    try {
      if (typeof Lenis === 'undefined') {
        console.warn('HAVEN: Lenis not loaded. Falling back to native scroll.');
        return;
      }

      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
      });

      // Connect Lenis ↔ GSAP ScrollTrigger
      lenis.on('scroll', ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);
    } catch (e) {
      console.warn('HAVEN: Lenis init failed —', e);
    }
  }


  /* ═══════════════════════════════════════════════
     2. CUSTOM CURSOR (non-touch only)
     ═══════════════════════════════════════════════ */
  function initCustomCursor() {
    try {
      // Only activate for devices with a fine pointer (mouse)
      if (!window.matchMedia('(pointer: fine)').matches) return;

      const cursor = $('#customCursor');
      if (!cursor) return;

      // Make cursor visible
      cursor.style.opacity = '1';

      // gsap.quickTo for GPU-accelerated, lag-free following
      const xTo = gsap.quickTo(cursor, 'x', { duration: 0.5, ease: 'power3.out' });
      const yTo = gsap.quickTo(cursor, 'y', { duration: 0.5, ease: 'power3.out' });

      document.addEventListener('mousemove', (e) => {
        xTo(e.clientX);
        yTo(e.clientY);
      });

      // Scale up on interactive elements
      const interactiveSelectors = 'a, button, .gallery-item, .stay-card, input, select, textarea, .testimonial-dot';
      const interactiveEls = $$(interactiveSelectors);

      interactiveEls.forEach((el) => {
        el.addEventListener('mouseenter', () => {
          gsap.to(cursor, { scale: 2.5, opacity: 0.6, duration: 0.3, ease: 'power2.out' });
        });
        el.addEventListener('mouseleave', () => {
          gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' });
        });
      });

      // Hide cursor when it leaves the viewport
      document.addEventListener('mouseleave', () => {
        gsap.to(cursor, { opacity: 0, duration: 0.2 });
      });
      document.addEventListener('mouseenter', () => {
        gsap.to(cursor, { opacity: 1, duration: 0.2 });
      });
    } catch (e) {
      console.warn('HAVEN: Custom cursor init failed —', e);
    }
  }


  /* ═══════════════════════════════════════════════
     3. PRELOADER
     ═══════════════════════════════════════════════ */
  function initPreloader() {
    return new Promise((resolve) => {
      try {
        const preloader = $('#preloader');
        const preloaderText = $('#preloaderText');
        const preloaderLine = $('#preloaderLine');

        if (!preloader) {
          resolve();
          return;
        }

        const letters = preloaderText ? $$('span', preloaderText) : [];

        const tl = gsap.timeline({
          onComplete: () => {
            // Remove preloader from the DOM flow
            preloader.style.display = 'none';
            document.body.classList.add('loaded');
            resolve();
          },
        });

        // Set initial states
        if (letters.length) {
          gsap.set(letters, { opacity: 0, y: 20 });
        }
        if (preloaderLine) {
          gsap.set(preloaderLine, { width: 0 });
        }

        // Animate letters in
        if (letters.length) {
          tl.to(letters, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power3.out',
          });
        }

        // Expand the accent line
        if (preloaderLine) {
          tl.to(preloaderLine, {
            width: 60,
            duration: 0.6,
            ease: 'power2.inOut',
          }, '-=0.1');
        }

        // Hold for a beat
        tl.to({}, { duration: 1 });

        // Fade out entire preloader
        tl.to(preloader, {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.inOut',
        });
      } catch (e) {
        console.warn('HAVEN: Preloader init failed —', e);
        resolve();
      }
    });
  }


  /* ═══════════════════════════════════════════════
     4. HERO ANIMATIONS (post-preloader)
     ═══════════════════════════════════════════════ */
  function animateHero() {
    try {
      const heroLabel = $('.hero-label');
      const titleLines = $$('.hero-title .title-line');
      const heroButtons = $('.hero-buttons');
      const scrollIndicator = $('#scrollIndicator');

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Label fades in from below
      if (heroLabel) {
        gsap.set(heroLabel, { opacity: 0, y: 30 });
        tl.to(heroLabel, { opacity: 1, y: 0, duration: 0.8 });
      }

      // Title lines — clip-path reveal
      if (titleLines.length) {
        gsap.set(titleLines, { clipPath: 'inset(0 0 100% 0)', opacity: 1 });
        tl.to(titleLines, {
          clipPath: 'inset(0 0 0% 0)',
          duration: 0.9,
          stagger: 0.2,
          ease: 'power3.inOut',
        }, '-=0.4');
      }

      // Buttons fade in
      if (heroButtons) {
        gsap.set(heroButtons, { opacity: 0, y: 25 });
        tl.to(heroButtons, { opacity: 1, y: 0, duration: 0.7 }, '-=0.3');
      }

      // Scroll indicator
      if (scrollIndicator) {
        gsap.set(scrollIndicator, { opacity: 0 });
        tl.to(scrollIndicator, { opacity: 1, duration: 0.8 }, '-=0.2');
      }
    } catch (e) {
      console.warn('HAVEN: Hero animation failed —', e);
    }
  }


  /* ═══════════════════════════════════════════════
     5. HERO SLIDER
     ═══════════════════════════════════════════════ */
  function initHeroSlider() {
    try {
      const slides = $$('.hero-slide');
      const prevBtn = $('#heroPrev');
      const nextBtn = $('#heroNext');
      const counterCurrent = $('#counterCurrent');

      if (!slides.length) return;

      let currentIndex = 0;
      let autoSlideTimer = null;
      let isTransitioning = false;
      const totalSlides = slides.length;

      function goToSlide(newIndex) {
        if (isTransitioning || newIndex === currentIndex) return;
        isTransitioning = true;

        const outgoing = slides[currentIndex];
        const incoming = slides[newIndex];

        // Fade out current
        gsap.to(outgoing, {
          opacity: 0,
          duration: 0.8,
          ease: 'power2.inOut',
          onComplete: () => {
            outgoing.classList.remove('active');
          },
        });

        // Fade in new
        incoming.classList.add('active');
        gsap.fromTo(incoming,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.8,
            ease: 'power2.inOut',
            onComplete: () => {
              isTransitioning = false;
            },
          }
        );

        // Ken Burns — subtle scale on incoming image
        const incomingImg = $('img', incoming);
        if (incomingImg) {
          gsap.fromTo(incomingImg,
            { scale: 1.05 },
            { scale: 1, duration: 5, ease: 'none' }
          );
        }

        currentIndex = newIndex;

        // Update counter
        if (counterCurrent) {
          counterCurrent.textContent = pad(currentIndex + 1);
        }
      }

      function nextSlide() {
        goToSlide((currentIndex + 1) % totalSlides);
      }

      function prevSlide() {
        goToSlide((currentIndex - 1 + totalSlides) % totalSlides);
      }

      function startAutoSlide() {
        stopAutoSlide();
        autoSlideTimer = setInterval(nextSlide, 5000);
      }

      function stopAutoSlide() {
        if (autoSlideTimer) {
          clearInterval(autoSlideTimer);
          autoSlideTimer = null;
        }
      }

      // Button events
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          nextSlide();
          startAutoSlide(); // reset timer
        });
      }
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          prevSlide();
          startAutoSlide();
        });
      }

      // Initial Ken Burns on the first active slide
      const firstImg = $('img', slides[0]);
      if (firstImg) {
        gsap.fromTo(firstImg,
          { scale: 1.08 },
          { scale: 1, duration: 6, ease: 'none' }
        );
      }

      startAutoSlide();
    } catch (e) {
      console.warn('HAVEN: Hero slider init failed —', e);
    }
  }


  /* ═══════════════════════════════════════════════
     6. NAVBAR SCROLL EFFECT
     ═══════════════════════════════════════════════ */
  function initNavbar() {
    try {
      const navbar = $('#navbar');
      if (!navbar) return;

      ScrollTrigger.create({
        trigger: document.body,
        start: '100px top',
        onEnter: () => navbar.classList.add('scrolled'),
        onLeaveBack: () => navbar.classList.remove('scrolled'),
      });
    } catch (e) {
      console.warn('HAVEN: Navbar init failed —', e);
    }
  }


  /* ═══════════════════════════════════════════════
     7. MOBILE MENU
     ═══════════════════════════════════════════════ */
  function initMobileMenu() {
    try {
      const toggle = $('#mobileMenuToggle');
      const menu = $('#mobileMenu');
      const links = $$('.mobile-menu-link');

      if (!toggle || !menu) return;

      let isOpen = false;

      function openMenu() {
        isOpen = true;
        menu.classList.add('active');
        toggle.classList.add('active');
        document.body.style.overflow = 'hidden';
      }

      function closeMenu() {
        isOpen = false;
        menu.classList.remove('active');
        toggle.classList.remove('active');
        document.body.style.overflow = '';
      }

      toggle.addEventListener('click', () => {
        isOpen ? closeMenu() : openMenu();
      });

      // Close on link click
      links.forEach((link) => {
        link.addEventListener('click', () => {
          closeMenu();
        });
      });
    } catch (e) {
      console.warn('HAVEN: Mobile menu init failed —', e);
    }
  }


  /* ═══════════════════════════════════════════════
     8. ANCHOR SMOOTH SCROLL
     ═══════════════════════════════════════════════ */
  function initAnchorScroll() {
    try {
      const anchorLinks = $$('a[href^="#"]');
      anchorLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          if (!href || href === '#') return;

          const target = $(href);
          if (!target) return;

          e.preventDefault();

          if (lenis) {
            lenis.scrollTo(target, { offset: 0, duration: 1.2 });
          } else {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });
    } catch (e) {
      console.warn('HAVEN: Anchor scroll init failed —', e);
    }
  }


  /* ═══════════════════════════════════════════════
     9. SCROLL INDICATOR CLICK
     ═══════════════════════════════════════════════ */
  function initScrollIndicator() {
    try {
      const indicator = $('#scrollIndicator');
      if (!indicator) return;

      indicator.addEventListener('click', () => {
        // Scroll to the first section after hero
        const nextSection = $('#marquee') || $('#about');
        if (!nextSection) return;

        if (lenis) {
          lenis.scrollTo(nextSection, { offset: 0, duration: 1.2 });
        } else {
          nextSection.scrollIntoView({ behavior: 'smooth' });
        }
      });

      indicator.style.cursor = 'pointer';
    } catch (e) {
      console.warn('HAVEN: Scroll indicator init failed —', e);
    }
  }


  /* ═══════════════════════════════════════════════
     10. MARQUEE HOVER PAUSE
     ═══════════════════════════════════════════════ */
  function initMarquee() {
    try {
      const marquee = $('.marquee');
      if (!marquee) return;

      const tracks = $$('.marquee-content', marquee);

      marquee.addEventListener('mouseenter', () => {
        tracks.forEach((t) => {
          t.style.animationPlayState = 'paused';
        });
      });

      marquee.addEventListener('mouseleave', () => {
        tracks.forEach((t) => {
          t.style.animationPlayState = 'running';
        });
      });
    } catch (e) {
      console.warn('HAVEN: Marquee init failed —', e);
    }
  }


  /* ═══════════════════════════════════════════════
     11. SCROLL-TRIGGERED SECTION ANIMATIONS
     ═══════════════════════════════════════════════ */

  // --- 11a. ABOUT SECTION ---
  function animateAbout() {
    try {
      const section = $('#about');
      if (!section) return;

      const goldLine = $('.gold-line', section);
      const quote = $('.about-quote', section);
      const text = $('.about-text', section);
      const img = $('.about-right img', section);
      const btn = $('.btn-outline-light', section);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          once: true,
        },
        defaults: { ease: 'power3.out', duration: 0.9 },
      });

      if (goldLine) {
        gsap.set(goldLine, { width: 0 });
        tl.to(goldLine, { width: 60, duration: 0.7 });
      }

      if (quote) {
        gsap.set(quote, { opacity: 0, x: -80 });
        tl.to(quote, { opacity: 1, x: 0 }, '-=0.3');
      }

      if (text) {
        gsap.set(text, { opacity: 0, y: 30 });
        tl.to(text, { opacity: 1, y: 0, duration: 0.7 }, '-=0.5');
      }

      if (img) {
        gsap.set(img, { opacity: 0, x: 80 });
        tl.to(img, { opacity: 1, x: 0 }, '-=0.6');
      }

      if (btn) {
        gsap.set(btn, { opacity: 0, y: 15 });
        tl.to(btn, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3');
      }
    } catch (e) {
      console.warn('HAVEN: About animation failed —', e);
    }
  }

  // --- 11b. STAYS SECTION (Storytelling Animation) ---
  function animateStays() {
    try {
      const section = $('#stays');
      if (!section) return;

      const header = $('.stays-header', section);
      if (header) {
        gsap.fromTo(header,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: header, start: 'top 85%' }
          }
        );
      }

      const items = $$('.story-stay-item', section);
      items.forEach((item) => {
        const content = $('.story-stay-content', item);
        const img = $('.image-reveal img', item);
        const reveal = $('.image-reveal', item);

        // Content fade in
        gsap.fromTo(content,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 75%',
            }
          }
        );

        // Image reveal & parallax
        if (reveal && img) {
          gsap.fromTo(reveal,
            { clipPath: 'inset(10% 10% 10% 10%)', opacity: 0 },
            {
              clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 1.2, ease: 'power3.inOut',
              scrollTrigger: {
                trigger: item,
                start: 'top 75%',
              }
            }
          );

          gsap.to(img, {
            yPercent: 10,
            ease: 'none',
            scrollTrigger: {
              trigger: item,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            }
          });
        }
      });
    } catch (e) {
      console.warn('HAVEN: Stays animation failed —', e);
    }
  }

  // --- 11c. DINING SECTION (parallax + fade) ---
  function animateDining() {
    try {
      const section = $('#dining');
      if (!section) return;

      const bgImg = $('.dining-bg img', section);
      const content = $('.dining-content', section);

      // Parallax on background image
      if (bgImg) {
        gsap.to(bgImg, {
          yPercent: 20,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });
      }

      // Staggered content fade-in
      if (content) {
        const children = [...content.children];
        if (children.length) {
          gsap.set(children, { opacity: 0, y: 40 });
          gsap.to(children, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.18,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 65%',
              once: true,
            },
          });
        }
      }
    } catch (e) {
      console.warn('HAVEN: Dining animation failed —', e);
    }
  }

  // --- 11d. EXPERIENCES SECTION ---
  function animateExperiences() {
    try {
      const section = $('#experiences');
      if (!section) return;

      const items = $$('.experience-item', section);
      if (!items.length) return;

      gsap.set(items, { opacity: 0, y: 50 });

      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          once: true,
        },
      });
    } catch (e) {
      console.warn('HAVEN: Experiences animation failed —', e);
    }
  }

  // --- 11e. STATS SECTION (counter + separators) ---
  function animateStats() {
    try {
      const section = $('#stats');
      if (!section) return;

      const statNumbers = $$('.stat-number[data-target]', section);
      const statTexts = $$('.stat-number-text', section);
      const separators = $$('.stat-separator', section);
      const labels = $$('.stat-label', section);

      // Set initial visibility
      gsap.set([...statNumbers, ...statTexts, ...labels], { opacity: 0 });
      gsap.set(separators, { height: 0 });

      ScrollTrigger.create({
        trigger: section,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          // Fade in text-only stat numbers and labels
          gsap.to(statTexts, {
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
          });

          gsap.to(labels, {
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            delay: 0.3,
            ease: 'power2.out',
          });

          // Animate separators
          gsap.to(separators, {
            height: '100%',
            duration: 0.8,
            stagger: 0.15,
            ease: 'power2.inOut',
          });

          // Count up each numeric stat
          statNumbers.forEach((el) => {
            const target = parseInt(el.getAttribute('data-target'), 10);
            if (isNaN(target)) return;

            // For the year "2018", count from 2000
            const startValue = target > 999 ? 2000 : 0;

            el.style.opacity = '1';

            const obj = { value: startValue };
            gsap.to(obj, {
              value: target,
              duration: target > 999 ? 1.8 : 1.4,
              ease: 'power2.out',
              snap: { value: 1 },
              onUpdate: () => {
                el.textContent = Math.round(obj.value);
              },
            });
          });
        },
      });
    } catch (e) {
      console.warn('HAVEN: Stats animation failed —', e);
    }
  }

  // --- 11f. TESTIMONIALS ---
  function initTestimonials() {
    try {
      const slider = $('#testimonialsSlider');
      const dotsContainer = $('#testimonialDots');
      const quoteDecor = $('.quote-decoration');

      if (!slider) return;

      const testimonials = $$('.testimonial', slider);
      const dots = dotsContainer ? $$('.testimonial-dot', dotsContainer) : [];

      if (!testimonials.length) return;

      let currentIndex = 0;
      let autoTimer = null;
      let isAnimating = false;

      function showTestimonial(newIndex) {
        if (isAnimating || newIndex === currentIndex) return;
        isAnimating = true;

        const outgoing = testimonials[currentIndex];
        const incoming = testimonials[newIndex];

        // Fade out current
        gsap.to(outgoing, {
          opacity: 0,
          y: -15,
          duration: 0.5,
          ease: 'power2.in',
          onComplete: () => {
            outgoing.classList.remove('active');
          },
        });

        // Fade in new
        incoming.classList.add('active');
        gsap.fromTo(incoming,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out',
            delay: 0.15,
            onComplete: () => {
              isAnimating = false;
            },
          }
        );

        // Update dots
        dots.forEach((d, i) => {
          d.classList.toggle('active', i === newIndex);
        });

        currentIndex = newIndex;
      }

      function nextTestimonial() {
        showTestimonial((currentIndex + 1) % testimonials.length);
      }

      function startAuto() {
        stopAuto();
        autoTimer = setInterval(nextTestimonial, 4000);
      }

      function stopAuto() {
        if (autoTimer) clearInterval(autoTimer);
      }

      // Dot clicks
      dots.forEach((dot) => {
        dot.addEventListener('click', () => {
          const idx = parseInt(dot.getAttribute('data-dot'), 10);
          if (!isNaN(idx)) {
            showTestimonial(idx);
            startAuto(); // reset timer
          }
        });
      });

      // Subtle float animation on quote decoration
      if (quoteDecor) {
        gsap.to(quoteDecor, {
          y: -8,
          duration: 2.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }

      startAuto();
    } catch (e) {
      console.warn('HAVEN: Testimonials init failed —', e);
    }
  }

  // --- 11g. GALLERY ---
  function animateGallery() {
    try {
      const section = $('#gallery');
      if (!section) return;

      const items = $$('.gallery-item', section);
      if (!items.length) return;

      gsap.set(items, { opacity: 0, y: 40 });

      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          once: true,
        },
      });
    } catch (e) {
      console.warn('HAVEN: Gallery animation failed —', e);
    }
  }

  // --- 11h. CONTACT SECTION ---
  function animateContact() {
    try {
      const section = $('#contact');
      if (!section) return;

      const leftInner = $('.contact-left-inner', section);
      const rightInner = $('.contact-right-inner', section);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          once: true,
        },
        defaults: { ease: 'power3.out', duration: 0.8 },
      });

      // Left children stagger from left
      if (leftInner) {
        const leftChildren = [...leftInner.children];
        if (leftChildren.length) {
          gsap.set(leftChildren, { opacity: 0, x: -40 });
          tl.to(leftChildren, { opacity: 1, x: 0, stagger: 0.12 });
        }
      }

      // Right inner from right
      if (rightInner) {
        gsap.set(rightInner, { opacity: 0, x: 40 });
        tl.to(rightInner, { opacity: 1, x: 0 }, '-=0.5');
      }
    } catch (e) {
      console.warn('HAVEN: Contact animation failed —', e);
    }
  }

  // --- 11i. FOOTER ---
  function animateFooter() {
    try {
      const footer = $('#footer');
      if (!footer) return;

      const inner = $('.footer-inner', footer);
      if (!inner) return;

      const children = [...inner.children];
      if (!children.length) return;

      gsap.set(children, { opacity: 0, y: 25 });

      gsap.to(children, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: footer,
          start: 'top 90%',
          once: true,
        },
      });
    } catch (e) {
      console.warn('HAVEN: Footer animation failed —', e);
    }
  }


  /* ═══════════════════════════════════════════════
     12. GALLERY LIGHTBOX
     ═══════════════════════════════════════════════ */
  function initLightbox() {
    try {
      const lightbox = $('#lightbox');
      const lightboxImg = $('#lightboxImg');
      const lightboxClose = $('#lightboxClose');
      const galleryItems = $$('.gallery-item');

      if (!lightbox || !lightboxImg) return;

      function openLightbox(src) {
        lightboxImg.src = src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      }

      function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        // Clear src after transition
        setTimeout(() => {
          if (!lightbox.classList.contains('active')) {
            lightboxImg.src = '';
          }
        }, 400);
      }

      // Click gallery items to open
      galleryItems.forEach((item) => {
        item.addEventListener('click', () => {
          const img = $('img', item);
          if (img && img.src) {
            openLightbox(img.src);
          }
        });
      });

      // Close button
      if (lightboxClose) {
        lightboxClose.addEventListener('click', (e) => {
          e.stopPropagation();
          closeLightbox();
        });
      }

      // Click outside image to close
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
          closeLightbox();
        }
      });

      // Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
          closeLightbox();
        }
      });
    } catch (e) {
      console.warn('HAVEN: Lightbox init failed —', e);
    }
  }


  /* ═══════════════════════════════════════════════
     13. RESERVATION FORM
     ═══════════════════════════════════════════════ */
  function initReservationForm() {
    try {
      const form = $('#reservationForm');
      if (!form) return;

      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const submitBtn = $('button[type="submit"]', form);
        if (!submitBtn) return;

        // Store original text
        const originalText = submitBtn.textContent;

        // Success feedback
        submitBtn.textContent = 'Request Sent ✓';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        submitBtn.style.pointerEvents = 'none';

        // Reset after a few seconds so user can submit again if needed
        setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          submitBtn.style.opacity = '';
          submitBtn.style.pointerEvents = '';
          form.reset();
        }, 3000);
      });
    } catch (e) {
      console.warn('HAVEN: Reservation form init failed —', e);
    }
  }


  /* ═══════════════════════════════════════════════
     14. GENERAL REVEAL UTILITY
     Adds fade-in-up to any element with class .reveal
     ═══════════════════════════════════════════════ */
  function initRevealAnimations() {
    try {
      const reveals = $$('.reveal');
      if (!reveals.length) return;

      reveals.forEach((el) => {
        gsap.set(el, { opacity: 0, y: 30 });

        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true,
          },
        });
      });
    } catch (e) {
      console.warn('HAVEN: Reveal animations failed —', e);
    }
  }


  // Add this inside your main.js init() function
function initStorytellingReveal() {
  const sections = $$('section');
  sections.forEach(section => {
    gsap.from(section, {
      opacity: 0,
      y: 100,
      duration: 1.5,
      ease: "power4.out",
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        toggleActions: "play none none reverse"
      }
    });
  });
}


  /* ═══════════════════════════════════════════════
     15. INITIALIZATION — Orchestrate everything
     ═══════════════════════════════════════════════ */
  async function init() {
    // Phase 1: Lenis smooth scroll (needs to be first)
    initLenis();

    // Phase 2: Run preloader, then hero
    await initPreloader();
    animateHero();

    // Phase 3: Interactive components (no dependency on preloader)
    initCustomCursor();
    initNavbar();
    initMobileMenu();
    initAnchorScroll();
    initScrollIndicator();
    initMarquee();
    initHeroSlider();
    initLightbox();
    initReservationForm();
    initTestimonials();

    // Phase 4: Scroll-triggered animations
    animateAbout();
    animateStays();
    animateDining();
    animateExperiences();
    animateStats();
    animateGallery();
    animateContact();
    animateFooter();
    initRevealAnimations();

    // Phase 5: Refresh ScrollTrigger after everything is set up
    // Small delay to allow images to load and affect layout
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);
  }

  // Start the show
  init();
})();
