/* ==========================================================================
   gallery.js — Lumière Classic & Minimal 3D Exhibition Gallery Engine
   Dynamically loads photography from /api/data and renders the 3D stage & archive
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
  async function initGallery() {
    try {
      const res = await fetch('/api/data');
      if (!res.ok) throw new Error('API fetch failed');
      const data = await res.json();
      
      // Sync footer
      if (data.footer) {
        const copy = document.getElementById('footer-copy');
        const loc = document.getElementById('footer-loc');
        if (copy) copy.textContent = data.footer.copyright || '';
        if (loc) loc.textContent = data.footer.location || '';
      }

      if (data.photography && Array.isArray(data.photography.tiles) && data.photography.tiles.length > 0) {
        rawTiles = data.photography.tiles;
      } else {
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
      };
    });

    filteredArtworks = [...allArtworks];
    currentIndex = filteredArtworks.length > 1 ? 1 : 0;

    buildCategoryFilters();
    renderStage();
    renderArchiveGrid();
    setupEvents();
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

  // --- Render 3D Stage ---
  function renderStage() {
    if (!stage) return;
    stage.innerHTML = '';

    if (filteredArtworks.length === 0) {
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
  window.rotateGallery = function (direction) {
    if (filteredArtworks.length <= 1) return;
    currentIndex = (currentIndex + direction + filteredArtworks.length) % filteredArtworks.length;
    renderStage();
  };

  window.setGalleryIndex = function (idx) {
    if (idx >= 0 && idx < filteredArtworks.length) {
      currentIndex = idx;
      renderStage();
    }
  };

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
  function renderArchiveGrid() {
    if (!archiveGrid) return;
    archiveGrid.innerHTML = '';

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
    }

    if (displayArtworks.length === 0) {
      archiveGrid.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:70px 20px; color:rgba(236,232,226,0.6); font-family:var(--mono); background:rgba(20,30,24,0.4); border:1px solid rgba(163,159,114,0.18); border-radius:12px;">
          <div style="font-size:32px; margin-bottom:12px; color:var(--c-sage,#A39F72); text-shadow:0 0 15px rgba(163,159,114,0.4);">✧ ✦ ✧</div>
          <div style="font-size:15px; letter-spacing:0.12em; text-transform:uppercase; color:#FFFFFF; font-family:'Cinzel',serif; margin-bottom:8px;">No Artworks Matching Criteria</div>
          <p style="font-size:12px; color:rgba(236,232,226,0.45); max-width:440px; margin:auto; line-height:1.6;">
            We couldn't find any photographs matching "${searchQuery}". Please check your spelling or clear the search query.
          </p>
        </div>
      `;
      return;
    }

    // Editorial Layout span rhythm pattern for 12-column grid
    const spanRhythm = ['span-hero', 'span-side', 'span-third', 'span-third', 'span-third', 'span-wide', 'span-compact'];

    displayArtworks.forEach((item, idx) => {
      const card = document.createElement('div');
      const spanClass = spanRhythm[idx % spanRhythm.length];
      card.className = `archive-card ${spanClass}`;
      card.dataset.id = item.id;

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
          </div>
        </div>
      `;

      // Interactive Click Handling
      card.addEventListener('click', (e) => {
        const stageBtn = e.target.closest('[data-action="stage"]');
        if (stageBtn) {
          e.stopPropagation();
          // Find index in filteredArtworks
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

        // Default or lightbox action: Open Exhibition Lightbox
        openLightbox(item);
      });

      archiveGrid.appendChild(card);
    });
  }

  // --- Glass Lightbox ---
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
    const item = filteredArtworks[lbCurrentIndex];
    if (!item) return;

    if (lbImg) lbImg.src = item.url;
    if (lbTitle) lbTitle.textContent = item.title;
    if (lbArtist) lbArtist.textContent = `${item.artist} // ${item.category}`;
    if (lbMeta) lbMeta.textContent = `${item.location} · ${item.aperture} · ${item.year}`;
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
          if (stageSec) stageSec.style.display = 'none';
          if (archiveSec) archiveSec.style.display = 'block';
        } else {
          if (stageSec) stageSec.style.display = 'block';
          if (archiveSec) archiveSec.style.display = 'block';
        }
      });
    });

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
        }
      });
    });

    // Mobile nav drawer
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

  // --- Live Dhaka Clock ---
  function startDhakaClock() {
    function update() {
      const clock = document.getElementById('clock');
      const drawerClock = document.getElementById('drawerClock');
      const now = new Date();
      const str = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Dhaka',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }) + ' DHK';

      if (clock) clock.textContent = str;
      if (drawerClock) drawerClock.textContent = str;
    }
    update();
    setInterval(update, 1000);
  }

  // DOM ready
  document.addEventListener('DOMContentLoaded', initGallery);
})();
