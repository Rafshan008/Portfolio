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
  // Helper for crisp vector social icons
  const getSocialIconSvg = (name) => {
    const n = (name || '').toLowerCase();
    if (n.includes('linkedin')) {
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.6 1.6 0 0 0-1.6 1.6 1.6 1.6 0 0 0 1.6 1.6 1.6 1.6 0 0 0-1.6-1.6Z"/></svg>`;
    }
    if (n.includes('github')) {
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z"/></svg>`;
    }
    if (n.includes('facebook')) {
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/></svg>`;
    }
    if (n.includes('instagram')) {
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`;
    }
    if (n.includes('flickr')) {
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="7" cy="12" r="5"/><circle cx="17" cy="12" r="5" fill-opacity="0.75"/></svg>`;
    }
    if (n.includes('twitter') || n.includes(' x') || n === 'x') {
      return `<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;
    }
    if (n.includes('youtube')) {
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`;
    }
    return `<span style="font-family:var(--mono); font-weight:700; font-size:12px;">${(name || 'S')[0].toUpperCase()}</span>`;
  };

  // ── GRIDX ABOUT SECTION ──
  const sidebar = document.getElementById('gridx-sidebar');
  const content = document.getElementById('gridx-content');
  if (sidebar && data.profile) {
    sidebar.innerHTML = `
      <div class="gridx-profile-card">
        <div class="gridx-avatar">
          <img src="${data.profile.avatar || ''}" alt="Avatar">
          <span class="avatar-badge" title="Systems Engineer &amp; Photographer">✓</span>
        </div>
        <h3 class="gridx-name">${data.meta.title.split('—')[0].trim()}</h3>
        <p class="gridx-handle">${data.profile.handle || ''}</p>
        <div class="gridx-role-pill">SYS / NETWORK EXEC · BRACNET</div>
        <div class="gridx-socials">
          ${(data.profile.socials || []).map(s => `
            <a href="${s.url}" title="${s.name}" class="social-icon" target="_blank" rel="noopener">
              ${s.logo ? `<img src="${s.logo}" alt="${s.name}" class="social-logo-img">` : getSocialIconSvg(s.name)}
            </a>
          `).join('')}
        </div>
        <div class="gridx-profile-actions">
          <a href="#contact" class="btn gridx-btn-solid">Get In Touch</a>
          <a href="mailto:rafshan50-008@diu.edu.bd?subject=CV%20Request%20-%20Rafshan%20Ekhowan" class="btn gridx-btn-ghost">Request Full CV</a>
        </div>
      </div>
    `;
  }

  if (content && data.profile) {
    let aboutHtml = `
      <div class="gridx-block">
        <h4 class="gridx-block-title">PROFILE &amp; OVERVIEW</h4>
        ${data.profile.paragraphs.map(p => `<p class="gridx-p">${p}</p>`).join('')}
      </div>
    `;

    if (data.experience && data.experience.timeline && data.experience.timeline.length > 0) {
      aboutHtml += `
        <div class="gridx-block">
          <h4 class="gridx-block-title">PRODUCTION EXPERIENCE</h4>
          <div class="gridx-timeline">
            ${data.experience.timeline.map(item => `
              <div class="gridx-tl-item">
                <div class="gridx-tl-dot"></div>
                <div class="gridx-tl-date">${item.date}</div>
                <div class="gridx-tl-role">${item.role}</div>
                <div class="gridx-tl-org">${item.org}</div>
                <ul class="gridx-tl-bullets">
                  ${(item.bullets || []).map(b => `<li>${b}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (data.profile.education && data.profile.education.length > 0) {
      aboutHtml += `
        <div class="gridx-block">
          <h4 class="gridx-block-title">EDUCATION &amp; ACADEMICS</h4>
          <div class="gridx-timeline">
            ${data.profile.education.map(item => `
              <div class="gridx-tl-item">
                <div class="gridx-tl-dot"></div>
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
          <h4 class="gridx-block-title">TECHNICAL COMPETENCIES &amp; TOOLING</h4>
          <div class="gridx-skills-container">
            ${data.skills.columns.map(col => `
              <div class="gridx-skills-group">
                <div class="gridx-skill-group-title">${col.heading}</div>
                <div class="gridx-skills-pill-row">
                  ${col.tags.map(t => `<span class="gridx-skill-pill"><span class="skill-dot"></span>${t}</span>`).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (data.profile.awards && data.profile.awards.length > 0) {
      aboutHtml += `
        <div class="gridx-block">
          <h4 class="gridx-block-title">HONORS &amp; AWARDS</h4>
          <div class="gridx-timeline">
            ${data.profile.awards.map(item => `
              <div class="gridx-tl-item">
                <div class="gridx-tl-dot"></div>
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

  // ── EXPERIENCE SECTION (HOMEPAGE) ──
  const expTimeline = document.getElementById('exp-timeline');
  const expNote = document.getElementById('exp-note');
  if (expNote && data.experience) expNote.textContent = data.experience.sectionNote;
  if (expTimeline && data.experience && data.experience.timeline) {
    expTimeline.innerHTML = data.experience.timeline.map((item, idx) => `
      <div class="tl-item fade-up delay-${(idx % 3) + 1}">
        <div class="tl-date-col">
          <span class="tl-date-badge">${item.date}</span>
        </div>
        <div class="tl-body">
          <div class="tl-role">${item.role}</div>
          <div class="tl-org"><span class="org-dot"></span>${item.org}</div>
          <ul class="tl-bullets">
            ${(item.bullets || []).map(b => `<li>${b}</li>`).join('')}
          </ul>
        </div>
      </div>
    `).join('');
  }

  // ── GRIDX PROJECTS ──
  const projGrid = document.getElementById('proj-grid');
  if (projGrid && data.projects.items) {
    projGrid.innerHTML = data.projects.items.map((proj, idx) => `
      <div class="gridx-proj-card" data-category="${proj.category}" onclick="openLightbox('project', ${idx})">
        <div class="gridx-proj-img-wrap">
          <img src="${proj.thumbnail || '/uploads/project-ippbx.svg'}" alt="${proj.name}" loading="lazy">
          <span class="gridx-proj-year">${proj.year || '2024'}</span>
        </div>
        <div class="gridx-proj-meta">
          <div class="gridx-proj-cat-badge">${proj.category || 'PROJECT'}</div>
          <div class="gridx-proj-title">${proj.name}</div>
          <p class="gridx-proj-sub">${proj.description || ''}</p>
          <div class="gridx-proj-tags">
            ${(proj.tags || []).slice(0, 3).map(tag => `<span class="proj-tag-chip">${tag}</span>`).join('')}
          </div>
        </div>
        <div class="gridx-proj-icon" title="View Case Study">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </div>
      </div>
    `).join('');

    // Initialize filter buttons if available
    if (typeof initProjectFilters === 'function') {
      initProjectFilters();
    }
  }

  // Initialize mobile drawer and clipboard copy
  if (typeof initMobileDrawer === 'function') initMobileDrawer();
  if (typeof initClipboardCopy === 'function') initClipboardCopy();

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
  if (contactLinks && data.contact) {
    let linksHtml = '';
    
    // Phone Link
    if (data.contact.phoneDisplay) {
      const phoneClean = (data.contact.phone || '').replace(/[^0-9+]/g, '');
      const logo = data.contact.phoneLogo;
      linksHtml += `
        <a href="tel:${phoneClean}">
          <span class="contact-link-left">
            ${logo ? `<img src="${logo}" class="contact-link-logo" alt="Phone">` : ''}
            <span>${data.contact.phoneDisplay}</span>
          </span>
          <span class="contact-link-arrow">↗</span>
        </a>
      `;
    }
    
    // LinkedIn Link
    if (data.contact.linkedinDisplay) {
      const logo = data.contact.linkedinLogo;
      linksHtml += `
        <a href="${data.contact.linkedin || '#'}" target="_blank" rel="noopener">
          <span class="contact-link-left">
            ${logo ? `<img src="${logo}" class="contact-link-logo" alt="${data.contact.linkedinDisplay}">` : ''}
            <span>${data.contact.linkedinDisplay}</span>
          </span>
          <span class="contact-link-arrow">↗</span>
        </a>
      `;
    }
    
    // Instagram / Social 2 Link
    if (data.contact.instagramDisplay) {
      const logo = data.contact.instagramLogo;
      linksHtml += `
        <a href="${data.contact.instagram || '#'}" target="_blank" rel="noopener">
          <span class="contact-link-left">
            ${logo ? `<img src="${logo}" class="contact-link-logo" alt="${data.contact.instagramDisplay}">` : ''}
            <span>${data.contact.instagramDisplay}</span>
          </span>
          <span class="contact-link-arrow">↗</span>
        </a>
      `;
    }

    // Additional Contact Socials (if configured)
    if (Array.isArray(data.contact.socials)) {
      data.contact.socials.forEach(s => {
        if (!s.name && !s.url) return;
        linksHtml += `
          <a href="${s.url || '#'}" target="_blank" rel="noopener">
            <span class="contact-link-left">
              ${s.logo ? `<img src="${s.logo}" class="contact-link-logo" alt="${s.name}">` : ''}
              <span>${s.name}</span>
            </span>
            <span class="contact-link-arrow">↗</span>
          </a>
        `;
      });
    }

    contactLinks.innerHTML = linksHtml;
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
          <div class="gridx-proj-det-header">
            <h5 class="gridx-proj-det-eyebrow">${proj.category} // ${proj.client || 'BRACNet'}</h5>
            <h2 class="gridx-proj-det-title">${proj.name}</h2>
          </div>
          
          <img src="${proj.thumbnail}" class="gridx-proj-det-hero" alt="${proj.name}">
          
          <div class="gridx-proj-det-split">
            <div class="gridx-proj-det-meta">
              <p><span>Year</span><br><b>${proj.year || '2024'}</b></p>
              <p><span>Client / Org</span><br><b>${proj.client || 'BRACNet'}</b></p>
              <p><span>Services</span><br><b>${proj.services || 'Systems & Network'}</b></p>
              <p><span>Category</span><br><b>${proj.category}</b></p>
            </div>
            <div class="gridx-proj-det-desc">
              <h4>SYSTEM OVERVIEW &amp; ARCHITECTURE</h4>
              <p>${proj.longDescription || proj.description}</p>
              <div class="gridx-proj-modal-tags">
                ${(proj.tags || []).map(t => `<span class="proj-tag-chip">${t}</span>`).join('')}
              </div>
            </div>
          </div>
          
          <div style="text-align:center; margin-top: 36px; padding-bottom: 20px;">
            <button class="btn solid" onclick="window.closeLightbox()" style="padding: 12px 36px; font-size: 13px;">Close Case Study</button>
          </div>
        </div>
      `;
    }
  }
  
  if (window.lenis && typeof window.lenis.stop === 'function') {
    window.lenis.stop();
  }
  lb.setAttribute('data-lenis-prevent', 'true');
  lb.classList.add('active');
  const lbContent = lb.querySelector('.lightbox-content');
  if (lbContent) {
    lbContent.setAttribute('data-lenis-prevent', 'true');
    lbContent.scrollTop = 0;
    if (typeof lbContent.scrollTo === 'function') {
      lbContent.scrollTo({ top: 0, behavior: 'instant' });
    }
  }
  document.body.style.overflow = 'hidden'; // prevent background scroll
};

window.closeLightbox = function() {
  const lb = document.getElementById('site-lightbox');
  if (!lb) return;
  lb.classList.remove('active');
  lb.classList.remove('gridx-project-mode');
  lb.removeAttribute('data-lenis-prevent');
  const lbContent = lb.querySelector('.lightbox-content');
  if (lbContent) lbContent.removeAttribute('data-lenis-prevent');
  document.body.style.overflow = '';
  const lbMedia = document.getElementById('lightbox-media');
  if (lbMedia) lbMedia.innerHTML = ''; // stop video playback
  if (window.lenis && typeof window.lenis.start === 'function') {
    window.lenis.start();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const lb = document.getElementById('site-lightbox');
  const closeBtn = document.getElementById('lightbox-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', window.closeLightbox);
  }
  if (lb) {
    // Direct wheel routing inside modal so cursor anywhere smoothly scrolls the card
    if (!lb._wheelBound) {
      lb.addEventListener('wheel', (e) => {
        if (lb.classList.contains('active')) {
          const c = lb.querySelector('.lightbox-content');
          if (c && c.scrollHeight > c.clientHeight) {
            let delta = e.deltaY;
            if (e.deltaMode === 1) delta *= 33;
            else if (e.deltaMode === 2) delta *= c.clientHeight;
            c.scrollTop += delta;
            e.preventDefault();
            e.stopPropagation();
          }
        }
      }, { passive: false });
      lb._wheelBound = true;
    }

    lb.addEventListener('click', (e) => {
      // In project mode, only close when clicking the backdrop overlay itself
      if (lb.classList.contains('gridx-project-mode')) {
        if (e.target === lb) {
          window.closeLightbox();
        }
      } else {
        if (e.target === lb || e.target.classList.contains('lightbox-content') || e.target.id === 'lightbox-media') {
          window.closeLightbox();
        }
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

// ── 4. Project Category Filtering ───────────────────────
window.initProjectFilters = function() {
  const filterBtns = document.querySelectorAll('.proj-filter-btn');
  const cards = document.querySelectorAll('.gridx-proj-card');
  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = (btn.dataset.projFilter || 'all').toUpperCase();

      cards.forEach(card => {
        const cat = (card.dataset.category || '').toUpperCase();
        const match = (filter === 'ALL' || cat === filter);
        if (match) {
          card.style.display = 'flex';
          if (window.gsap) {
            gsap.fromTo(card, { opacity: 0, scale: 0.95, y: 15 }, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power2.out' });
          } else {
            card.style.opacity = '1';
          }
        } else {
          card.style.display = 'none';
        }
      });
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    });
  });
};

// ── 5. Mobile Navigation Drawer ─────────────────────────
window.initMobileDrawer = function() {
  const burger = document.getElementById('navBurger');
  const drawer = document.getElementById('mobileDrawer');
  const close = document.getElementById('drawerClose');
  const links = document.querySelectorAll('.drawer-link');

  if (!burger || !drawer) return;

  function openDrawer() {
    drawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('active');
    document.body.style.overflow = '';
  }

  burger.onclick = openDrawer;
  if (close) close.onclick = closeDrawer;
  links.forEach(l => l.addEventListener('click', closeDrawer));
};

// ── 6. 1-Click Clipboard Copy with Feedback ─────────────
window.initClipboardCopy = function() {
  const toast = document.getElementById('siteToast');
  function triggerToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2600);
  }

  const copyEmailBtn = document.getElementById('copyEmailBtn');
  if (copyEmailBtn) {
    copyEmailBtn.onclick = (e) => {
      e.preventDefault();
      const email = document.getElementById('contact-email')?.textContent || 'rafshan50-008@diu.edu.bd';
      navigator.clipboard.writeText(email).then(() => {
        triggerToast('Email copied to clipboard!');
      }).catch(() => {
        triggerToast('Email: ' + email);
      });
    };
  }
};

// Bind arrows and keyboard / wheel / touch navigation
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

  // Keyboard navigation for coverflow & lightbox
  document.addEventListener('keydown', (e) => {
    const lb = document.getElementById('site-lightbox');
    if (lb && lb.classList.contains('active')) {
      if (e.key === 'Escape') {
        if (typeof window.closeLightbox === 'function') window.closeLightbox();
        return;
      }
      const c = lb.querySelector('.lightbox-content');
      if (c && c.scrollHeight > c.clientHeight) {
        if (e.key === 'ArrowDown') {
          c.scrollTop += 60;
          e.preventDefault();
        } else if (e.key === 'ArrowUp') {
          c.scrollTop -= 60;
          e.preventDefault();
        } else if (e.key === 'PageDown' || e.key === ' ') {
          c.scrollTop += c.clientHeight * 0.8;
          e.preventDefault();
        } else if (e.key === 'PageUp') {
          c.scrollTop -= c.clientHeight * 0.8;
          e.preventDefault();
        }
      }
      return;
    }
    
    // Only scroll if work section is in or near viewport or coverflow is active
    if (e.key === 'ArrowLeft') {
      const prevBtn = document.getElementById('coverflow-prev');
      if (prevBtn) prevBtn.click();
    } else if (e.key === 'ArrowRight') {
      const nextBtn = document.getElementById('coverflow-next');
      if (nextBtn) nextBtn.click();
    }
  });

  // Wheel scrub over coverflow viewport
  const coverflowViewport = document.querySelector('.coverflow-viewport');
  if (coverflowViewport) {
    let wheelTimeout = null;
    coverflowViewport.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaX) > 25 || Math.abs(e.deltaY) > 35) {
        if (!wheelTimeout) {
          wheelTimeout = setTimeout(() => { wheelTimeout = null; }, 140);
          if (e.deltaX > 0 || e.deltaY > 0) {
            document.getElementById('coverflow-next')?.click();
          } else {
            document.getElementById('coverflow-prev')?.click();
          }
        }
      }
    }, { passive: true });

    // Touch swipe gestures
    let touchStartX = 0;
    let touchEndX = 0;
    coverflowViewport.addEventListener('touchstart', (e) => {
      if (e.changedTouches && e.changedTouches.length > 0) {
        touchStartX = e.changedTouches[0].screenX;
      }
    }, { passive: true });
    
    coverflowViewport.addEventListener('touchend', (e) => {
      if (e.changedTouches && e.changedTouches.length > 0) {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 40) {
          if (diff > 0) {
            document.getElementById('coverflow-next')?.click();
          } else {
            document.getElementById('coverflow-prev')?.click();
          }
        }
      }
    }, { passive: true });
  }
});
