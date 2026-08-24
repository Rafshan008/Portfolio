document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/api/data?t=' + Date.now());
    const data = await response.json();
    renderSite(data);
    
    // Initialize animations immediately so we don't get blocked by lazy loaded images
    if (typeof initAnimations === 'function') {
      initAnimations();
    }
    
    // Refresh ScrollTrigger periodically as images load
    window.addEventListener('load', () => {
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    });
    setTimeout(() => { if (window.ScrollTrigger) window.ScrollTrigger.refresh(); }, 2000);
  } catch (error) {
    console.error('Failed to load site data:', error);
  }
});

function renderSite(data) {
  window.siteData = data; // Make data available for lightbox
  // Meta
  document.title = data.meta.title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', data.meta.description);

  // Hero
  const heroStatus = document.getElementById('hero-status');
  if (heroStatus && data.hero.statusBar) {
    heroStatus.innerHTML = data.hero.statusBar.map(item => `<span>${item.label}: <b>${item.value}</b></span>`).join('');
  }
  
  const heroEyebrow = document.getElementById('hero-eyebrow');
  if (heroEyebrow) heroEyebrow.textContent = data.hero.eyebrow;

  const heroTitle = document.getElementById('hero-title');
  if (heroTitle) {
    heroTitle.innerHTML = `${data.hero.titleLine1}<br>${data.hero.titleLine2}`;
  }

  const heroSub = document.getElementById('hero-sub');
  if (heroSub) heroSub.textContent = data.hero.subtitle;

  const ctaPrimary = document.getElementById('cta-primary');
  if (ctaPrimary && data.hero.ctaPrimary) {
    ctaPrimary.textContent = data.hero.ctaPrimary.label;
    ctaPrimary.href = data.hero.ctaPrimary.href;
  }

  const ctaSecondary = document.getElementById('cta-secondary');
  if (ctaSecondary && data.hero.ctaSecondary) {
    ctaSecondary.textContent = data.hero.ctaSecondary.label;
    ctaSecondary.href = data.hero.ctaSecondary.href;
  }

  const heroImage = document.getElementById('hero-image');
  if (heroImage && data.hero.image) {
    heroImage.src = data.hero.image.src;
    heroImage.alt = data.hero.image.alt;
  }

  // ── GRIDX ABOUT SECTION ──
  const sidebar = document.getElementById('gridx-sidebar');
  const content = document.getElementById('gridx-content');
  if (sidebar && data.profile) {
    sidebar.innerHTML = `
      <div class="gridx-profile-card">
        <div class="gridx-avatar">
          <img src="${data.profile.avatar || ''}" alt="Avatar">
        </div>
        <h3 class="gridx-name">${data.meta.title.split('—')[0].trim()}</h3>
        <p class="gridx-handle">${data.profile.handle || ''}</p>
        <div class="gridx-socials">
          ${(data.profile.socials || []).map(s => `<a href="${s.url}" title="${s.name}" class="social-icon">${s.name[0]}</a>`).join('')}
        </div>
        <a href="#contact" class="btn gridx-btn-solid">Contact me</a>
      </div>
    `;
  }

  if (content && data.profile) {
    let aboutHtml = `
      <div class="gridx-block">
        <h4 class="gridx-block-title">ABOUT ME</h4>
        ${data.profile.paragraphs.map(p => `<p class="gridx-p">${p}</p>`).join('')}
      </div>
    `;

    if (data.experience && data.experience.timeline) {
      aboutHtml += `
        <div class="gridx-block">
          <h4 class="gridx-block-title">EXPERIENCE</h4>
          <div class="gridx-timeline">
            ${data.experience.timeline.map(item => `
              <div class="gridx-tl-item">
                <div class="gridx-tl-date">${item.date}</div>
                <div class="gridx-tl-role">${item.role}</div>
                <div class="gridx-tl-org">${item.org}</div>
                <p class="gridx-p">${item.bullets.join(' ')}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (data.profile.education && data.profile.education.length > 0) {
      aboutHtml += `
        <div class="gridx-block">
          <h4 class="gridx-block-title">EDUCATION</h4>
          <div class="gridx-timeline">
            ${data.profile.education.map(item => `
              <div class="gridx-tl-item">
                <div class="gridx-tl-date">${item.year}</div>
                <div class="gridx-tl-role">${item.degree}</div>
                <div class="gridx-tl-org">${item.institution}</div>
                <p class="gridx-p">${item.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (data.skills && data.skills.columns) {
      aboutHtml += `
        <div class="gridx-block">
          <h4 class="gridx-block-title">SKILLS</h4>
          <div class="gridx-skills-grid">
            ${data.skills.columns.map(col => col.tags.map(t => `
              <div class="gridx-skill-item">
                <div class="gridx-skill-name">${t}</div>
                <p class="gridx-p" style="font-size:11px;">Non enim praesent</p>
              </div>
            `).join('')).join('')}
          </div>
        </div>
      `;
    }

    if (data.profile.awards && data.profile.awards.length > 0) {
      aboutHtml += `
        <div class="gridx-block">
          <h4 class="gridx-block-title">AWARDS</h4>
          <div class="gridx-timeline">
            ${data.profile.awards.map(item => `
              <div class="gridx-tl-item">
                <div class="gridx-tl-date">${item.date}</div>
                <div class="gridx-tl-role">${item.title}</div>
                <p class="gridx-p">${item.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    content.innerHTML = aboutHtml;
  }

  // ── GRIDX PROJECTS ──
  const projGrid = document.getElementById('proj-grid');
  if (projGrid && data.projects.items) {
    projGrid.innerHTML = data.projects.items.map((proj, idx) => `
      <div class="gridx-proj-card" onclick="openLightbox('project', ${idx})">
        <div class="gridx-proj-img-wrap">
          <img src="${proj.thumbnail || '/uploads/placeholder.jpg'}" alt="${proj.name}">
        </div>
        <div class="gridx-proj-meta">
          <div class="gridx-proj-cat">${proj.category || 'PROJECT'}</div>
          <div class="gridx-proj-title">${proj.name}</div>
        </div>
        <div class="gridx-proj-icon">→</div>
      </div>
    `).join('');
  }

  // Photography
  const photoNote = document.getElementById('photo-note');
  if (photoNote) photoNote.textContent = data.photography.sectionNote;

  const coverflowTrack = document.getElementById('coverflow-track');
  if (coverflowTrack && data.photography.tiles) {
    initCoverflow(data.photography.tiles);
  }

  // Media
  const mediaSection = document.getElementById('media');
  const mediaNote = document.getElementById('media-note');
  const mediaGrid = document.getElementById('media-grid');
  
  if (mediaSection && data.media && data.media.items && data.media.items.length > 0) {
    mediaSection.style.display = 'block'; // Make it visible
    if (mediaNote) mediaNote.textContent = data.media.sectionNote;
    
    mediaGrid.innerHTML = data.media.items.map((item, idx) => {
      const extractUrl = (str) => {
        if (!str) return '';
        const match = str.match(/src="([^"]+)"/);
        return match ? match[1] : str;
      };
      
      const cleanUrl = extractUrl(item.url);
      
      let embedHtml = '';
      if (item.type === 'youtube') {
        embedHtml = `<iframe width="100%" height="100%" src="${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}autoplay=1" title="${item.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;"></iframe>`;
      } else if (item.type === 'facebook') {
        embedHtml = `<iframe src="${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}autoplay=1" width="100%" height="100%" style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;overflow:hidden;" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>`;
      }
      
      const expandBtnHtml = `
        <div style="position:absolute; top:12px; right:12px; z-index:20; background:rgba(0,0,0,0.6); color:#fff; border-radius:4px; padding:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); transition:background 0.3s;" onmouseover="this.style.background='var(--c-accent)'" onmouseout="this.style.background='rgba(0,0,0,0.6)'" onclick="event.stopPropagation(); openLightbox('video', ${idx})" title="View Full Page">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
        </div>
      `;

      let containerHtml = '';
      if (item.thumbnail && item.thumbnail.trim() !== '') {
        // Thumbnail with play button (plays inline) + Expand button (opens lightbox)
        containerHtml = `
          <div class="media-embed-container" style="position:relative; width:100%; aspect-ratio:16/9; background:#111; border-radius:8px; overflow:hidden; cursor:pointer;">
            ${expandBtnHtml}
            <div onclick="this.parentElement.innerHTML='${embedHtml.replace(/'/g, "\\'")}'" style="position:absolute; inset:0; z-index:10;">
              <img src="${item.thumbnail}" style="width:100%; height:100%; object-fit:cover; opacity:0.85; transition: opacity 0.3s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.85">
              <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); width:64px; height:64px; background:rgba(255,255,255,0.15); border-radius:50%; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                <div style="width: 0; height: 0; border-top: 12px solid transparent; border-bottom: 12px solid transparent; border-left: 18px solid white; margin-left:6px;"></div>
              </div>
            </div>
          </div>
        `;
      } else {
        // Direct iframe (plays inline natively) + Expand button (opens lightbox)
        containerHtml = `
          <div style="position:relative; width:100%; aspect-ratio:16/9; background:#111; border-radius:8px; overflow:hidden;">
            ${expandBtnHtml}
            ${embedHtml.replace('?autoplay=1', '').replace('&autoplay=1', '')}
          </div>
        `;
      }

      return `<div class="media-card fade-up delay-${(idx%3)+1}">
        <h3 style="font-family:var(--display); font-size:16px; margin-bottom:12px; color:var(--text-main);">${item.title}</h3>
        ${containerHtml}
      </div>`;
    }).join('');
  }

  // Genres
  const genresSection = document.getElementById('genres-section');
  if (genresSection && data.genres) {
    genresSection.innerHTML = data.genres.map(genre => `
      <div class="genre-cell">
        <span class="genre-num">${genre.num}</span>
        <div>
          <div class="genre-name">${genre.name}</div>
          <p class="genre-desc">${genre.desc}</p>
        </div>
      </div>
    `).join('');
  }

  // Custom Sections
  const customContainer = document.getElementById('custom-sections-container');
  if (customContainer && data.customSections && data.customSections.length > 0) {
    customContainer.innerHTML = data.customSections.map(sec => `
      <section id="${sec.id || 'custom'}" class="${sec.theme || 'bg-white'} has-edge">
        <div class="wrap">
          <div class="section-head fade-up">
            <div>
              <span class="eyebrow">${sec.title || 'Custom Section'}</span>
              <h2 style="display:none;">${sec.title}</h2>
            </div>
          </div>
          <div class="fade-up delay-1 custom-content-block">
            ${sec.contentHtml || ''}
          </div>
        </div>
      </section>
    `).join('');
  }

  // Contact
  const contactEyebrow = document.getElementById('contact-eyebrow');
  if (contactEyebrow) contactEyebrow.textContent = data.contact.eyebrow;

  const contactHeading = document.getElementById('contact-heading');
  if (contactHeading) {
    contactHeading.innerHTML = `${data.contact.headingBefore}<br><strong>${data.contact.headingStrong}</strong>`;
  }

  const contactEmail = document.getElementById('contact-email');
  if (contactEmail) {
    contactEmail.href = `mailto:${data.contact.email}`;
    contactEmail.textContent = data.contact.email;
  }

  const contactLinks = document.getElementById('contact-links');
  if (contactLinks) {
    contactLinks.innerHTML = `
      <a href="tel:${data.contact.phone.replace(/[^0-9+]/g, '')}">${data.contact.phoneDisplay}</a>
      <a href="${data.contact.linkedin}" target="_blank" rel="noopener">${data.contact.linkedinDisplay}</a>
      <a href="${data.contact.instagram}" target="_blank" rel="noopener">${data.contact.instagramDisplay}</a>
    `;
  }

  // Footer
  const footerCopy = document.getElementById('footer-copy');
  if (footerCopy) footerCopy.textContent = data.footer.copyright;

  const footerLoc = document.getElementById('footer-loc');
  if (footerLoc) footerLoc.textContent = data.footer.location;

  window.siteData = data;
}

// ---------- Lightbox Logic ----------
window.openLightbox = function(type, idx) {
  if (!window.siteData) return;
  const lb = document.getElementById('site-lightbox');
  const lbMedia = document.getElementById('lightbox-media');
  const lbTitle = document.getElementById('lightbox-title');
  const lbMeta = document.getElementById('lightbox-meta');
  
  if (!lb || !lbMedia) return;
  
  lbMedia.innerHTML = '';
  lbTitle.textContent = '';
  lbMeta.textContent = '';
  
  if (type === 'photo') {
    const p = window.siteData.photography.tiles[idx];
    if (p) {
      lbMedia.innerHTML = `<img src="${p.src}" alt="${p.alt}">`;
      lbTitle.textContent = p.location || p.category;
      lbMeta.textContent = `${p.category} | ${p.aperture}`;
    }
  } else if (type === 'video') {
    const v = window.siteData.media.items[idx];
    if (v) {
      const extractUrl = (str) => {
        if (!str) return '';
        const match = str.match(/src="([^"]+)"/);
        return match ? match[1] : str;
      };
      const cleanUrl = extractUrl(v.url);
      
      if (v.type === 'youtube') {
        lbMedia.innerHTML = `<iframe src="${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}autoplay=1" frameborder="0" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>`;
      } else {
        lbMedia.innerHTML = `<iframe src="${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}autoplay=1" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>`;
      }
      lbTitle.textContent = v.title;
      lbMeta.textContent = v.type;
    }
  } else if (type === 'project') {
    const proj = window.siteData.projects.items[idx];
    if (proj) {
      lb.classList.add('gridx-project-mode');
      lbMedia.innerHTML = `
        <div class="gridx-proj-detail">
          <h5 class="gridx-proj-det-eyebrow">${proj.category} - ${proj.client}</h5>
          <h2 class="gridx-proj-det-title">AESTHETIC DESIGN FOR <br>${proj.name}</h2>
          
          <img src="${proj.thumbnail}" class="gridx-proj-det-hero" alt="${proj.name}">
          
          <div class="gridx-proj-det-split">
            <div class="gridx-proj-det-meta">
              <p><span>Year</span><br><b>${proj.year || '2023'}</b></p>
              <p><span>Client</span><br><b>${proj.client || '-'}</b></p>
              <p><span>Services</span><br><b>${proj.services || '-'}</b></p>
              <p><span>Project</span><br><b>${proj.name}</b></p>
            </div>
            <div class="gridx-proj-det-desc">
              <h4>DESCRIPTION</h4>
              <p>${proj.longDescription || proj.description}</p>
            </div>
          </div>
          
          <div class="gridx-proj-det-gallery">
            ${(proj.gallery || []).map(g => `<img src="${g}" alt="Gallery image">`).join('')}
          </div>
          
          <div style="text-align:center; margin-top: 80px;">
            <button class="btn gridx-btn-solid" onclick="document.getElementById('lightbox-close').click()" style="padding: 16px 40px; font-size:16px;">Close Project</button>
          </div>
        </div>
      `;
    }
  }
  
  lb.classList.add('active');
  document.body.style.overflow = 'hidden'; // prevent background scroll
};

document.addEventListener('DOMContentLoaded', () => {
  const lb = document.getElementById('site-lightbox');
  const closeBtn = document.getElementById('lightbox-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      lb.classList.remove('active');
      lb.classList.remove('gridx-project-mode');
      document.body.style.overflow = '';
      document.getElementById('lightbox-media').innerHTML = ''; // stop video playback
    });
  }
  if (lb) {
    lb.addEventListener('click', (e) => {
      if (e.target === lb || e.target.classList.contains('lightbox-content') || e.target.id === 'lightbox-media') {
        lb.classList.remove('active');
        lb.classList.remove('gridx-project-mode');
        document.body.style.overflow = '';
        document.getElementById('lightbox-media').innerHTML = '';
      }
    });
  }
});

// ── 3D COVERFLOW LOGIC ──
let coverflowPhotos = [];
let coverflowIndex = 0;

window.initCoverflow = function(photos) {
  coverflowPhotos = photos;
  coverflowIndex = Math.floor(photos.length / 2); // Start in middle
  renderCoverflowDOM();
  updateCoverflowTransform();
};

window.applyCoverflowFilter = function(filter) {
  if (!window.siteData || !window.siteData.photography.tiles) return;
  const allPhotos = window.siteData.photography.tiles;
  if (filter === 'all') {
    coverflowPhotos = allPhotos;
  } else {
    coverflowPhotos = allPhotos.filter(p => p.category === filter);
  }
  coverflowIndex = Math.floor(coverflowPhotos.length / 2);
  renderCoverflowDOM();
  updateCoverflowTransform();
};

function renderCoverflowDOM() {
  const track = document.getElementById('coverflow-track');
  const dotsContainer = document.getElementById('coverflow-dots');
  if (!track || !dotsContainer) return;
  
  track.innerHTML = '';
  dotsContainer.innerHTML = '';
  
  coverflowPhotos.forEach((photo, idx) => {
    const globalIdx = window.siteData.photography.tiles.indexOf(photo);
    
    const card = document.createElement('div');
    card.className = 'coverflow-card';
    card.onclick = () => handleCoverflowClick(idx, globalIdx);
    
    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.alt;
    img.loading = 'lazy';
    
    card.appendChild(img);
    track.appendChild(card);
    
    const dot = document.createElement('div');
    dot.className = 'coverflow-dot';
    dot.onclick = () => { coverflowIndex = idx; updateCoverflowTransform(); };
    dotsContainer.appendChild(dot);
  });
}

function handleCoverflowClick(localIdx, globalIdx) {
  if (localIdx === coverflowIndex) {
    openLightbox('photo', globalIdx);
  } else {
    coverflowIndex = localIdx;
    updateCoverflowTransform();
  }
}

function updateCoverflowTransform() {
  const track = document.getElementById('coverflow-track');
  const dotsContainer = document.getElementById('coverflow-dots');
  const titleEl = document.getElementById('coverflow-title');
  const subEl = document.getElementById('coverflow-sub');
  
  if (!track || coverflowPhotos.length === 0) return;
  
  const cards = track.children;
  const dots = dotsContainer.children;
  
  const activePhoto = coverflowPhotos[coverflowIndex];
  if (titleEl) titleEl.textContent = activePhoto.alt || 'Photography';
  if (subEl) subEl.textContent = (activePhoto.location || '') + (activePhoto.location && activePhoto.aperture ? ' | ' : '') + (activePhoto.aperture || '');

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const dot = dots[i];
    
    const offset = i - coverflowIndex;
    const absOffset = Math.abs(offset);
    
    let tx = offset * 220; // Distance between cards
    let tz = absOffset === 0 ? 0 : -300 - (absOffset * 50); // Push back side cards
    let ry = offset === 0 ? 0 : (offset > 0 ? -55 : 55); // Rotate towards center
    let zIndex = 100 - absOffset;
    let opacity = absOffset === 0 ? 1 : 1 - (absOffset * 0.15);
    
    card.style.transform = `translate(-50%, -50%) translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg)`;
    card.style.zIndex = zIndex;
    card.style.opacity = Math.max(opacity, 0);
    
    if (absOffset === 0) {
      card.classList.add('active');
      if (dot) dot.classList.add('active');
    } else {
      card.classList.remove('active');
      if (dot) dot.classList.remove('active');
    }
  }
}

// Bind arrows
document.addEventListener('DOMContentLoaded', () => {
  const prev = document.getElementById('coverflow-prev');
  const next = document.getElementById('coverflow-next');
  if (prev) {
    prev.addEventListener('click', () => {
      if (coverflowPhotos.length === 0) return;
      coverflowIndex = (coverflowIndex - 1 + coverflowPhotos.length) % coverflowPhotos.length;
      updateCoverflowTransform();
    });
  }
  if (next) {
    next.addEventListener('click', () => {
      if (coverflowPhotos.length === 0) return;
      coverflowIndex = (coverflowIndex + 1) % coverflowPhotos.length;
      updateCoverflowTransform();
    });
  }
});
