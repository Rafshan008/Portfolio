(function () {
  'use strict';

  /* Magazine-style 3D page-turn exhibition book.
     API: window.initSketchbook3D(container, artworks, startIndex),
     window.sbTurn(dir), window.sbGoTo(index), optional window.setGalleryIndex(i, true).
     Artwork fields used: url, title, narrative|description|caption, location,
     category, year, medium, date, focus (CSS object-position, optional). */

  let currentArtworks = [];
  let currentIndex = 0;
  let isAnimating = false;
  let keyBound = false;
  const N = 14;          // strips per turning leaf (fewer = smoother on weak GPUs)
  const BOOK_AR = 1.6;   // spread width / height (each page 0.8, a standard magazine page)
  const PAGE_AR = BOOK_AR / 2;
  const NOISE = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")";

  const CSS = `
.skb-wrapper{position:relative;width:100%;height:100%;min-height:520px;display:flex;align-items:center;justify-content:center;overflow:hidden;
  background:radial-gradient(ellipse at 50% 35%,#f4f0e7 0%,#ebe5d8 75%,#e2dbcb 100%);border-radius:14px;user-select:none;-webkit-user-select:none}
@keyframes skb-in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.skb-stage{position:relative;z-index:2;width:100%;display:flex;justify-content:center;perspective:2600px;perspective-origin:50% 40%;animation:skb-in .7s cubic-bezier(.2,.7,.2,1) both}
.skb-book{position:relative;flex:none;width:640px;height:400px;transform-style:preserve-3d;cursor:grab;touch-action:pan-y;will-change:transform}
.skb-book:active{cursor:grabbing}
.skb-book::before{content:"";position:absolute;left:2%;right:2%;bottom:-6%;height:10%;border-radius:50%;
  background:radial-gradient(ellipse at center,rgba(60,48,28,.34),transparent 70%);filter:blur(12px);transform:translateZ(-2px)}
.skb-page{position:absolute;top:0;bottom:0;width:50%;background:#fcfaf5 ${NOISE};overflow:hidden;container-type:inline-size;
  box-shadow:0 12px 26px rgba(60,45,20,.16),0 2px 4px rgba(60,45,20,.1)}
.skb-left{left:0;border-radius:6px 0 0 6px}
.skb-right{right:0;border-radius:0 6px 6px 0}
.skb-inner{position:absolute;inset:0}
.skb-thick{position:absolute;top:1.5%;bottom:-1%;width:50%;background:#f1ece0;z-index:-1;box-shadow:inset 0 -2px 3px rgba(0,0,0,.1)}
.skb-thick.l{left:.5%;border-radius:6px 0 0 6px}.skb-thick.r{right:.5%;border-radius:0 6px 6px 0}
.skb-shade{position:absolute;inset:0;pointer-events:none}
.skb-left .skb-shade,.skb-back .skb-shade{background:linear-gradient(to right,rgba(0,0,0,0) 62%,rgba(60,42,16,.15) 100%)}
.skb-right .skb-shade,.skb-front .skb-shade{background:linear-gradient(to left,rgba(0,0,0,0) 62%,rgba(60,42,16,.15) 100%)}
.skb-crease{position:absolute;top:0;bottom:0;left:50%;width:12px;margin-left:-6px;pointer-events:none;z-index:5;
  background:linear-gradient(to right,rgba(0,0,0,0),rgba(50,34,12,.2) 50%,rgba(0,0,0,0))}
.skb-occ{position:absolute;inset:0;background:#2a1c08;opacity:0;pointer-events:none;z-index:3}
.skb-sheen{position:absolute;inset:0;pointer-events:none;opacity:calc(var(--curl,0) * .9);
  background:linear-gradient(100deg,rgba(255,255,255,0) 15%,rgba(255,255,255,.3) 50%,rgba(255,255,255,0) 85%)}
.skb-cast{position:absolute;top:0;bottom:0;left:0;width:50%;opacity:0;pointer-events:none;z-index:4;will-change:transform,opacity;
  background:linear-gradient(to right,rgba(40,25,5,0),rgba(40,25,5,.4),rgba(40,25,5,0))}

/* page content */
.skb-img{position:absolute;top:0;height:100%;container-type:inline-size}
.pc{position:absolute;inset:0;overflow:hidden;font-family:'Cormorant Garamond',Georgia,serif;color:#2b261f}
.pc img{display:block;-webkit-user-drag:none}
.pc-cover img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}

/* Museum matte for single-page prints */
.pc-contain-wrap{position:absolute;top:8cqw;bottom:18cqw;left:0;right:0;display:flex;align-items:center;justify-content:center;pointer-events:none}
.pc-contain .mount{position:relative;padding:3.5cqw;pointer-events:auto;background:#fdfbf7 ${NOISE};
  box-shadow:0 2cqw 6cqw rgba(40,30,15,.12),0 0.5cqw 1.5cqw rgba(40,30,15,.06)}
.pc-contain .mount::before{content:"";position:absolute;inset:3.5cqw;pointer-events:none;z-index:2;
  box-shadow:inset 0 3px 6px rgba(0,0,0,.15),inset 0 -1px 2px rgba(255,255,255,.9);border:1px solid rgba(0,0,0,.06)}
.pc-contain .mount img{display:block;max-width:76cqw;max-height:92cqw;box-shadow:0 0 0 1px rgba(0,0,0,.1);z-index:1}

/* Museum matte for spread prints */
.spread-mount-wrap{position:absolute;top:8cqw;bottom:34cqw;width:200cqw;left:0;display:flex;align-items:center;justify-content:center;pointer-events:none}
.spread-mount-wrap.R{left:-100cqw}
.spread-mount{position:relative;padding:3.5cqw;pointer-events:auto;background:#fdfbf7 ${NOISE};
  box-shadow:0 2cqw 6cqw rgba(40,30,15,.12),0 0.5cqw 1.5cqw rgba(40,30,15,.06)}
.spread-mount::before{content:"";position:absolute;inset:3.5cqw;pointer-events:none;z-index:2;
  box-shadow:inset 0 3px 6px rgba(0,0,0,.15),inset 0 -1px 2px rgba(255,255,255,.9);border:1px solid rgba(0,0,0,.06)}
.spread-mount img{display:block;max-width:178cqw;max-height:76cqw;box-shadow:0 0 0 1px rgba(0,0,0,.1);z-index:1}

/* Feature text at bottom */
.fe-text-bot{position:absolute;bottom:12cqw;left:9cqw;right:9cqw;height:19cqw;display:flex;flex-direction:column;justify-content:flex-end}
.pc-feature.L .fe-text-bot{padding-right:4cqw}
.pc-feature.R .fe-text-bot{padding-left:4cqw}
.fe-title{font-size:5.5cqw;margin-top:1.5cqw;line-height:1.1}
.t-sub{font-size:2.8cqw;margin-top:1.5cqw;font-style:italic;color:#7b6c4e}
.fe-body{flex:none;max-height:none;display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden;font-size:max(10px,2.6cqw);line-height:1.55;margin:0}
.fe-body.dc::first-letter{float:left;font:600 9cqw/.8 'Cormorant Garamond',serif;padding:0.5cqw 1cqw 0 0;color:#a8844a}
.fe-meta{flex:none;margin-top:2cqw;font:400 1.8cqw 'IBM Plex Mono',monospace;letter-spacing:.15em;text-transform:uppercase;color:#7b6c4e}

/* (higher specificity so the generic .t-body rules below can't override these) */
.fe-text-bot .fe-body{max-height:none;font-size:max(10px,2.7cqw);line-height:1.5}
.fe-text-bot .fe-body.dc::first-letter{font-size:8.5cqw}

/* General typography */
.pc-fade{position:absolute;left:0;right:0;bottom:0;height:22%;background:linear-gradient(to top,rgba(20,14,6,.6),transparent);pointer-events:none}
.cap{position:absolute;bottom:6cqw;left:9cqw;right:9cqw;display:flex;justify-content:space-between;align-items:baseline;gap:3cqw;
  font:400 1.8cqw 'IBM Plex Mono',monospace;letter-spacing:.15em;text-transform:uppercase;color:#7b6c4e}
.cap b{font:italic 600 3.2cqw 'Cormorant Garamond',serif;letter-spacing:0;text-transform:none;color:#2b261f}
.pc-cover .cap,.pc-cover .cap b{color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.5)}
.pc-text{display:flex;flex-direction:column;padding:12cqw 10cqw 14cqw}
.pc-text.L{padding-right:13cqw}.pc-text.R{padding-left:13cqw}
.t-kick{font:500 1.8cqw 'IBM Plex Mono',monospace;letter-spacing:.25em;color:#a8844a;text-transform:uppercase}
.t-title{font:600 7cqw/1.05 'Cormorant Garamond',Georgia,serif;margin:4cqw 0 0;letter-spacing:-.01em}
.t-rule{width:8cqw;height:1px;background:#a8844a;margin:4cqw 0}
.t-body{font-size:max(11px,3.2cqw);line-height:1.6;margin:0;text-align:justify;hyphens:auto;overflow:hidden;max-height:46%}
.t-body.dc::first-letter{float:left;font:600 13cqw/.8 'Cormorant Garamond',serif;padding:1cqw 1.5cqw 0 0;color:#a8844a}
.t-meta{margin-top:auto;font:400 1.8cqw/1.7 'IBM Plex Mono',monospace;letter-spacing:.15em;text-transform:uppercase;color:#7b6c4e}
.folio{position:absolute;bottom:5.5cqw;font:400 1.8cqw 'IBM Plex Mono',monospace;letter-spacing:.2em;color:#a39577}
.pc.L .folio{left:9cqw}.pc.R .folio{right:9cqw}
.pc-cover .folio,.pc-contain .folio{bottom:auto;top:6cqw}
.pc-cover .folio{color:rgba(255,255,255,.85);text-shadow:0 1px 4px rgba(0,0,0,.4)}

/* turning leaf (flat paper colour: no texture on the 28 moving faces keeps it fast) */
.skb-leaf{position:absolute;top:0;bottom:0;left:50%;width:50%;transform-style:preserve-3d;z-index:10;pointer-events:none}
.skb-strip{position:absolute;top:0;height:100%;transform-origin:left center;transform-style:preserve-3d;will-change:transform}
.skb-face{position:absolute;top:0;left:0;height:100%;width:calc(100% + .7px);overflow:hidden;
  backface-visibility:hidden;-webkit-backface-visibility:hidden;background:#fcfaf5}
.skb-back{transform:rotateY(180deg)}

/* Turning leaf performance optimizations (disables heavy shadows on the 28 moving DOM clones) */
.skb-leaf .mount, .skb-leaf .spread-mount { box-shadow: 0 4px 10px rgba(0,0,0,0.08) !important; background-image: none !important; }
.skb-leaf .mount::before, .skb-leaf .spread-mount::before { display: none !important; }
.skb-leaf img { box-shadow: none !important; }
.skb-leaf .pc-fade { opacity: 0.5 !important; }

/* arrows */
.skb-arrow{position:absolute;top:50%;z-index:8;transform:translateY(-50%);background:none;border:0;cursor:pointer;width:48px;height:80px;font-size:0;color:#7b6c4e;opacity:.65;transition:opacity .2s,transform .2s}
.skb-arrow::before{content:"";position:absolute;top:50%;left:50%;width:16px;height:16px;border-left:1.5px solid currentColor;border-bottom:1.5px solid currentColor}
.skb-prev{left:1.5%}.skb-prev::before{transform:translate(-30%,-50%) rotate(45deg)}
.skb-next{right:1.5%}.skb-next::before{transform:translate(-70%,-50%) rotate(-135deg)}
.skb-arrow:hover{opacity:1}
.skb-prev:hover{transform:translateY(-50%) translateX(-3px)}.skb-next:hover{transform:translateY(-50%) translateX(3px)}
@media (max-width:640px){.skb-arrow{width:34px}}
@media (prefers-reduced-motion:reduce){.skb-stage{animation:none}}
`;

  function injectStyles() {
    if (document.getElementById('skb-styles')) return;
    const s = document.createElement('style');
    s.id = 'skb-styles';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ---------------- layout helpers ---------------- */
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');

  // Auto-fit: spread print for wide photos; for single photos choose full-bleed vs museum matte.
  function plan(art) {
    const ar = art._ar || PAGE_AR;
    if (ar >= 1.45) return { mode: 'spread' };
    return { mode: 'page', fit: Math.abs(ar / PAGE_AR - 1) < 0.15 ? 'cover' : 'contain' };
  }

  const photoSide = (idx) => (idx % 2 === 0 ? 'R' : 'L'); // alternate like a magazine

  function capHTML(art) {
    const loc = [art.location, art.year || art.date].filter(Boolean).map(esc).join(' &middot; ');
    return `<div class="cap"><b>${esc(art.title || 'Untitled')}</b><span>${loc}</span></div>`;
  }
  const folio = (side, idx) => `<div class="folio">${pad(idx * 2 + (side === 'L' ? 1 : 2))}</div>`;

  function pageHTML(art, side, idx) {
    const url = esc(art.url);
    const p = plan(art);
    const focus = esc(art.focus || 'center');

    if (p.mode === 'spread') {
      const isL = side === 'L';
      const text = art.narrative || art.description || art.caption || '';
      const sub = [art.category, art.medium].filter(Boolean).map(esc).join(' &mdash; ');
      const meta = [art.location, art.year || art.date].filter(Boolean).map(esc).join(' &middot; ');
      const photo = `<div class="spread-mount-wrap ${side}"><div class="spread-mount"><img src="${url}" style="object-position:${focus}" draggable="false"></div></div>`;
      const body = isL
        ? `<div class="t-kick">Plate ${pad(idx + 1)} / ${pad(currentArtworks.length)}</div>
           <h3 class="t-title fe-title">${esc(art.title || 'Untitled')}</h3>
           ${sub ? `<div class="t-sub">${sub}</div>` : ''}`
        : `${text ? `<p class="t-body fe-body${text.length > 90 ? ' dc' : ''}" style="-webkit-line-clamp:3">${esc(text)}</p>` : ''}
           <div class="t-meta fe-meta">${meta}</div>`;
      return `<div class="pc pc-feature ${side}">${photo}<div class="fe-text-bot">${body}</div>${folio(side, idx)}</div>`;
    }

    if (side === photoSide(idx)) {
      const img = `<img src="${url}" alt="${esc(art.title || 'Plate')}" draggable="false" style="object-position:${focus}">`;
      return p.fit === 'cover'
        ? `<div class="pc pc-cover ${side}">${img}<div class="pc-fade"></div>${capHTML(art)}${folio(side, idx)}</div>`
        : `<div class="pc pc-contain ${side}"><div class="pc-contain-wrap"><div class="mount">${img}</div></div>${capHTML(art)}${folio(side, idx)}</div>`;
    }

    const text = art.narrative || art.description || art.caption || '';
    const sub = [art.category, art.medium].filter(Boolean).map(esc).join(' &mdash; ');
    const meta = [art.location, art.year || art.date].filter(Boolean).map(esc).join('<br>');
    return `<div class="pc pc-text ${side}">
      <div class="t-kick">Plate ${pad(idx + 1)} / ${pad(currentArtworks.length)}</div>
      <h3 class="t-title">${esc(art.title || 'Untitled')}</h3>
      ${sub ? `<div class="t-sub">${sub}</div>` : ''}
      <div class="t-rule"></div>
      ${text ? `<p class="t-body${text.length > 90 ? ' dc' : ''}">${esc(text)}</p>` : ''}
      <div class="t-meta">${meta}</div>${folio(side, idx)}</div>`;
  }

  /* ---------------- init ---------------- */
  const reduceMotion = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const wrapIdx = (i) => (i + currentArtworks.length) % currentArtworks.length;
  const raf = (fn) => window.requestAnimationFrame(fn);

  function measure(a) {
    if (a._p) return a._p;
    a._p = new Promise((res) => {
      const im = new Image();
      im.onload = () => { a._ar = im.naturalWidth / im.naturalHeight; (im.decode ? im.decode() : Promise.resolve()).catch(() => { }).then(res); };
      im.onerror = res;
      im.src = a.url;
    });
    return a._p;
  }

  let pendingGo = null;

  window.initSketchbook3D = function (container, artworks, startIndex) {
    injectStyles();
    artworks = artworks || [];
    const live = container.querySelector('#skb-book');
    const samePlates = live && artworks.length === currentArtworks.length && artworks.every((a, i) => a.url === currentArtworks[i].url);
    if (samePlates) {
      // gallery.js re-calling init for navigation: keep the book and turn the page to the new plate
      artworks.forEach((a, i) => { a._ar = currentArtworks[i]._ar; a._p = currentArtworks[i]._p; });
      currentArtworks = artworks;
      let idx = startIndex || 0;
      if (idx >= currentArtworks.length) idx = 0;
      if (idx === currentIndex) return;
      if (isAnimating) pendingGo = idx; else window.sbGoTo(idx);
      return;
    }

    container.innerHTML = `
      <div class="skb-wrapper">
        <button class="skb-arrow skb-prev" onclick="window.sbTurn(-1)" aria-label="Previous Plate">Prev</button>
        <div class="skb-stage">
          <div class="skb-book" id="skb-book">
            <div class="skb-thick l"></div><div class="skb-thick r"></div>
            <div class="skb-page skb-left"><div class="skb-inner" id="skb-static-left"></div><div class="skb-shade"></div><div class="skb-occ" id="skb-occ-l"></div></div>
            <div class="skb-page skb-right"><div class="skb-inner" id="skb-static-right"></div><div class="skb-shade"></div><div class="skb-occ" id="skb-occ-r"></div></div>
            <div class="skb-crease"></div>
            <div class="skb-cast" id="skb-cast"></div>
          </div>
        </div>
        <button class="skb-arrow skb-next" onclick="window.sbTurn(1)" aria-label="Next Plate">Next</button>
      </div>`;

    currentArtworks = artworks;
    currentIndex = startIndex || 0;
    if (currentIndex >= currentArtworks.length) currentIndex = 0;
    isAnimating = false;

    // Measure + decode every photo up front so turns never stall or re-layout.
    currentArtworks.forEach((a, i) => measure(a).then(() => { if (i === currentIndex && !isAnimating) updateStaticPages(); }));

    updateStaticPages();
    setupInput();
    bindKeys();
    fitBook();
    const wrap = container.querySelector('.skb-wrapper');
    if (window.ResizeObserver) new ResizeObserver(fitBook).observe(wrap);
    else window.addEventListener('resize', fitBook);
  };

  function fitBook() {
    const book = document.getElementById('skb-book');
    const wrap = book && book.closest('.skb-wrapper');
    if (!wrap) return;
    const w = wrap.clientWidth || 800, h = wrap.clientHeight || 520;
    const bw = Math.max(300, Math.min(w * (w < 640 ? 0.92 : 0.8), (h - 90) * BOOK_AR, 1100));
    book.style.width = bw + 'px';
    book.style.height = bw / BOOK_AR + 'px';
  }

  function updateStaticPages() {
    if (!currentArtworks.length) return;
    const art = currentArtworks[currentIndex];
    const l = document.getElementById('skb-static-left');
    const r = document.getElementById('skb-static-right');
    if (l) l.innerHTML = pageHTML(art, 'L', currentIndex);
    if (r) r.innerHTML = pageHTML(art, 'R', currentIndex);
    const roman = document.getElementById('stage-roman');
    if (roman) roman.textContent = `PLATE ${currentIndex + 1} OF ${currentArtworks.length}`;
  }

  /* ---------------- page-turn engine ----------------
     A turn is a progress value p (0 -> 1). Dragging sets p directly from the pointer;
     buttons / keys / click animate p with easing. Same renderer for both, so it is always smooth. */
  function makeTurn(direction, nextIndex) {
    const book = document.getElementById('skb-book');
    const cI = currentIndex;
    const curr = currentArtworks[cI], next = currentArtworks[nextIndex];
    isAnimating = true;
    kickTilt();

    const leaf = createLeaf(
      direction === 1 ? pageHTML(curr, 'R', cI) : pageHTML(next, 'R', nextIndex),
      direction === 1 ? pageHTML(next, 'L', nextIndex) : pageHTML(curr, 'L', cI)
    );
    book.appendChild(leaf);

    // reveal the page that appears underneath the lifting leaf
    if (direction === 1) document.getElementById('skb-static-right').innerHTML = pageHTML(next, 'R', nextIndex);
    else document.getElementById('skb-static-left').innerHTML = pageHTML(next, 'L', nextIndex);

    const st = {
      dir: direction, nextIndex, leaf, p: 0,
      strips: leaf.querySelectorAll('.skb-strip'), cast: document.getElementById('skb-cast'),
      occL: document.getElementById('skb-occ-l'), occR: document.getElementById('skb-occ-r')
    };
    applyProgress(st, 0);
    return st;
  }

  function applyProgress(st, p) {
    st.p = p;
    const d = st.dir;
    const curl = Math.sin(p * Math.PI);
    const bend = curl * (d === 1 ? 4.5 : -4.5);
    const rootRot = d === 1 ? -p * 180 : -180 + p * 180;

    st.cast.style.opacity = (curl * 0.4).toFixed(3);
    st.leaf.style.setProperty('--curl', curl.toFixed(3));
    // the page being uncovered gets the deeper shadow; the page being covered a lighter one
    (d === 1 ? st.occR : st.occL).style.opacity = (curl * 0.13).toFixed(3);
    (d === 1 ? st.occL : st.occR).style.opacity = (curl * 0.08).toFixed(3);
    st.cast.style.transform = `translate3d(${d === 1 ? (1 - p) * 100 : p * 100}%,0,0)`;

    const s = st.strips;
    for (let i = 0; i < s.length; i++) {
      s[i].style.transform = i === 0
        ? `translateZ(${(curl * 14).toFixed(2)}px) rotateY(${rootRot.toFixed(3)}deg)`
        : `rotateY(${(bend * (1 - (i / s.length) * 0.35)).toFixed(3)}deg)`;
    }
  }

  function animateTurn(st, target, ms, done) {
    const from = st.p, t0 = performance.now();
    (function frame(t) {
      const k = clamp((t - t0) / ms, 0, 1);
      const e = -(Math.cos(Math.PI * k) - 1) / 2;   // fluid easeInOutSine for natural swing
      applyProgress(st, from + (target - from) * e);
      if (k < 1) raf(frame); else done();
    })(t0);
  }

  function endTurn(st, complete) {
    st.leaf.remove();
    st.cast.style.opacity = '0';
    st.occL.style.opacity = st.occR.style.opacity = '0';
    if (complete) currentIndex = st.nextIndex;
    updateStaticPages();
    isAnimating = false;
    kickTilt();
    if (complete && window.setGalleryIndex) window.setGalleryIndex(currentIndex, true);
    if (pendingGo !== null) { const g = pendingGo; pendingGo = null; if (g !== currentIndex) window.sbGoTo(g); }
  }

  function turnTo(direction, nextIndex) {
    if (isAnimating || currentArtworks.length <= 1) return;
    const st = makeTurn(direction, nextIndex);
    animateTurn(st, 1, 850, () => endTurn(st, true));
  }

  window.sbTurn = function (direction) { turnTo(direction, wrapIdx(currentIndex + direction)); };
  window.sbGoTo = function (i) {       // jump to a plate (dots, thumbnails) with one smooth turn
    if (i === currentIndex || i < 0 || i >= currentArtworks.length) return;
    turnTo(i > currentIndex ? 1 : -1, i);
  };

  function createLeaf(frontHTML, backHTML) {
    const root = document.createElement('div');
    root.className = 'skb-leaf';
    let parent = root;
    for (let i = 0; i < N; i++) {
      const s = document.createElement('div');
      s.className = 'skb-strip';
      s.style.width = i === 0 ? `${100 / N}%` : '100%';
      s.style.left = i === 0 ? '0' : '100%';
      s.innerHTML =
        `<div class="skb-face skb-front"><div class="skb-img" style="width:${N * 100}%;left:-${i * 100}%">${frontHTML}</div><div class="skb-shade"></div><div class="skb-sheen"></div></div>` +
        `<div class="skb-face skb-back"><div class="skb-img" style="width:${N * 100}%;left:-${(N - 1 - i) * 100}%">${backHTML}</div><div class="skb-shade"></div><div class="skb-sheen"></div></div>`;
      parent.appendChild(s);
      parent = s;
    }
    return root;
  }

  /* ---------------- gentle cursor tilt (eased in JS, paused while turning) ---------------- */
  const tilt = { x: 0, y: 0, tx: 0, ty: 0, run: false };
  function kickTilt() {
    if (tilt.run) return;
    tilt.run = true;
    (function tick() {
      const book = document.getElementById('skb-book');
      if (!book) { tilt.run = false; return; }
      const tx = isAnimating ? 0 : tilt.tx, ty = isAnimating ? 0 : tilt.ty;
      tilt.x += (tx - tilt.x) * 0.09;
      tilt.y += (ty - tilt.y) * 0.09;
      book.style.transform = `rotateX(${tilt.x.toFixed(3)}deg) rotateY(${tilt.y.toFixed(3)}deg)`;
      if (Math.abs(tx - tilt.x) > 0.01 || Math.abs(ty - tilt.y) > 0.01) raf(tick);
      else { tilt.run = false; }
    })();
  }

  /* ---------------- input: drag the page, click a side, swipe, keys ---------------- */
  function setupInput() {
    const book = document.getElementById('skb-book');
    if (!book) return;
    const wrap = book.closest('.skb-wrapper');

    if (wrap && !reduceMotion()) {
      wrap.addEventListener('mousemove', (e) => {
        const r = wrap.getBoundingClientRect();
        tilt.tx = ((0.5 - (e.clientY - r.top) / r.height) * 3);
        tilt.ty = (((e.clientX - r.left) / r.width - 0.5) * 5);
        kickTilt();
      });
      wrap.addEventListener('mouseleave', () => { tilt.tx = tilt.ty = 0; kickTilt(); });
    }

    let drag = null;
    book.addEventListener('pointerdown', (e) => {
      if ((e.pointerType === 'mouse' && e.button !== 0) || isAnimating || currentArtworks.length <= 1) return;
      drag = { id: e.pointerId, x0: e.clientX, lx: e.clientX, lt: performance.now(), vx: 0, st: null };
      book.setPointerCapture(e.pointerId);
    });

    book.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x0;
      if (!drag.st) {
        if (Math.abs(dx) < 6) return;
        const dir = dx < 0 ? 1 : -1;
        drag.st = makeTurn(dir, wrapIdx(currentIndex + dir));
      }
      const now = performance.now();
      if (now > drag.lt) { drag.vx = (e.clientX - drag.lx) / (now - drag.lt); drag.lx = e.clientX; drag.lt = now; }
      const toward = drag.st.dir === 1 ? -dx : dx;
      applyProgress(drag.st, clamp(toward / (book.clientWidth * 0.55), 0, 1));
    });

    const release = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null;
      if (!d.st) {                                   // a click: right half = next, left half = previous
        if (e.type === 'pointerup') {
          const r = book.getBoundingClientRect();
          window.sbTurn(e.clientX > r.left + r.width / 2 ? 1 : -1);
        }
        return;
      }
      const st = d.st;
      const speed = st.dir === 1 ? -d.vx : d.vx;     // px/ms in the turning direction
      const complete = e.type === 'pointerup' && (st.p > 0.4 || (speed > 0.45 && st.p > 0.08));
      const target = complete ? 1 : 0;
      animateTurn(st, target, 200 + 650 * Math.abs(target - st.p), () => endTurn(st, complete));
    };
    book.addEventListener('pointerup', release);
    book.addEventListener('pointercancel', release);
  }

  function bindKeys() {
    if (keyBound) return;
    keyBound = true;
    window.addEventListener('keydown', (e) => {
      if (!document.getElementById('skb-book')) return;
      const t = e.target && e.target.tagName;
      if (t === 'INPUT' || t === 'TEXTAREA') return; // don't hijack the archive search box
      if (e.key === 'ArrowRight') window.sbTurn(1);
      if (e.key === 'ArrowLeft') window.sbTurn(-1);
    });
  }
})();