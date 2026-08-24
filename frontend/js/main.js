/* =========================================================
   main.js — All scroll animations & transitions
   Inspired by: calebraney/Portfolio (Webflow) style
   Uses: GSAP + ScrollTrigger + Lenis
   ========================================================= */

// ── 1. Lenis Smooth Scroll ────────────────────────────────
const lenis = new Lenis({
  duration: 1.2,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Sync Lenis with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ── 2. Custom Cursor ──────────────────────────────────────
const cursorDot     = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

if (cursorDot && cursorOutline) {
  window.addEventListener('mousemove', e => {
    cursorDot.style.left    = e.clientX + 'px';
    cursorDot.style.top     = e.clientY + 'px';
    cursorOutline.animate(
      { left: e.clientX + 'px', top: e.clientY + 'px' },
      { duration: 150, fill: 'forwards' }
    );
  });
}

// ── 3. initAnimations — called after content is rendered ──
function initAnimations() {

  gsap.registerPlugin(ScrollTrigger);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Cursor hover enlarge ────────────────────────────────
  if (cursorOutline) {
    document.querySelectorAll('a, button, .filter-btn, .tile').forEach(el => {
      el.addEventListener('mouseenter', () => cursorOutline.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursorOutline.classList.remove('hover'));
    });
  }

  // ── 3D Word Split Reveal ────────────────────────────────
  // Each word gets wrapped in .reveal-line > .reveal-text
  // Then animated: rotateX(-90deg) → rotateX(0) per the sample.html style
  function splitWords(el) {
    const text = el.innerText.trim();
    el.innerHTML = '';
    el.style.perspective = '600px';
    text.split(/\s+/).forEach((word, i, arr) => {
      const outer = document.createElement('span');
      outer.className = 'reveal-line';
      outer.style.cssText = 'display:inline-block; overflow:hidden; vertical-align:bottom;';

      const inner = document.createElement('span');
      inner.className = 'reveal-text';
      inner.style.cssText = 'display:inline-block; transform-style:preserve-3d;';
      inner.innerHTML = word + (i < arr.length - 1 ? '&nbsp;' : '');

      outer.appendChild(inner);
      el.appendChild(outer);
    });
    return Array.from(el.querySelectorAll('.reveal-text'));
  }

  // ── Hero animations are neutralised early ──────────────
  gsap.set('.hero-content', { opacity: 1, y: 0 });

  // Hero title — split right away so it doesn't flash
  const heroTitle      = document.querySelector('.hero-title');
  const heroTitleWords = heroTitle ? splitWords(heroTitle) : [];
  if (heroTitleWords.length) {
    gsap.set(heroTitleWords, { y: '110%', rotateX: -90, transformOrigin: 'top center' });
  }

  // ── Section h2 & lead word reveals ─────────────────────
  if (!reduceMotion) {
    document.querySelectorAll('h2, .profile-lead').forEach(el => {
      // Skip hero — handled in intro timeline
      if (el.closest('.hero')) return;

      const words = splitWords(el);
      gsap.set(words, { y: '110%', rotateX: -90, transformOrigin: 'top center' });

      gsap.to(words, {
        y: '0%',
        rotateX: 0,
        duration: 1.1,
        stagger: 0.04,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 92%',
        }
      });
    });
  }

  // ── Fade-up for section headers, cards etc ─────────────
  if (!reduceMotion) {
    document.querySelectorAll('.fade-up').forEach(el => {
      if (el.closest('.hero')) return;

      const delay = el.classList.contains('delay-3') ? 0.3
                  : el.classList.contains('delay-2') ? 0.2
                  : el.classList.contains('delay-1') ? 0.1 : 0;

      gsap.fromTo(el,
        { autoAlpha: 0, y: 50, scale: 0.98 },
        {
          autoAlpha: 1, y: 0, scale: 1,
          duration: 1.1,
          delay,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%' }
        }
      );
    });
  }

  // ── Batched card + tag stagger reveals ─────────────────
  if (!reduceMotion) {
    ['.proj-grid .proj-card', '.tag-cloud span', '.genre-cell', '.media-card'].forEach(sel => {
      const items = gsap.utils.toArray(sel);
      if (!items.length) return;
      ScrollTrigger.batch(items, {
        start: 'top 93%',
        onEnter: batch => gsap.fromTo(batch,
          { autoAlpha: 0, y: 36, rotateX: 10 },
          { autoAlpha: 1, y: 0, rotateX: 0, duration: 0.85, stagger: 0.1, ease: 'power3.out', overwrite: true }
        ),
        once: true
      });
      gsap.set(items, { autoAlpha: 0 });
    });
  }

  // ── Photo tile clip-path wipe reveal ───────────────────
  if (!reduceMotion) {
    gsap.set('.tile img', { clipPath: 'inset(0 0 100% 0)', opacity: 0.6 });

    ScrollTrigger.batch('.tile', {
      start: 'top 93%',
      onEnter: batch => gsap.to(batch.map(t => t.querySelector('img')), {
        clipPath: 'inset(0 0 0% 0)',
        opacity: 1,
        duration: 1.2,
        stagger: 0.12,
        ease: 'power4.out',
        overwrite: true
      }),
      once: true
    });
  } else {
    gsap.set('.tile img', { clipPath: 'inset(0 0 0% 0)', opacity: 1 });
  }

  // ── Section edge wipe (Caleb Raney style has-edge) ─────
  document.querySelectorAll('.has-edge').forEach(sec => {
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 88%',
      onEnter: () => sec.classList.add('edge-in'),
      onLeaveBack: () => sec.classList.remove('edge-in'),
    });
  });

  // ── Nav theme switch (dark/light sections) ──────────────
  const DARK_SECTIONS = ['bg-forest', 'bg-tarry', 'bg-essex'];
  const header = document.querySelector('header');
  document.querySelectorAll('section').forEach(sec => {
    const isDark = DARK_SECTIONS.some(c => sec.classList.contains(c));
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: self => {
        if (self.isActive && header) header.classList.toggle('nav-dark', isDark);
      }
    });
  });

  // ── Active nav link highlight ───────────────────────────
  const navLinks = document.querySelectorAll('.nav-links a');
  document.querySelectorAll('section[id]').forEach(sec => {
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: self => {
        if (!self.isActive) return;
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + sec.id));
      }
    });
  });

  // ── Hero parallax on scroll ─────────────────────────────
  gsap.to('.hero-image-wrap img', {
    yPercent: 18,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    }
  });

  // ── Horizontal scroll for timeline items ───────────────
  const timelineItems = document.querySelectorAll('.tl-item');
  if (timelineItems.length) {
    gsap.set(timelineItems, { autoAlpha: 0, x: -30 });
    ScrollTrigger.batch(timelineItems, {
      start: 'top 90%',
      onEnter: batch => gsap.to(batch, {
        autoAlpha: 1, x: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out', overwrite: true
      }),
      once: true
    });
  }

  // ── Scroll progress bar ─────────────────────────────────
  const progressBar = document.getElementById('scrollProgress');
  if (progressBar) {
    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: self => { progressBar.style.width = (self.progress * 100) + '%'; }
    });
  }

  // ── Intro Page Curtain (Caleb Raney style) ──────────────
  const curtain      = document.getElementById('pageCurtain');
  const curtainMark  = curtain ? curtain.querySelector('.page-curtain-mark') : null;

  if (reduceMotion) {
    if (curtain) curtain.style.display = 'none';
    if (heroTitleWords.length) gsap.set(heroTitleWords, { y: '0%', rotateX: 0 });
    gsap.set('.reveal-clip', { clipPath: 'inset(0 0 0% 0)', opacity: 1 });
  } else {
    const tl = gsap.timeline({
      defaults: { ease: 'power4.out' },
      onComplete: () => ScrollTrigger.refresh(),
    });

    // Curtain slides up, revealing site underneath
    tl.to(curtainMark, { opacity: 1, duration: 0.5, ease: 'power2.out' })
      .to(curtainMark, { opacity: 0, duration: 0.3, delay: 0.2 })
      .to(curtain, {
        yPercent: -100,
        duration: 1.0,
        ease: 'power4.inOut',
        onComplete: () => { if (curtain) curtain.style.display = 'none'; }
      }, '-=0.1')

      // Hero staggered entrance
      .fromTo('.hero .status-bar, .hero .hero-eyebrow',
        { autoAlpha: 0, y: 28 },
        { autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.08 }, '-=0.5')

      // 3D word reveal for hero title
      .to(heroTitleWords, {
        y: '0%',
        rotateX: 0,
        duration: 1.15,
        stagger: 0.04,
        ease: 'power4.out',
      }, '-=0.55')

      .fromTo('.hero .hero-sub',
        { autoAlpha: 0, y: 28 },
        { autoAlpha: 1, y: 0, duration: 0.85 }, '-=0.7')
      .fromTo('.hero .hero-cta',
        { autoAlpha: 0, y: 28 },
        { autoAlpha: 1, y: 0, duration: 0.85 }, '-=0.65')
      .fromTo('.hero-image-wrap',
        { autoAlpha: 0, scale: 0.95, y: 30 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 1.1 }, '-=0.9')
      .to('.hero-image-wrap .reveal-clip',
        { clipPath: 'inset(0 0 0% 0)', opacity: 1, duration: 1.3, ease: 'power4.out' }, '-=0.8');
  }

  // ── Photo filter buttons ────────────────────────────────
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      if (typeof window.applyCoverflowFilter === 'function') {
        window.applyCoverflowFilter(filter);
      }
    });
  });

  // ── Live Dhaka clock ────────────────────────────────────
  const clockEl = document.getElementById('clock');
  function tick() {
    const now = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Dhaka', hour12: false });
    if (clockEl) clockEl.textContent = now + ' DHK';
  }
  tick();
  setInterval(tick, 1000);
}
