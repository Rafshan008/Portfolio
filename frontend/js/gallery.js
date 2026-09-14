/* ==========================================================================
   gallery.js — Lumière Luxury Fine Art Photography Retrospective Engine
   Continuous 3D Horizon Arc, Museum Wall Placard, Physical Drag Inertia,
   Curated Tour Slideshow, and Folio Monograph Catalogue
   ========================================================================== */

(function () {
  'use strict';

  let rawTiles = [];
  let allArtworks = [];
  let filteredArtworks = [];
  let currentIndex = 0;
  let activeFilter = 'all';
  let currentView = 'both'; // 'both', 'stage', 'grid'
  let searchQuery = '';
  let currentLayout = 'editorial';
  let isTourRunning = false;
  let tourTimer = null;
  const TOUR_INTERVAL = 5000; // 5s per plate

  // DOM Elements
  const stage = document.getElementById('gallery-stage');
  const stageDragWrap = document.getElementById('stageDragWrap');
  const stageDots = document.getElementById('stage-dots');
  const stageRoman = document.getElementById('stage-roman');
  const stageProgressBar = document.getElementById('stage-progress-bar');
  const stagePlacardWrap = document.getElementById('stage-placard-wrap');
  const heroTotalCount = document.getElementById('hero-total-count');
  const archiveGrid = document.getElementById('archive-grid');
  const archiveCount = document.getElementById('archive-count');
  const filtersContainer = document.getElementById('gallery-filters');
  const tourBtn = document.getElementById('galleryTourBtn');
  const lightbox = document.getElementById('gallery-lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbTitle = document.getElementById('lb-title');
  const lbNarrative = document.getElementById('lb-narrative');
  const lbPlateTag = document.getElementById('lb-plate-tag');
  const lbMeta = document.getElementById('lb-meta');

  // Curatorial Masterpiece Storytelling & Provenance
  const masterStories = {
    'ph-1': {
      title: 'The Artisan of Old Dhaka',
      series: 'Bengal Human Presence',
      plate: 'PLATE I',
      location: 'Shankhari Bazaar, Old Dhaka',
      medium: 'Archival Pigment on 310gsm Cotton Rag',
      narrative: 'A quiet moment of concentration amidst the centuries-old brick dust of the conch-shell craft quarters, where morning light cuts through narrow Mughal alleyways.',
      year: '2024',
      optics: '35mm Prime · ƒ/2.0 · Natural Ambient'
    },
    'ph-2': {
      title: 'Rust, Brick & Rainwater',
      series: 'Industrial Topographies',
      plate: 'PLATE II',
      location: 'Buriganga Riverfront Shipyards',
      medium: 'Archival Silver Gelatin Reproduction',
      narrative: 'Monsoon oxidation and raw red brick converge where weathered cargo barges are hammered by hand on the riverbanks under low monsoon skies.',
      year: '2024',
      optics: '35mm Prime · ƒ/5.6 · Overcast Diffusion'
    },
    'ph-3': {
      title: 'Prow of the Iron Titan',
      series: 'Heavy Maritime Monograph',
      plate: 'PLATE III',
      location: 'Keraniganj Dockyards',
      medium: 'Monochrome Archival Print',
      narrative: 'The colossal steel bow of a drydocked freighter looms over two shipwrights, capturing the monumental physical scale of river trade industry.',
      year: '2024',
      optics: '50mm Prime · ƒ/8.0 · Hard Midday Sun'
    },
    'ph-4': {
      title: 'Buriganga Nocturne',
      series: 'Riverway Atmosphere',
      plate: 'PLATE IV',
      location: 'Sadarghat River Crossing',
      medium: 'Archival Pigment Print on Smooth Cotton',
      narrative: 'Tonal silhouettes of wooden passenger dinghies navigating the oily ripples of the historic commercial artery at twilight.',
      year: '2024',
      optics: '24mm Prime · ƒ/2.8 · Twilight Ambient'
    },
    'ph-5': {
      title: 'Echoes in Crimson',
      series: 'The Fabric Alleys',
      plate: 'PLATE V',
      location: 'Islampur Textile Quarter',
      medium: 'Color Saturated Archival Fine Art',
      narrative: 'Cascades of dyed scarlet and turmeric cotton drying in draft corridors between crumbling colonial-era brick facades.',
      year: '2024',
      optics: '35mm Prime · ƒ/2.0 · High Shutter'
    },
    'ph-6': {
      title: 'The Clay Idols of Shankhari',
      series: 'Sacred Geographies',
      plate: 'PLATE VI',
      location: 'Hindu Sculptor Guilds, Old Town',
      medium: 'Museum Etching Paper Print',
      narrative: 'Unfinished clay effigies awaiting the autumnal festival season, sculpted with ancestral methods passed down through eight generations.',
      year: '2024',
      optics: '85mm Portrait Prime · ƒ/1.8 · Incense Haze'
    },
    'ph-7': {
      title: 'Solitude at the Mountain Edge',
      series: 'Highland Monograph',
      plate: 'PLATE VII',
      location: 'Sylhet Mountain Borderlands',
      medium: 'Fine Art Archival Baryta',
      narrative: 'Dense morning mist descending across rolling emerald ridges, where human footprints fade into primeval rainforest silence.',
      year: '2024',
      optics: '35mm Prime · ƒ/4.0 · Morning Vapor'
    }
  };

  // --- Fetch and Initialize Data ---
  async function initGallery() {
    try {
      const res = await fetch('/api/data');
      if (!res.ok) throw new Error('API fetch failed');
      const data = await res.json();

      if (data.footer) {
        const copy = document.getElementById('footer-copy');
        const loc = document.getElementById('footer-loc');
        if (copy) copy.textContent = data.footer.copyright || '© 2026 Rafshan Ekhowan. Fine Art Photography Retrospective.';
        if (loc) loc.textContent = data.footer.location || 'Dhaka, Bangladesh';
      }

      if (data.photography && Array.isArray(data.photography.tiles) && data.photography.tiles.length > 0) {
        rawTiles = data.photography.tiles;
      } else {
        rawTiles = getDefaultTiles();
      }
    } catch (e) {
      console.warn('Could not load /api/data, using curated master collection', e);
      rawTiles = getDefaultTiles();
    }

    // Standardize artwork objects with rich editorial curation
    allArtworks = rawTiles.map((t, idx) => {
      const story = masterStories[t.id] || masterStories[`ph-${(idx % 7) + 1}`] || {};
      const cat = (t.category || story.series || 'Fine Art').trim();
      const loc = (t.location || story.location || 'Dhaka, Bangladesh').trim();
      const romanNumeral = toRoman(idx + 1);

      return {
        id: t.id || `art-${idx}`,
        url: t.src,
        title: story.title || t.title || `Study in Light ${romanNumeral}`,
        series: story.series || `${cat} Retrospective`,
        plate: story.plate || `PLATE ${romanNumeral}`,
        artist: 'Rafshan Ekhowan',
        category: cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase(),
        rawCategory: cat.toLowerCase(),
        medium: story.medium || 'Archival Pigment Print on Cotton Rag',
        narrative: story.narrative || 'A visual exploration of atmospheric solitude, architectural cadence, and the authentic grain of silver halide optics.',
        optics: story.optics || t.aperture || '35mm Prime · ƒ/2.0 Natural Ambient',
        location: loc,
        year: t.year || story.year || '2024'
      };
    });

    filteredArtworks = [...allArtworks];
    currentIndex = 0;

    if (heroTotalCount) {
      heroTotalCount.textContent = String(allArtworks.length).padStart(2, '0');
    }

    initAmbience();
    buildCategoryFilters();
    renderStage();
    renderArchiveGrid();
    setupEvents();
    setupDragPhysics();
    startDhakaClock();
  }

  function getDefaultTiles() {
    return [
      { id: 'ph-1', src: '/uploads/1787480265326-89853182.jpg', category: 'Portrait', location: 'Old Dhaka' },
      { id: 'ph-2', src: '/uploads/1787481612842-736188960.jpg', category: 'Landscape', location: 'Sylhet Hills' },
      { id: 'ph-3', src: '/uploads/1787481618996-493664107.jpg', category: 'Product', location: 'Studio Geometry' },
      { id: 'ph-4', src: '/uploads/1787481625587-369984580.jpg', category: 'Abstract', location: 'Buriganga River' },
      { id: 'ph-5', src: '/uploads/1787481631372-817778819.jpg', category: 'Street', location: 'Gulistan Rush' },
      { id: 'ph-6', src: '/uploads/1787481637644-807634384.jpg', category: 'Landscape', location: 'Rangamati Lake' },
      { id: 'ph-7', src: '/uploads/1787480265326-89853182.jpg', category: 'Portrait', location: 'Shankhari Bazaar' }
    ];
  }

  function toRoman(num) {
    const roman = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
    let str = '';
    for (let i of Object.keys(roman)) {
      let q = Math.floor(num / roman[i]);
      num -= q * roman[i];
      str += i.repeat(q);
    }
    return str;
  }

  // --- Ambience Theme Toggle (Dark Pavilion / Light Salon) ---
  function initAmbience() {
    const saved = localStorage.getItem('gallery-ambience') || 'dark';
    applyAmbience(saved);
  }

  function applyAmbience(mode) {
    const iconEl = document.getElementById('ambienceIcon');
    const labelEl = document.getElementById('ambienceLabel');

    if (mode === 'light') {
      document.body.classList.add('theme-light-salon');
      if (iconEl) iconEl.textContent = '✧';
      if (labelEl) labelEl.textContent = 'Light Salon';
    } else {
      document.body.classList.remove('theme-light-salon');
      if (iconEl) iconEl.textContent = '✦';
      if (labelEl) labelEl.textContent = 'Dark Pavilion';
    }
    localStorage.setItem('gallery-ambience', mode);
  }

  // --- Dynamic Category Filters with Counts ---
  function buildCategoryFilters() {
    if (!filtersContainer) return;
    const catCounts = { all: allArtworks.length };

    allArtworks.forEach(a => {
      const c = a.rawCategory || 'fine art';
      catCounts[c] = (catCounts[c] || 0) + 1;
    });

    const categoryLabels = {
      all: 'All Master Plates',
      portrait: 'Portraiture',
      landscape: 'Landscapes',
      street: 'Urban Cadence',
      abstract: 'Abstract Form',
      product: 'Still Life'
    };

    const cats = Object.keys(catCounts);

    filtersContainer.innerHTML = cats.map(c => {
      const label = categoryLabels[c] || (c.charAt(0).toUpperCase() + c.slice(1));
      const count = String(catCounts[c]).padStart(2, '0');
      return `
        <button class="g-filter-btn ${c === activeFilter ? 'active' : ''}" data-cat="${c}">
          <span>${label}</span>
          <span class="filter-count">· ${count}</span>
        </button>
      `;
    }).join('');

    filtersContainer.querySelectorAll('.g-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filtersContainer.querySelectorAll('.g-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.cat;

        if (activeFilter === 'all') {
          filteredArtworks = [...allArtworks];
        } else {
          filteredArtworks = allArtworks.filter(a => a.rawCategory === activeFilter);
        }

        currentIndex = 0;
        renderStage();
        renderArchiveGrid();
      });
    });
  }

  // --- Render 3D Continuous Carousel Stage ---
  function renderStage() {
    if (!stage) return;
    stage.innerHTML = '';

    if (filteredArtworks.length === 0) {
      stage.innerHTML = `
        <div style="text-align:center; padding:60px 20px; color:var(--g-text-muted); font-family:'Cinzel',serif;">
          <div style="font-size:32px; margin-bottom:12px; color:var(--g-gold);">✧</div>
          <p style="letter-spacing:0.16em; text-transform:uppercase; font-size:14px;">No Plates in this curatorial series.</p>
        </div>
      `;
      if (stageRoman) stageRoman.textContent = 'PLATE 00 OF 00';
      if (stageProgressBar) stageProgressBar.style.width = '0%';
      if (stageDots) stageDots.innerHTML = '';
      if (stagePlacardWrap) stagePlacardWrap.innerHTML = '';
      return;
    }

    const total = filteredArtworks.length;

    // Create 3D stage track
    const track = document.createElement('div');
    track.className = 'stage-carousel-track';
    track.id = 'stageTrack';

    filteredArtworks.forEach((art, idx) => {
      const item = document.createElement('div');
      item.className = 'stage-card';
      item.setAttribute('data-idx', idx);

      // Positioning classes
      let offset = idx - currentIndex;
      // Wrap around for circular loop feel
      if (offset < -Math.floor(total / 2)) offset += total;
      if (offset > Math.floor(total / 2)) offset -= total;

      item.setAttribute('data-offset', offset);

      if (offset === 0) {
        item.classList.add('center');
      } else if (offset === -1) {
        item.classList.add('side-prev');
      } else if (offset === 1) {
        item.classList.add('side-next');
      } else {
        item.classList.add('far-hidden');
      }

      item.innerHTML = `
        <div class="stage-frame">
          <div class="stage-matting">
            <div class="stage-img-box">
              <img src="${art.url}" alt="${art.title}" loading="lazy">
              <div class="stage-glass-glare"></div>
              ${offset === 0 ? `
                <div class="stage-loupe-badge" title="Click to view full exhibition print">
                  <span class="loupe-icon">⤢</span>
                  <span>Examine Plate</span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;

      item.onclick = () => {
        if (offset === 0) {
          openLightbox(art);
        } else {
          setGalleryIndex(idx);
        }
      };

      track.appendChild(item);
    });

    stage.appendChild(track);

    // Update Museum Placard Beneath Stage
    updateMuseumPlacard();

    // Update Roman Progress Bar
    updateStageProgress();

    // Attach Mouse Tilt to Center Card
    attachStageTilt();
  }

  // --- Museum Wall Placard (Authentic Curatorial Depth) ---
  function updateMuseumPlacard() {
    if (!stagePlacardWrap) return;
    const current = filteredArtworks[currentIndex];
    if (!current) {
      stagePlacardWrap.innerHTML = '';
      return;
    }

    stagePlacardWrap.innerHTML = `
      <div class="museum-placard">
        <div class="placard-top">
          <span class="placard-plate">${current.plate}</span>
          <span class="placard-bullet">✦</span>
          <span class="placard-series">${current.series}</span>
        </div>
        <h3 class="placard-title">${current.title}</h3>
        <p class="placard-narrative">"${current.narrative}"</p>
        <div class="placard-specs">
          <span class="placard-spec-item"><strong>Medium:</strong> ${current.medium}</span>
          <span class="placard-spec-sep">·</span>
          <span class="placard-spec-item"><strong>Location:</strong> ${current.location}</span>
          <span class="placard-spec-sep">·</span>
          <span class="placard-spec-item"><strong>Capture:</strong> ${current.optics}</span>
        </div>
      </div>
    `;

    // Trigger smooth fade entrance
    const placard = stagePlacardWrap.querySelector('.museum-placard');
    if (placard && window.gsap) {
      gsap.fromTo(placard, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' });
    }
  }

  // --- Update Progress Track & Dots ---
  function updateStageProgress() {
    const total = filteredArtworks.length;
    if (total === 0) return;

    if (stageRoman) {
      const curRoman = toRoman(currentIndex + 1);
      const totRoman = toRoman(total);
      stageRoman.textContent = `PLATE ${curRoman} OF ${totRoman}`;
    }

    if (stageProgressBar) {
      const pct = ((currentIndex + 1) / total) * 100;
      stageProgressBar.style.width = `${pct}%`;
    }

    if (stageDots) {
      stageDots.innerHTML = filteredArtworks.map((_, i) =>
        `<span class="stage-dot ${i === currentIndex ? 'active' : ''}" onclick="window.setGalleryIndex(${i})" title="View Plate ${toRoman(i + 1)}"></span>`
      ).join('');
    }
  }

  // --- Smooth Stage Navigation ---
  window.rotateGallery = function (direction) {
    if (filteredArtworks.length <= 1) return;
    currentIndex = (currentIndex + direction + filteredArtworks.length) % filteredArtworks.length;
    renderStage();
  };

  window.setGalleryIndex = function (idx) {
    if (idx >= 0 && idx < filteredArtworks.length && idx !== currentIndex) {
      currentIndex = idx;
      renderStage();
    }
  };

  // --- Physical Drag & Touch Swipe ---
  function setupDragPhysics() {
    if (!stageDragWrap) return;

    let isDown = false;
    let startX = 0;
    let deltaX = 0;
    const threshold = 65; // px to advance plate

    stageDragWrap.addEventListener('mousedown', (e) => {
      // Ignore clicks on buttons
      if (e.target.closest('button')) return;
      isDown = true;
      startX = e.clientX;
      deltaX = 0;
      stageDragWrap.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      deltaX = e.clientX - startX;
    });

    window.addEventListener('mouseup', () => {
      if (!isDown) return;
      isDown = false;
      stageDragWrap.style.cursor = '';

      if (deltaX < -threshold) {
        rotateGallery(1); // next
      } else if (deltaX > threshold) {
        rotateGallery(-1); // prev
      }
    });

    // Touch support for mobile
    let touchStartX = 0;
    stageDragWrap.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    stageDragWrap.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchEndX - touchStartX;
      if (diff < -50) {
        rotateGallery(1);
      } else if (diff > 50) {
        rotateGallery(-1);
      }
    }, { passive: true });
  }

  // --- 3D Subtle Specular Tilt on Center Piece ---
  function attachStageTilt() {
    const centerCard = document.querySelector('.stage-card.center');
    if (!centerCard) return;

    centerCard.addEventListener('mousemove', (e) => {
      const rect = centerCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      centerCard.style.transform = `scale(1.15) translateZ(120px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    });

    centerCard.addEventListener('mouseleave', () => {
      centerCard.style.transform = '';
    });
  }

  // --- Curated Slideshow Tour (Dynamic Presentation Mode) ---
  function initCuratedTour() {
    if (!tourBtn) return;

    tourBtn.addEventListener('click', () => {
      if (isTourRunning) {
        stopTour();
      } else {
        startTour();
      }
    });
  }

  function startTour() {
    isTourRunning = true;
    if (tourBtn) {
      tourBtn.classList.add('running');
      tourBtn.querySelector('.tour-icon').textContent = '⏸';
      tourBtn.querySelector('.tour-label').textContent = 'Tour Active';
    }

    tourTimer = setInterval(() => {
      rotateGallery(1);
    }, TOUR_INTERVAL);
  }

  function stopTour() {
    isTourRunning = false;
    if (tourTimer) clearInterval(tourTimer);
    tourTimer = null;
    if (tourBtn) {
      tourBtn.classList.remove('running');
      tourBtn.querySelector('.tour-icon').textContent = '▶';
      tourBtn.querySelector('.tour-label').textContent = 'Curated Tour';
    }
  }

  // --- Render Folio Monograph Catalogue Grid ---
  function renderArchiveGrid() {
    if (!archiveGrid) return;
    archiveGrid.innerHTML = '';

    let displayArtworks = filteredArtworks;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      displayArtworks = filteredArtworks.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.series.toLowerCase().includes(q) ||
        a.medium.toLowerCase().includes(q)
      );
    }

    if (archiveCount) {
      const count = displayArtworks.length;
      archiveCount.textContent = `${String(count).padStart(2, '0')} ${count === 1 ? 'PLATE' : 'PLATES'}`;
    }

    if (displayArtworks.length === 0) {
      archiveGrid.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:80px 20px; color:var(--g-text-muted); font-family:'Cinzel',serif; background:var(--g-bg-card); border:1px solid var(--g-border); border-radius:14px;">
          <div style="font-size:36px; margin-bottom:14px; color:var(--g-gold);">✧ ✦ ✧</div>
          <div style="font-size:16px; letter-spacing:0.14em; text-transform:uppercase; color:var(--g-text-main); margin-bottom:10px;">No Plates Matching "${searchQuery}"</div>
          <p style="font-size:13px; max-width:440px; margin:auto; line-height:1.7; font-family:'Montserrat',sans-serif; color:var(--g-text-sub);">
            Please adjust your search criteria or clear the filter to examine all master plates in the collection.
          </p>
        </div>
      `;
      return;
    }

    // Editorial Asymmetric Rhythm for Folio Mode
    const spanRhythm = ['span-hero', 'span-side', 'span-third', 'span-third', 'span-third', 'span-wide', 'span-compact'];

    displayArtworks.forEach((item, idx) => {
      const card = document.createElement('div');
      const spanClass = spanRhythm[idx % spanRhythm.length];
      card.className = `archive-card ${spanClass}`;
      card.dataset.id = item.id;

      card.innerHTML = `
        <!-- Folio Monograph Passe-Partout Frame -->
        <div class="folio-frame">
          <div class="folio-top-stamp">
            <span class="folio-plate-badge">${item.plate}</span>
            <span class="folio-seal">AUTHENTIC PRINT</span>
          </div>

          <div class="folio-img-box">
            <img src="${item.url}" alt="${item.title}" loading="lazy">
            <div class="folio-vellum-shadow"></div>

            <!-- Luxurious Darkroom Action Overlay -->
            <div class="folio-action-overlay">
              <button class="folio-action-btn primary" data-action="lightbox" title="Inspect full print in darkroom lightbox">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                <span>Examine Print</span>
              </button>
              <button class="folio-action-btn secondary" data-action="stage" title="Mount plate on 3D perspective stage">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                <span>Mount on 3D Stage</span>
              </button>
            </div>
          </div>

          <!-- Folio Metadata & Typography -->
          <div class="folio-caption">
            <div class="folio-title-row">
              <h4 class="folio-title">${item.title}</h4>
              <span class="folio-arrow">↗</span>
            </div>
            <p class="folio-series-text">${item.series}</p>
            <div class="folio-specs-row">
              <span class="folio-loc">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>${item.location}</span>
              </span>
              <span class="folio-medium-badge">${item.year} · Archival Rag</span>
            </div>
          </div>
        </div>
      `;

      // Click Event Handling
      card.addEventListener('click', (e) => {
        const stageBtn = e.target.closest('[data-action="stage"]');
        if (stageBtn) {
          e.stopPropagation();
          stopTour();
          const targetIdx = filteredArtworks.findIndex(a => a.id === item.id);
          if (targetIdx !== -1) {
            currentIndex = targetIdx;
            renderStage();
          }
          const stageSec = document.getElementById('exhibition-stage-section');
          if (stageSec) {
            stageSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          return;
        }

        // Open Lightbox
        openLightbox(item);
      });

      archiveGrid.appendChild(card);
    });
  }

  // --- Glass Exhibition Lightbox Modal ---
  let lbCurrentIndex = 0;

  function openLightbox(data) {
    if (!lightbox) return;
    lbCurrentIndex = filteredArtworks.findIndex(a => a.id === data.id);
    if (lbCurrentIndex === -1) lbCurrentIndex = 0;

    updateLightboxView();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function updateLightboxView() {
    const art = filteredArtworks[lbCurrentIndex];
    if (!art) return;

    if (lbImg) {
      lbImg.src = art.url;
      lbImg.alt = art.title;
    }
    if (lbPlateTag) lbPlateTag.textContent = `${art.plate} · ${art.series}`;
    if (lbTitle) lbTitle.textContent = art.title;
    if (lbNarrative) lbNarrative.textContent = `"${art.narrative}"`;
    if (lbMeta) {
      lbMeta.innerHTML = `
        <span><strong>Location:</strong> ${art.location}</span>
        <span class="sep">·</span>
        <span><strong>Medium:</strong> ${art.medium}</span>
        <span class="sep">·</span>
        <span><strong>Optics:</strong> ${art.optics}</span>
      `;
    }
  }

  window.closeGalleryLightbox = function () {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  };

  window.navigateGalleryLightbox = function (dir) {
    if (filteredArtworks.length <= 1) return;
    lbCurrentIndex = (lbCurrentIndex + dir + filteredArtworks.length) % filteredArtworks.length;
    updateLightboxView();
  };

  // --- Event Bindings ---
  function setupEvents() {
    // Prev / Next Stage Navigation
    const prevBtn = document.getElementById('stage-prev');
    const nextBtn = document.getElementById('stage-next');
    if (prevBtn) prevBtn.addEventListener('click', () => { stopTour(); rotateGallery(-1); });
    if (nextBtn) nextBtn.addEventListener('click', () => { stopTour(); rotateGallery(1); });

    // Keyboard Arrow Keys
    window.addEventListener('keydown', (e) => {
      if (lightbox && lightbox.classList.contains('active')) {
        if (e.key === 'ArrowLeft') window.navigateGalleryLightbox(-1);
        if (e.key === 'ArrowRight') window.navigateGalleryLightbox(1);
        if (e.key === 'Escape') window.closeGalleryLightbox();
        return;
      }

      if (e.key === 'ArrowLeft') { stopTour(); rotateGallery(-1); }
      if (e.key === 'ArrowRight') { stopTour(); rotateGallery(1); }
      if (e.key === ' ') {
        // Spacebar toggles Curated Tour
        e.preventDefault();
        if (isTourRunning) stopTour(); else startTour();
      }
    });

    // Close Lightbox on Backdrop Click
    if (lightbox) {
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) window.closeGalleryLightbox();
      });
    }

    // View Toggle Buttons (All Views / 3D Stage / Catalogue)
    document.querySelectorAll('.g-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.g-toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentView = btn.dataset.view;

        const stageSec = document.getElementById('exhibition-stage-section');
        const archiveSec = document.getElementById('archive-section');

        if (currentView === 'stage') {
          if (stageSec) stageSec.style.display = 'block';
          if (archiveSec) archiveSec.style.display = 'none';
        } else if (currentView === 'grid') {
          if (stageSec) stageSec.style.display = 'none';
          if (archiveSec) archiveSec.style.display = 'block';
        } else {
          if (stageSec) stageSec.style.display = 'block';
          if (archiveSec) archiveSec.style.display = 'block';
        }
      });
    });

    // Archive Layout Switcher (Editorial / Matrix / Cinema)
    document.querySelectorAll('.layout-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.layout-toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentLayout = btn.dataset.layout;

        if (archiveGrid) {
          archiveGrid.className = `archive-grid layout-${currentLayout}`;
        }
      });
    });

    // Search Input
    const searchInput = document.getElementById('archive-search');
    const clearBtn = document.getElementById('archive-search-clear');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        if (clearBtn) clearBtn.style.display = searchQuery ? 'block' : 'none';
        renderArchiveGrid();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        searchQuery = '';
        clearBtn.style.display = 'none';
        renderArchiveGrid();
      });
    }

    // Ambience Switcher Button
    const ambToggle = document.getElementById('ambienceToggle');
    if (ambToggle) {
      ambToggle.addEventListener('click', () => {
        const isLight = document.body.classList.contains('theme-light-salon');
        applyAmbience(isLight ? 'dark' : 'light');
      });
    }

    // Curated Tour Button
    initCuratedTour();

    // Mobile Drawer Handlers
    const burger = document.getElementById('navBurger');
    const drawer = document.getElementById('mobileDrawer');
    const drawerClose = document.getElementById('drawerClose');

    if (burger && drawer) {
      burger.addEventListener('click', () => drawer.classList.add('open'));
    }
    if (drawerClose && drawer) {
      drawerClose.addEventListener('click', () => drawer.classList.remove('open'));
    }
  }

  // --- Real-Time Dhaka Clock ---
  function startDhakaClock() {
    function updateClock() {
      const el = document.getElementById('clock');
      const drawerEl = document.getElementById('drawerClock');
      if (!el && !drawerEl) return;

      const now = new Date();
      const options = {
        timeZone: 'Asia/Dhaka',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      };
      const timeStr = now.toLocaleTimeString('en-GB', options);
      if (el) el.textContent = `${timeStr} DHK`;
      if (drawerEl) drawerEl.textContent = `${timeStr} DHAKA`;
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGallery);
  } else {
    initGallery();
  }

})();
