/* ==========================================================================
<<<<<<< HEAD
   gallery.js — Lumière Luxury Fine Art Photography Retrospective Engine
   Continuous 3D Horizon Arc, Museum Wall Placard, Physical Drag Inertia,
   Curated Tour Slideshow, and Folio Monograph Catalogue
=======
   gallery.js — Lumière Classic & Minimal 3D Exhibition Gallery Engine
   Dynamically loads photography from /api/data and renders the 3D stage & archive
>>>>>>> 89e3c1dd93c57fc79979d38968029bf34d58fcba
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
<<<<<<< HEAD
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
=======

  const stage = document.getElementById('gallery-stage');
  const stageDots = document.getElementById('stage-dots');
  const stageCounter = document.getElementById('stage-counter');
  const archiveGrid = document.getElementById('archive-grid');
  const archiveCount = document.getElementById('archive-count');
  const filtersContainer = document.getElementById('gallery-filters');
  const lightbox = document.getElementById('gallery-lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbTitle = document.getElementById('lb-title');
  const lbArtist = document.getElementById('lb-artist');
  const lbMeta = document.getElementById('lb-meta');

  // --- Fetch Data ---
>>>>>>> 89e3c1dd93c57fc79979d38968029bf34d58fcba
  async function initGallery() {
    try {
      const res = await fetch('/api/data');
      if (!res.ok) throw new Error('API fetch failed');
      const data = await res.json();
<<<<<<< HEAD

      if (data.footer) {
        const copy = document.getElementById('footer-copy');
        const loc = document.getElementById('footer-loc');
        if (copy) copy.textContent = data.footer.copyright || '© 2026 Rafshan Ekhowan. Fine Art Photography Retrospective.';
        if (loc) loc.textContent = data.footer.location || 'Dhaka, Bangladesh';
=======
      
      // Sync footer
      if (data.footer) {
        const copy = document.getElementById('footer-copy');
        const loc = document.getElementById('footer-loc');
        if (copy) copy.textContent = data.footer.copyright || '';
        if (loc) loc.textContent = data.footer.location || '';
>>>>>>> 89e3c1dd93c57fc79979d38968029bf34d58fcba
      }

      if (data.photography && Array.isArray(data.photography.tiles) && data.photography.tiles.length > 0) {
        rawTiles = data.photography.tiles;
      } else {
<<<<<<< HEAD
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
=======
        // Fallback default artwork collection
        rawTiles = [
          { id: 'ph-1', src: '/uploads/1787480265326-89853182.jpg', category: 'Portrait', location: 'Old Dhaka', aperture: 'f/2.8 · 1/500' },
          { id: 'ph-2', src: '/uploads/1787481612842-736188960.jpg', category: 'Landscape', location: 'Sylhet Hills', aperture: 'f/11 · 1/125' },
          { id: 'ph-3', src: '/uploads/1787481618996-493664107.jpg', category: 'Product', location: 'Studio Geometry', aperture: 'f/8 · 1/160' },
          { id: 'ph-4', src: '/uploads/1787481625587-369984580.jpg', category: 'Abstract', location: 'Buriganga River', aperture: 'f/4 · 1/60' },
          { id: 'ph-5', src: '/uploads/1787481631372-817778819.jpg', category: 'Street', location: 'Gulistan Rush', aperture: 'f/2.0 · 1/1000' },
          { id: 'ph-6', src: '/uploads/1787481637644-807634384.jpg', category: 'Landscape', location: 'Rangamati Lake', aperture: 'f/13 · 1/60' }
        ];
      }
    } catch (e) {
      console.warn('Could not load /api/data, using local fallback', e);
      rawTiles = [
        { id: 'ph-1', src: '/uploads/1787480265326-89853182.jpg', category: 'Portrait', location: 'Old Dhaka', aperture: 'f/2.8 · 1/500' },
        { id: 'ph-2', src: '/uploads/1787481612842-736188960.jpg', category: 'Landscape', location: 'Sylhet Hills', aperture: 'f/11 · 1/125' }
      ];
    }

    // Standardize artwork objects
    allArtworks = rawTiles.map((t, idx) => {
      const cat = (t.category || 'Fine Art').trim();
      const loc = (t.location || '').trim();
      const rawTitle = t.title || t.alt || loc || cat;
      const title = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);
      return {
        id: t.id || `art-${idx}`,
        url: t.src,
        title: title,
        artist: 'Rafshan Ekhowan',
        category: cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase(),
        rawCategory: cat.toLowerCase(),
        aperture: t.aperture || '35mm Prime',
        location: loc || 'Dhaka, Bangladesh',
        year: t.year || '2024'
>>>>>>> 89e3c1dd93c57fc79979d38968029bf34d58fcba
      };
    });

    filteredArtworks = [...allArtworks];
<<<<<<< HEAD
    currentIndex = 0;

    if (heroTotalCount) {
      heroTotalCount.textContent = String(allArtworks.length).padStart(2, '0');
    }

    initAmbience();
=======
    currentIndex = filteredArtworks.length > 1 ? 1 : 0;

>>>>>>> 89e3c1dd93c57fc79979d38968029bf34d58fcba
    buildCategoryFilters();
    renderStage();
    renderArchiveGrid();
    setupEvents();
<<<<<<< HEAD
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
=======
    startDhakaClock();
  }

  // --- Dynamic Category Filters ---
  function buildCategoryFilters() {
    if (!filtersContainer) return;
    const cats = new Set(['all']);
    allArtworks.forEach(a => {
      if (a.rawCategory) cats.add(a.rawCategory);
    });

    filtersContainer.innerHTML = Array.from(cats).map(c => {
      const label = c === 'all' ? 'All Works' : (c.charAt(0).toUpperCase() + c.slice(1));
      return `<button class="g-filter-btn ${c === activeFilter ? 'active' : ''}" data-cat="${c}">${label}</button>`;
>>>>>>> 89e3c1dd93c57fc79979d38968029bf34d58fcba
    }).join('');

    filtersContainer.querySelectorAll('.g-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filtersContainer.querySelectorAll('.g-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.cat;
<<<<<<< HEAD

=======
        
>>>>>>> 89e3c1dd93c57fc79979d38968029bf34d58fcba
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

<<<<<<< HEAD
  // --- Render 3D Continuous Carousel Stage ---
=======
  // --- Render 3D Stage ---
>>>>>>> 89e3c1dd93c57fc79979d38968029bf34d58fcba
  function renderStage() {
    if (!stage) return;
    stage.innerHTML = '';

    if (filteredArtworks.length === 0) {
<<<<<<< HEAD
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
      const current = filteredArtworks[currentIndex];
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
=======
      stage.innerHTML = `<div style="text-align:center; padding:40px; color:rgba(236,232,226,0.6); font-family:var(--mono);">No artworks in this genre yet.</div>`;
      if (stageCounter) stageCounter.textContent = '00 / 00';
      if (stageDots) stageDots.innerHTML = '';
      return;
    }

    const len = filteredArtworks.length;
    // Calculate 3 slots: Left, Center, Right
    const prevIndex = (currentIndex - 1 + len) % len;
    const nextIndex = (currentIndex + 1) % len;

    let displayItems = [];
    if (len === 1) {
      displayItems = [{ data: filteredArtworks[0], pos: 'center', idx: 0 }];
    } else if (len === 2) {
      displayItems = [
        { data: filteredArtworks[prevIndex], pos: 'side-left', idx: prevIndex },
        { data: filteredArtworks[currentIndex], pos: 'center', idx: currentIndex }
      ];
    } else {
      displayItems = [
        { data: filteredArtworks[prevIndex], pos: 'side-left', idx: prevIndex },
        { data: filteredArtworks[currentIndex], pos: 'center', idx: currentIndex },
        { data: filteredArtworks[nextIndex], pos: 'side-right', idx: nextIndex }
      ];
    }

    displayItems.forEach(item => {
      const wrapper = document.createElement('div');
      wrapper.className = `frame-wrapper ${item.pos}`;
      wrapper.setAttribute('data-idx', item.idx);

      wrapper.onclick = () => {
        if (item.pos === 'center') {
          openLightbox(item.data);
        } else if (item.pos === 'side-left') {
          rotateGallery(-1);
        } else if (item.pos === 'side-right') {
          rotateGallery(1);
        }
      };

      wrapper.innerHTML = `
        <div class="minimal-frame">
          <div class="minimal-frame-inner">
            <img src="${item.data.url}" alt="${item.data.title}" loading="lazy">
          </div>
        </div>
        <div class="artwork-info">
          <h4 class="info-title serif-font">${item.data.title}</h4>
          <p class="info-artist">${item.data.artist} // ${item.data.category}</p>
          <p class="info-meta">${item.data.location} · ${item.data.aperture}</p>
        </div>
      `;

      stage.appendChild(wrapper);
    });

    // Update Counter
    if (stageCounter) {
      const curStr = String(currentIndex + 1).padStart(2, '0');
      const totalStr = String(len).padStart(2, '0');
      stageCounter.textContent = `${curStr} / ${totalStr}`;
    }

    // Update Dots
    if (stageDots) {
      stageDots.innerHTML = filteredArtworks.map((_, i) => 
        `<span class="stage-dot ${i === currentIndex ? 'active' : ''}" onclick="window.setGalleryIndex(${i})"></span>`
      ).join('');
    }

    attachTiltEffect();
  }

  // --- Rotate Carousel ---
>>>>>>> 89e3c1dd93c57fc79979d38968029bf34d58fcba
  window.rotateGallery = function (direction) {
    if (filteredArtworks.length <= 1) return;
    currentIndex = (currentIndex + direction + filteredArtworks.length) % filteredArtworks.length;
    renderStage();
  };

  window.setGalleryIndex = function (idx) {
<<<<<<< HEAD
    if (idx >= 0 && idx < filteredArtworks.length && idx !== currentIndex) {
=======
    if (idx >= 0 && idx < filteredArtworks.length) {
>>>>>>> 89e3c1dd93c57fc79979d38968029bf34d58fcba
      currentIndex = idx;
      renderStage();
    }
  };

<<<<<<< HEAD
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
=======
  // --- Interactive 3D Mousemove Tilt ---
  function attachTiltEffect() {
    const wrappers = document.querySelectorAll('.frame-wrapper');
    wrappers.forEach(wrapper => {
      wrapper.addEventListener('mousemove', (e) => {
        const rect = wrapper.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;

        let baseTransform = '';
        if (wrapper.classList.contains('center')) {
          baseTransform = 'scale(1.1) translateZ(60px)';
        } else if (wrapper.classList.contains('side-left')) {
          baseTransform = 'scale(0.85) translateX(12%) translateZ(-90px) rotateY(16deg)';
        } else {
          baseTransform = 'scale(0.85) translateX(-12%) translateZ(-90px) rotateY(-16deg)';
        }

        wrapper.style.transform = `${baseTransform} rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
      });

      wrapper.addEventListener('mouseleave', () => {
        let baseTransform = '';
        if (wrapper.classList.contains('center')) {
          baseTransform = 'scale(1.1) translateZ(60px)';
        } else if (wrapper.classList.contains('side-left')) {
          baseTransform = 'scale(0.85) translateX(12%) translateZ(-90px) rotateY(16deg)';
        } else {
          baseTransform = 'scale(0.85) translateX(-12%) translateZ(-90px) rotateY(-16deg)';
        }
        wrapper.style.transform = baseTransform;
      });
    });
  }

  // --- Render Archive Grid (Lucrative Fine Art Catalogue) ---
>>>>>>> 89e3c1dd93c57fc79979d38968029bf34d58fcba
  function renderArchiveGrid() {
    if (!archiveGrid) return;
    archiveGrid.innerHTML = '';

<<<<<<< HEAD
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
=======
    // Apply search filter if present
    let displayArtworks = filteredArtworks;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      displayArtworks = filteredArtworks.filter(a => 
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.aperture.toLowerCase().includes(q)
      );
    }

    // Update Live Count in Stats Ribbon
    if (archiveCount) {
      archiveCount.textContent = `${displayArtworks.length} ${displayArtworks.length === 1 ? 'EDITION' : 'EDITIONS'}`;
>>>>>>> 89e3c1dd93c57fc79979d38968029bf34d58fcba
    }

    if (displayArtworks.length === 0) {
      archiveGrid.innerHTML = `
<<<<<<< HEAD
        <div style="grid-column:1/-1; text-align:center; padding:80px 20px; color:var(--g-text-muted); font-family:'Cinzel',serif; background:var(--g-bg-card); border:1px solid var(--g-border); border-radius:14px;">
          <div style="font-size:36px; margin-bottom:14px; color:var(--g-gold);">✧ ✦ ✧</div>
          <div style="font-size:16px; letter-spacing:0.14em; text-transform:uppercase; color:var(--g-text-main); margin-bottom:10px;">No Plates Matching "${searchQuery}"</div>
          <p style="font-size:13px; max-width:440px; margin:auto; line-height:1.7; font-family:'Montserrat',sans-serif; color:var(--g-text-sub);">
            Please adjust your search criteria or clear the filter to examine all master plates in the collection.
=======
        <div style="grid-column:1/-1; text-align:center; padding:70px 20px; color:rgba(236,232,226,0.6); font-family:var(--mono); background:rgba(20,30,24,0.4); border:1px solid rgba(163,159,114,0.18); border-radius:12px;">
          <div style="font-size:32px; margin-bottom:12px; color:var(--c-sage,#A39F72); text-shadow:0 0 15px rgba(163,159,114,0.4);">✧ ✦ ✧</div>
          <div style="font-size:15px; letter-spacing:0.12em; text-transform:uppercase; color:#FFFFFF; font-family:'Cinzel',serif; margin-bottom:8px;">No Artworks Matching Criteria</div>
          <p style="font-size:12px; color:rgba(236,232,226,0.45); max-width:440px; margin:auto; line-height:1.6;">
            We couldn't find any photographs matching "${searchQuery}". Please check your spelling or clear the search query.
>>>>>>> 89e3c1dd93c57fc79979d38968029bf34d58fcba
          </p>
        </div>
      `;
      return;
    }

<<<<<<< HEAD
    // Editorial Asymmetric Rhythm for Folio Mode
=======
    // Editorial Layout span rhythm pattern for 12-column grid
>>>>>>> 89e3c1dd93c57fc79979d38968029bf34d58fcba
    const spanRhythm = ['span-hero', 'span-side', 'span-third', 'span-third', 'span-third', 'span-wide', 'span-compact'];

    displayArtworks.forEach((item, idx) => {
      const card = document.createElement('div');
      const spanClass = spanRhythm[idx % spanRhythm.length];
      card.className = `archive-card ${spanClass}`;
      card.dataset.id = item.id;

<<<<<<< HEAD
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
=======
      const editionNumber = String(idx + 1).padStart(2, '0');

      card.innerHTML = `
        <!-- Card Top Bar -->
        <div class="archive-card-top">
          <span class="card-edition-badge">№ ${editionNumber}</span>
          <span class="card-category-badge">${item.category}</span>
        </div>

        <!-- Frameless Image Container -->
        <div class="archive-img-wrap">
          <img src="${item.url}" alt="${item.title}" loading="lazy">

          <!-- Floating Technical Spec Tag -->
          <div class="card-spec-tag">
            <span>${item.aperture}</span>
          </div>

          <!-- Elegant Interactive Hover Overlay -->
          <div class="archive-card-overlay">
            <button class="overlay-action-btn primary" data-action="lightbox" title="Zoom full image in exhibition lightbox">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
              <span>View Lightbox</span>
            </button>
            <button class="overlay-action-btn secondary" data-action="stage" title="Send artwork to 3D center stage">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              <span>View in 3D</span>
            </button>
          </div>
        </div>

        <!-- Card Metadata Area -->
        <div class="archive-card-meta">
          <div class="archive-card-title-row">
            <h4 class="archive-card-title">${item.title}</h4>
            <div class="archive-card-arrow" title="View details">↗</div>
          </div>
          
          <div class="archive-card-location-row">
            <div class="archive-card-location">
              <span>${item.location}</span>
            </div>
            <span class="archive-card-year">${item.year}</span>
>>>>>>> 89e3c1dd93c57fc79979d38968029bf34d58fcba
          </div>
        </div>
      `;

<<<<<<< HEAD
      // Click Event Handling
=======
      // Interactive Click Handling
>>>>>>> 89e3c1dd93c57fc79979d38968029bf34d58fcba
      card.addEventListener('click', (e) => {
        const stageBtn = e.target.closest('[data-action="stage"]');
        if (stageBtn) {
          e.stopPropagation();
<<<<<<< HEAD
          stopTour();
=======
          // Find index in filteredArtworks
>>>>>>> 89e3c1dd93c57fc79979d38968029bf34d58fcba
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

<<<<<<< HEAD
        // Open Lightbox
=======
        // Default or lightbox action: Open Exhibition Lightbox
>>>>>>> 89e3c1dd93c57fc79979d38968029bf34d58fcba
        openLightbox(item);
      });

      archiveGrid.appendChild(card);
    });
  }

<<<<<<< HEAD
  // --- Glass Exhibition Lightbox Modal ---
=======
  // --- Glass Lightbox ---
>>>>>>> 89e3c1dd93c57fc79979d38968029bf34d58fcba
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
<<<<<<< HEAD
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
=======
    const item = filteredArtworks[lbCurrentIndex];
    if (!item) return;

    if (lbImg) lbImg.src = item.url;
    if (lbTitle) lbTitle.textContent = item.title;
    if (lbArtist) lbArtist.textContent = `${item.artist} // ${item.category}`;
    if (lbMeta) lbMeta.textContent = `${item.location} · ${item.aperture} · ${item.year}`;
>>>>>>> 89e3c1dd93c57fc79979d38968029bf34d58fcba
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

<<<<<<< HEAD
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
=======
  // --- Event Setup (Keyboard, Gestures, Views) ---
  function setupEvents() {
    // Stage Prev/Next buttons
    const prevBtn = document.getElementById('stage-prev');
    const nextBtn = document.getElementById('stage-next');
    if (prevBtn) prevBtn.addEventListener('click', () => rotateGallery(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => rotateGallery(1));

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (lightbox && lightbox.classList.contains('active')) {
        if (e.key === 'Escape') closeGalleryLightbox();
        else if (e.key === 'ArrowLeft') navigateGalleryLightbox(-1);
        else if (e.key === 'ArrowRight') navigateGalleryLightbox(1);
        return;
      }

      if (e.key === 'ArrowLeft') rotateGallery(-1);
      else if (e.key === 'ArrowRight') rotateGallery(1);
    });

    // Lightbox Backdrop Click
    if (lightbox) {
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('gallery-lb-content')) {
          closeGalleryLightbox();
        }
      });
    }

    // Mouse wheel scrub over exhibition stage
    const stageWrap = document.querySelector('.exhibition-stage-wrap');
    if (stageWrap) {
      let wheelThrottle = false;
      stageWrap.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaX) > 25 || Math.abs(e.deltaY) > 35) {
          if (!wheelThrottle) {
            wheelThrottle = true;
            rotateGallery(e.deltaX > 0 || e.deltaY > 0 ? 1 : -1);
            setTimeout(() => { wheelThrottle = false; }, 400);
          }
          e.preventDefault();
        }
      }, { passive: false });
    }

    // Touch swipe gestures on stage
    let touchStartX = 0;
    let touchEndX = 0;
    if (stage) {
      stage.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      stage.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchEndX - touchStartX;
        if (Math.abs(diff) > 45) {
          rotateGallery(diff < 0 ? 1 : -1);
        }
      }, { passive: true });
    }

    // View Mode Toggle (Both, Stage Only, Grid Only)
    const stageSec = document.getElementById('exhibition-stage-section');
    const archiveSec = document.getElementById('archive-section');
    const toggleBtns = document.querySelectorAll('.g-toggle-btn');

    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        toggleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.view;
        currentView = mode;

        if (mode === 'stage') {
          if (stageSec) stageSec.style.display = 'block';
          if (archiveSec) archiveSec.style.display = 'none';
        } else if (mode === 'grid') {
>>>>>>> 89e3c1dd93c57fc79979d38968029bf34d58fcba
          if (stageSec) stageSec.style.display = 'none';
          if (archiveSec) archiveSec.style.display = 'block';
        } else {
          if (stageSec) stageSec.style.display = 'block';
          if (archiveSec) archiveSec.style.display = 'block';
        }
      });
    });

<<<<<<< HEAD
    // Archive Layout Switcher (Editorial / Matrix / Cinema)
    document.querySelectorAll('.layout-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.layout-toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentLayout = btn.dataset.layout;

        if (archiveGrid) {
          archiveGrid.className = `archive-grid layout-${currentLayout}`;
=======
    // Archive Search Filter
    const searchInput = document.getElementById('archive-search');
    const searchClearBtn = document.getElementById('archive-search-clear');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        if (searchClearBtn) {
          searchClearBtn.style.display = searchQuery.trim().length > 0 ? 'inline-block' : 'none';
        }
        renderArchiveGrid();
      });
    }

    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        searchQuery = '';
        searchClearBtn.style.display = 'none';
        renderArchiveGrid();
      });
    }

    // Archive Layout Switcher (Editorial, Matrix, Wide)
    const layoutBtns = document.querySelectorAll('.layout-toggle-btn');
    layoutBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        layoutBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const layout = btn.dataset.layout;
        currentLayout = layout;
        if (archiveGrid) {
          archiveGrid.classList.remove('layout-editorial', 'layout-grid', 'layout-panoramic');
          archiveGrid.classList.add(`layout-${layout}`);
>>>>>>> 89e3c1dd93c57fc79979d38968029bf34d58fcba
        }
      });
    });

<<<<<<< HEAD
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

=======
    // Mobile nav drawer
    const burger = document.getElementById('navBurger');
    const drawer = document.getElementById('mobileDrawer');
    const drawerClose = document.getElementById('drawerClose');
>>>>>>> 89e3c1dd93c57fc79979d38968029bf34d58fcba
    if (burger && drawer) {
      burger.addEventListener('click', () => drawer.classList.add('open'));
    }
    if (drawerClose && drawer) {
      drawerClose.addEventListener('click', () => drawer.classList.remove('open'));
    }
  }

<<<<<<< HEAD
  // --- Real-Time Dhaka Clock ---
  function startDhakaClock() {
    function updateClock() {
      const el = document.getElementById('clock');
      const drawerEl = document.getElementById('drawerClock');
      if (!el && !drawerEl) return;

      const now = new Date();
      const options = {
=======
  // --- Live Dhaka Clock ---
  function startDhakaClock() {
    function update() {
      const clock = document.getElementById('clock');
      const drawerClock = document.getElementById('drawerClock');
      const now = new Date();
      const str = now.toLocaleTimeString('en-US', {
>>>>>>> 89e3c1dd93c57fc79979d38968029bf34d58fcba
        timeZone: 'Asia/Dhaka',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
<<<<<<< HEAD
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

=======
      }) + ' DHK';

      if (clock) clock.textContent = str;
      if (drawerClock) drawerClock.textContent = str;
    }
    update();
    setInterval(update, 1000);
  }

  // DOM ready
  document.addEventListener('DOMContentLoaded', initGallery);
>>>>>>> 89e3c1dd93c57fc79979d38968029bf34d58fcba
})();
