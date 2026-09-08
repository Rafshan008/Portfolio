let siteData = {};
let currentSection = 'meta';
let adminToken = localStorage.getItem('adminToken');

document.addEventListener('DOMContentLoaded', () => {
  if (adminToken) {
    showScreen('dashboard-screen');
    fetchData();
  } else {
    showScreen('login-screen');
  }

  setupEventListeners();
});

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function showToast(msg, isError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.backgroundColor = isError ? '#ff6b6b' : 'var(--c-accent)';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// --- API Calls ---

async function login(password) {
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (data.success) {
      adminToken = data.token;
      localStorage.setItem('adminToken', adminToken);
      showScreen('dashboard-screen');
      fetchData();
    } else {
      document.getElementById('login-error').textContent = data.error || 'Login failed';
    }
  } catch (e) {
    document.getElementById('login-error').textContent = 'Server error';
  }
}

async function fetchData() {
  try {
    const res = await fetch('/api/data?t=' + Date.now());
    siteData = await res.json();
    renderEditor();
  } catch (e) {
    showToast('Failed to load data', true);
  }
}

async function saveData() {
  try {
    // First, collect current form data before saving
    collectFormData();
    
    const res = await fetch('/api/data', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': adminToken
      },
      body: JSON.stringify(siteData)
    });
    if (res.ok) {
      showToast('Saved successfully!');
    } else if (res.status === 401) {
      logout();
    } else {
      const err = await res.json();
      showToast(err.error || 'Save failed', true);
    }
  } catch (e) {
    showToast('Server error while saving', true);
  }
}

async function changePassword(newPassword) {
  try {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': adminToken
      },
      body: JSON.stringify({ newPassword })
    });
    if (res.ok) {
      const data = await res.json();
      adminToken = data.token;
      localStorage.setItem('adminToken', adminToken);
      showToast('Password updated');
      document.getElementById('new-pwd').value = '';
    } else {
      const err = await res.json();
      showToast(err.error || 'Update failed', true);
    }
  } catch(e) {
    showToast('Server error', true);
  }
}

function logout() {
  adminToken = null;
  localStorage.removeItem('adminToken');
  showScreen('login-screen');
}

// --- Event Listeners ---

function setupEventListeners() {
  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    login(document.getElementById('password').value);
  });

  document.getElementById('logout-btn').addEventListener('click', logout);

  document.getElementById('save-all').addEventListener('click', saveData);

  document.getElementById('export-json').addEventListener('click', () => {
    collectFormData(); // Make sure latest edits are included
    const blob = new Blob([JSON.stringify(siteData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rafshan-web-data.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('admin-nav').addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      e.preventDefault();
      // Save current section data to memory before switching
      collectFormData();
      
      document.querySelectorAll('#admin-nav a').forEach(a => a.classList.remove('active'));
      e.target.classList.add('active');
      
      currentSection = e.target.dataset.section;
      document.getElementById('current-section-title').textContent = e.target.textContent;
      renderEditor();
    }
  });
}

// --- Dynamic Form Rendering ---

function renderEditor() {
  const container = document.getElementById('editor-container');
  container.innerHTML = ''; // Clear
  
  if (!siteData) return;

  switch (currentSection) {
    case 'meta':
      container.innerHTML = `
        <div class="form-group">
          <label>Site Title</label>
          <input type="text" id="meta-title" value="${esc(siteData.meta.title)}">
        </div>
        <div class="form-group">
          <label>Meta Description</label>
          <textarea id="meta-desc">${esc(siteData.meta.description)}</textarea>
        </div>
      `;
      break;
      
    case 'hero':
      container.innerHTML = `
        <div class="form-group"><label>Eyebrow Text</label><input type="text" id="hero-eyebrow" value="${esc(siteData.hero.eyebrow)}"></div>
        <div class="form-row">
          <div class="form-group"><label>Title Line 1</label><input type="text" id="hero-t1" value="${esc(siteData.hero.titleLine1)}"></div>
          <div class="form-group"><label>Title Line 2</label><input type="text" id="hero-t2" value="${esc(siteData.hero.titleLine2)}"></div>
        </div>
        <div class="form-group"><label>Subtitle</label><textarea id="hero-sub">${esc(siteData.hero.subtitle)}</textarea></div>
        <div class="form-row">
          <div class="form-group"><label>Primary CTA Label</label><input type="text" id="hero-cta1-lbl" value="${esc(siteData.hero.ctaPrimary.label)}"></div>
          <div class="form-group"><label>Primary CTA Link</label><input type="text" id="hero-cta1-href" value="${esc(siteData.hero.ctaPrimary.href)}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Secondary CTA Label</label><input type="text" id="hero-cta2-lbl" value="${esc(siteData.hero.ctaSecondary.label)}"></div>
          <div class="form-group"><label>Secondary CTA Link</label><input type="text" id="hero-cta2-href" value="${esc(siteData.hero.ctaSecondary.href)}"></div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Hero Image URL</label>
            <input type="text" id="hero-img-src" value="${esc(siteData.hero.image.src)}">
            <label style="margin-top: 10px;">Or Upload Image</label>
            <input type="file" id="hero-img-upload" accept="image/*" onchange="handleFileUpload(this, 'hero-img-src')">
          </div>
          <div class="form-group"><label>Hero Image Alt</label><input type="text" id="hero-img-alt" value="${esc(siteData.hero.image.alt)}"></div>
        </div>
      `;
      break;

    case 'profile':
      container.innerHTML = `
        <div class="form-group"><label>Section Note (Top right)</label><textarea id="prof-note">${esc(siteData.profile.sectionNote || '')}</textarea></div>
        <div class="form-group"><label>Lead Text (Large font)</label><textarea id="prof-lead">${esc(siteData.profile.lead || '')}</textarea></div>
        <div class="form-row">
          <div class="form-group">
            <label>Avatar URL</label>
            <input type="text" id="prof-avatar" value="${esc(siteData.profile.avatar || '')}">
            <label style="margin-top: 10px;">Or Upload</label>
            <input type="file" accept="image/*" onchange="handleFileUpload(this, 'prof-avatar')">
          </div>
          <div class="form-group"><label>Handle (@username)</label><input type="text" id="prof-handle" value="${esc(siteData.profile.handle || '')}"></div>
        </div>
        <div class="form-group"><label>Paragraph 1</label><textarea id="prof-p0">${esc(siteData.profile.paragraphs?.[0] || '')}</textarea></div>
        <div class="form-group"><label>Paragraph 2</label><textarea id="prof-p1">${esc(siteData.profile.paragraphs?.[1] || '')}</textarea></div>
        
        <h3 style="margin-top:32px; border-bottom:1px solid #333; padding-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
          <span>Social Links (Profile)</span>
          <span style="font-size:12px; font-weight:normal; color:var(--text-muted);">Custom PNG logos are optional</span>
        </h3>
        <div id="prof-socials-list">
          ${(siteData.profile.socials || []).map((s, idx) => `
            <div class="item-card social-card social-row" data-idx="${idx}" style="margin-top:16px; padding:18px;">
              <div class="card-header" style="margin-bottom:14px; padding-bottom:8px;">
                <h4 style="font-size:14px; margin:0;">${esc(s.name || `Social Link #${idx + 1}`)}</h4>
                <button class="btn danger btn-del-soc" data-idx="${idx}" style="padding:6px 14px; font-size:11px;">Delete</button>
              </div>
              <div class="form-row">
                <div class="form-group" style="flex:1;">
                  <label>Platform Name</label>
                  <input type="text" class="soc-name" value="${esc(s.name || '')}" placeholder="e.g. LinkedIn, Facebook, Instagram">
                </div>
                <div class="form-group" style="flex:2;">
                  <label>Profile / Channel URL</label>
                  <input type="text" class="soc-url" value="${esc(s.url || '')}" placeholder="https://...">
                </div>
              </div>
              <div class="form-row" style="align-items:flex-end;">
                <div class="form-group" style="flex:2;">
                  <label>Custom PNG Logo URL (Optional)</label>
                  <input type="text" class="soc-logo" id="soc-logo-${idx}" value="${esc(s.logo || '')}" placeholder="Optional: /uploads/... or image URL" oninput="updateLogoPreview('soc-logo-${idx}', 'preview-soc-logo-${idx}')">
                </div>
                <div class="form-group" style="flex:1.2;">
                  <label>Or Upload PNG Logo</label>
                  <input type="file" accept="image/png,image/*" onchange="handleFileUpload(this, 'soc-logo-${idx}')">
                </div>
                <div class="form-group" style="flex:0 0 64px; text-align:center;">
                  <label>Preview</label>
                  <div id="preview-soc-logo-${idx}" class="admin-logo-preview-box">
                    ${s.logo ? `<img src="${s.logo}" alt="Logo" style="max-width:28px; max-height:28px; object-fit:contain;">` : `<span style="font-size:10px; color:var(--text-muted);">Default</span>`}
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        <button class="btn ghost" id="btn-add-soc" style="margin-top:12px;">+ Add Social Link</button>

        <h3 style="margin-top:32px; border-bottom:1px solid #333; padding-bottom:8px;">Education</h3>
        <div id="prof-edu-list">
          ${(siteData.profile.education || []).map((edu, idx) => `
            <div class="item-card edu-card" data-idx="${idx}">
              <div class="card-header">
                <h4>Education ${idx + 1}</h4>
                <button class="btn danger btn-del-edu" data-idx="${idx}">Delete</button>
              </div>
              <div class="form-row">
                <div class="form-group"><label>Year</label><input type="text" class="edu-year" value="${esc(edu.year)}"></div>
                <div class="form-group"><label>Degree</label><input type="text" class="edu-degree" value="${esc(edu.degree)}"></div>
                <div class="form-group"><label>Institution</label><input type="text" class="edu-inst" value="${esc(edu.institution)}"></div>
              </div>
              <div class="form-group"><label>Description</label><textarea class="edu-desc">${esc(edu.desc)}</textarea></div>
            </div>
          `).join('')}
        </div>
        <button class="btn ghost" id="btn-add-edu">+ Add Education</button>

        <h3 style="margin-top:32px; border-bottom:1px solid #333; padding-bottom:8px;">Awards</h3>
        <div id="prof-awards-list">
          ${(siteData.profile.awards || []).map((aw, idx) => `
            <div class="item-card aw-card" data-idx="${idx}">
              <div class="card-header">
                <h4>Award ${idx + 1}</h4>
                <button class="btn danger btn-del-aw" data-idx="${idx}">Delete</button>
              </div>
              <div class="form-row">
                <div class="form-group"><label>Date</label><input type="text" class="aw-date" value="${esc(aw.date)}"></div>
                <div class="form-group"><label>Title</label><input type="text" class="aw-title" value="${esc(aw.title)}"></div>
              </div>
              <div class="form-group"><label>Description</label><textarea class="aw-desc">${esc(aw.desc)}</textarea></div>
            </div>
          `).join('')}
        </div>
        <button class="btn ghost" id="btn-add-aw">+ Add Award</button>
      `;

      // Event Listeners for Profile dynamic arrays
      document.getElementById('btn-add-soc').onclick = () => {
        collectFormData();
        if(!siteData.profile.socials) siteData.profile.socials = [];
        siteData.profile.socials.push({ name: '', url: '', logo: '' });
        renderEditor();
      };
      document.querySelectorAll('.btn-del-soc').forEach(btn => btn.onclick = (e) => {
        collectFormData(); siteData.profile.socials.splice(e.target.dataset.idx, 1); renderEditor();
      });

      document.getElementById('btn-add-edu').onclick = () => {
        collectFormData();
        if(!siteData.profile.education) siteData.profile.education = [];
        siteData.profile.education.push({ year: '', degree: '', institution: '', desc: '' });
        renderEditor();
      };
      document.querySelectorAll('.btn-del-edu').forEach(btn => btn.onclick = (e) => {
        collectFormData(); siteData.profile.education.splice(e.target.dataset.idx, 1); renderEditor();
      });

      document.getElementById('btn-add-aw').onclick = () => {
        collectFormData();
        if(!siteData.profile.awards) siteData.profile.awards = [];
        siteData.profile.awards.push({ date: '', title: '', desc: '' });
        renderEditor();
      };
      document.querySelectorAll('.btn-del-aw').forEach(btn => btn.onclick = (e) => {
        collectFormData(); siteData.profile.awards.splice(e.target.dataset.idx, 1); renderEditor();
      });
      break;

    case 'experience':
      container.innerHTML = `
        <div class="form-group"><label>Section Note</label><textarea id="exp-note">${esc(siteData.experience.sectionNote)}</textarea></div>
        <div id="exp-list">
          ${siteData.experience.timeline.map((item, idx) => `
            <div class="item-card" data-idx="${idx}">
              <div class="card-header">
                <h3>Role ${idx + 1}</h3>
                <button class="btn danger btn-del-exp" data-idx="${idx}">Delete</button>
              </div>
              <div class="form-row">
                <div class="form-group"><label>Date</label><input type="text" class="exp-date" value="${esc(item.date)}"></div>
                <div class="form-group"><label>Role</label><input type="text" class="exp-role" value="${esc(item.role)}"></div>
                <div class="form-group"><label>Organization</label><input type="text" class="exp-org" value="${esc(item.org)}"></div>
              </div>
              <div class="form-group"><label>Bullet Points (one per line)</label>
                <textarea class="exp-bullets" rows="5">${item.bullets.map(esc).join('\n')}</textarea>
              </div>
            </div>
          `).join('')}
        </div>
        <button class="btn ghost" id="btn-add-exp">+ Add Experience</button>
      `;
      document.getElementById('btn-add-exp').onclick = () => {
        collectFormData();
        siteData.experience.timeline.push({ id: 'exp-'+Date.now(), date: '', role: '', org: '', bullets: [] });
        renderEditor();
      };
      document.querySelectorAll('.btn-del-exp').forEach(btn => {
        btn.onclick = (e) => {
          collectFormData();
          siteData.experience.timeline.splice(e.target.dataset.idx, 1);
          renderEditor();
        };
      });
      break;

    case 'projects':
      container.innerHTML = `
        <div class="form-group"><label>Section Note</label><textarea id="proj-note">${esc(siteData.projects.sectionNote || '')}</textarea></div>
        <div id="proj-list">
          ${(siteData.projects.items || []).map((item, idx) => `
            <div class="item-card" data-idx="${idx}">
              <div class="card-header">
                <h3>Project ${idx + 1}</h3>
                <button class="btn danger btn-del-proj" data-idx="${idx}">Delete</button>
              </div>
              <div class="form-row">
                <div class="form-group"><label>Name</label><input type="text" class="proj-name" value="${esc(item.name || '')}"></div>
                <div class="form-group"><label>Category</label><input type="text" class="proj-cat" value="${esc(item.category || '')}"></div>
              </div>
              <div class="form-row">
                <div class="form-group"><label>Client</label><input type="text" class="proj-client" value="${esc(item.client || '')}"></div>
                <div class="form-group"><label>Year</label><input type="text" class="proj-year" value="${esc(item.year || '')}"></div>
                <div class="form-group"><label>Services</label><input type="text" class="proj-srv" value="${esc(item.services || '')}"></div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Thumbnail Image URL</label>
                  <input type="text" class="proj-thumb" id="p-thumb-${idx}" value="${esc(item.thumbnail || '')}">
                  <label style="margin-top:10px;">Or Upload Thumbnail</label>
                  <input type="file" accept="image/*" onchange="handleFileUpload(this, 'p-thumb-${idx}')">
                </div>
              </div>
              <div class="form-group"><label>Short Description (for grid)</label><textarea class="proj-desc">${esc(item.description || '')}</textarea></div>
              <div class="form-group"><label>Long Description (for lightbox)</label><textarea class="proj-ldesc">${esc(item.longDescription || '')}</textarea></div>
              <div class="form-group">
                <label>Gallery URLs (one URL per line)</label>
                <textarea class="proj-gal" rows="4">${(item.gallery || []).join('\n')}</textarea>
              </div>
            </div>
          `).join('')}
        </div>
        <button class="btn ghost" id="btn-add-proj">+ Add Project</button>
      `;
      document.getElementById('btn-add-proj').onclick = () => {
        collectFormData();
        if(!siteData.projects.items) siteData.projects.items = [];
        siteData.projects.items.push({ id: 'proj-'+Date.now(), name: '', category: '', client: '', year: '', services: '', description: '', longDescription: '', thumbnail: '', gallery: [] });
        renderEditor();
      };
      document.querySelectorAll('.btn-del-proj').forEach(btn => {
        btn.onclick = (e) => {
          collectFormData();
          siteData.projects.items.splice(e.target.dataset.idx, 1);
          renderEditor();
        };
      });
      break;

    case 'settings':
      container.innerHTML = `
        <div class="item-card">
          <div class="card-header"><h3>Change Admin Password</h3></div>
          <div class="form-group"><label>New Password</label><input type="password" id="new-pwd"></div>
          <button class="btn solid" id="btn-change-pwd">Update Password</button>
        </div>
      `;
      document.getElementById('btn-change-pwd').onclick = () => {
        const p = document.getElementById('new-pwd').value;
        if(p) changePassword(p);
      };
      break;
      
    case 'skills':
      container.innerHTML = `
        <div id="skills-cols">
          ${siteData.skills.columns.map((col, idx) => `
            <div class="item-card" data-idx="${idx}">
              <div class="card-header"><h3>Column ${idx + 1}</h3></div>
              <div class="form-group"><label>Heading</label><input type="text" class="skill-head" value="${esc(col.heading)}"></div>
              <div class="form-group"><label>Tags (comma separated)</label><textarea class="skill-tags">${esc(col.tags.join(', '))}</textarea></div>
            </div>
          `).join('')}
        </div>
      `;
      break;

    case 'photography':
      container.innerHTML = `
        <div class="form-group"><label>Section Note</label><textarea id="photo-note">${esc(siteData.photography.sectionNote)}</textarea></div>
        <div id="photo-list">
          ${siteData.photography.tiles.map((tile, idx) => `
            <div class="item-card" data-idx="${idx}">
              <div class="card-header">
                <h3>Photo ${idx + 1}</h3>
                <button class="btn danger btn-del-photo" data-idx="${idx}">Delete</button>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Image URL</label>
                  <input type="text" class="ph-src" id="ph-src-${idx}" value="${esc(tile.src)}">
                  <label style="margin-top: 10px;">Or Upload Image</label>
                  <input type="file" accept="image/*" onchange="handleFileUpload(this, 'ph-src-${idx}')">
                </div>
                <div class="form-group"><label>Category</label><input type="text" class="ph-cat" value="${esc(tile.category)}"></div>
              </div>
              <div class="form-row">
                <div class="form-group"><label>Aperture / Settings</label><input type="text" class="ph-ap" value="${esc(tile.aperture)}"></div>
                <div class="form-group"><label>Location / Title</label><input type="text" class="ph-loc" value="${esc(tile.location)}"></div>
              </div>
            </div>
          `).join('')}
        </div>
        <button class="btn ghost" id="btn-add-photo">+ Add Photo</button>
      `;
      document.getElementById('btn-add-photo').onclick = () => {
        collectFormData();
        siteData.photography.tiles.push({ id: 'ph-'+Date.now(), src: '', alt: '', category: 'street', aperture: '', location: '' });
        renderEditor();
      };
      document.querySelectorAll('.btn-del-photo').forEach(btn => {
        btn.onclick = (e) => {
          collectFormData();
          siteData.photography.tiles.splice(e.target.dataset.idx, 1);
          renderEditor();
        };
      });
      break;

    case 'media':
      container.innerHTML = `
        <div class="form-group"><label>Section Note</label><textarea id="media-note">${esc(siteData.media?.sectionNote || '')}</textarea></div>
        <div id="media-list">
          ${(siteData.media?.items || []).map((item, idx) => `
            <div class="item-card" data-idx="${idx}">
              <div class="card-header">
                <h3>Embed ${idx + 1}</h3>
                <button class="btn danger btn-del-media" data-idx="${idx}">Delete</button>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Type</label>
                  <select class="med-type">
                    <option value="youtube" ${item.type==='youtube'?'selected':''}>YouTube</option>
                    <option value="facebook" ${item.type==='facebook'?'selected':''}>Facebook</option>
                  </select>
                </div>
                <div class="form-group"><label>Title</label><input type="text" class="med-title" value="${esc(item.title)}"></div>
              </div>
              <div class="form-group">
                <label>Embed URL / Iframe src</label>
                <input type="text" class="med-url" value="${esc(item.url)}">
                <p style="font-size:11px; color:var(--text-muted); margin-top:5px;">For YouTube, use the "embed" URL (e.g. youtube.com/embed/xyz). For Facebook, use the "plugins/post.php?href=..." URL.</p>
              </div>
              <div class="form-group">
                <label>Custom Thumbnail URL (Optional)</label>
                <input type="text" class="med-thumb" id="med-thumb-${idx}" value="${esc(item.thumbnail || '')}">
                <label style="margin-top: 10px;">Or Upload Thumbnail</label>
                <input type="file" accept="image/*" onchange="handleFileUpload(this, 'med-thumb-${idx}')">
              </div>
            </div>
          `).join('')}
        </div>
        <button class="btn ghost" id="btn-add-media">+ Add Embed</button>
      `;
      document.getElementById('btn-add-media').onclick = () => {
        collectFormData();
        if (!siteData.media) siteData.media = { sectionNote: '', items: [] };
        siteData.media.items.push({ id: 'med-'+Date.now(), type: 'youtube', url: '', title: '', thumbnail: '' });
        renderEditor();
      };
      document.querySelectorAll('.btn-del-media').forEach(btn => {
        btn.onclick = (e) => {
          collectFormData();
          siteData.media.items.splice(e.target.dataset.idx, 1);
          renderEditor();
        };
      });
      break;

    case 'custom':
      container.innerHTML = `
        <div class="form-group">
          <p style="margin-bottom:12px;">Add custom sections (e.g. Awards, Blogs) that will appear at the bottom of the page.</p>
        </div>
        <div id="custom-list">
          ${(siteData.customSections || []).map((sec, idx) => `
            <div class="item-card" data-idx="${idx}">
              <div class="card-header">
                <h3>Custom Section ${idx + 1}</h3>
                <button class="btn danger btn-del-custom" data-idx="${idx}">Delete</button>
              </div>
              <div class="form-row">
                <div class="form-group"><label>Section ID (e.g. awards)</label><input type="text" class="c-id" value="${esc(sec.id)}"></div>
                <div class="form-group"><label>Title / Eyebrow</label><input type="text" class="c-title" value="${esc(sec.title)}"></div>
                <div class="form-group">
                  <label>Background Theme</label>
                  <select class="c-theme">
                    <option value="bg-white" ${sec.theme==='bg-white'?'selected':''}>White</option>
                    <option value="bg-lace" ${sec.theme==='bg-lace'?'selected':''}>Lace (Cream)</option>
                    <option value="bg-eider" ${sec.theme==='bg-eider'?'selected':''}>Eider (Light Beige)</option>
                    <option value="bg-essex" ${sec.theme==='bg-essex'?'selected':''}>Essex (Sage)</option>
                    <option value="bg-tarry" ${sec.theme==='bg-tarry'?'selected':''}>Tarry (Mid Green)</option>
                    <option value="bg-forest" ${sec.theme==='bg-forest'?'selected':''}>Forest (Dark Green)</option>
                    <option value="bg-projects" ${sec.theme==='bg-projects'?'selected':''}>Projects (Darkest)</option>
                  </select>
                </div>
              </div>
              <div class="form-group"><label>HTML Content</label><textarea class="c-content" rows="6">${esc(sec.contentHtml)}</textarea></div>
            </div>
          `).join('')}
        </div>
        <button class="btn ghost" id="btn-add-custom">+ Add Custom Section</button>
      `;
      document.getElementById('btn-add-custom').onclick = () => {
        collectFormData();
        if (!siteData.customSections) siteData.customSections = [];
        siteData.customSections.push({ id: 'custom-'+Date.now(), title: 'New Section', theme: 'bg-essex', contentHtml: '<div class="wrap">\n  <h2>Heading</h2>\n  <p>Content</p>\n</div>' });
        renderEditor();
      };
      document.querySelectorAll('.btn-del-custom').forEach(btn => {
        btn.onclick = (e) => {
          collectFormData();
          siteData.customSections.splice(e.target.dataset.idx, 1);
          renderEditor();
        };
      });
      break;

    case 'genres':
      container.innerHTML = `
        <div id="genres-list">
          ${siteData.genres.map((g, idx) => `
            <div class="item-card" data-idx="${idx}">
              <div class="card-header"><h3>Genre ${g.num}</h3></div>
              <div class="form-row">
                <div class="form-group"><label>Number</label><input type="text" class="g-num" value="${esc(g.num)}"></div>
                <div class="form-group"><label>Name</label><input type="text" class="g-name" value="${esc(g.name)}"></div>
              </div>
              <div class="form-group"><label>Description</label><input type="text" class="g-desc" value="${esc(g.desc)}"></div>
            </div>
          `).join('')}
        </div>
      `;
      break;

    case 'contact':
      if (!siteData.contact) siteData.contact = {};
      container.innerHTML = `
        <div class="form-group"><label>Eyebrow</label><input type="text" id="cnt-eyebrow" value="${esc(siteData.contact.eyebrow || '')}"></div>
        <div class="form-row">
          <div class="form-group"><label>Heading (Normal)</label><input type="text" id="cnt-head1" value="${esc(siteData.contact.headingBefore || '')}"></div>
          <div class="form-group"><label>Heading (Strong)</label><input type="text" id="cnt-head2" value="${esc(siteData.contact.headingStrong || '')}"></div>
        </div>
        <div class="form-group"><label>Email</label><input type="text" id="cnt-email" value="${esc(siteData.contact.email || '')}"></div>

        <h3 style="margin-top:32px; border-bottom:1px solid #333; padding-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
          <span>Primary Contact Channels</span>
          <span style="font-size:12px; font-weight:normal; color:var(--text-muted);">Custom PNG logos are optional</span>
        </h3>

        <!-- Phone Channel Card -->
        <div class="item-card" style="margin-top:16px; padding:18px;">
          <h4 style="font-size:14px; margin-bottom:12px;">Phone Channel</h4>
          <div class="form-row">
            <div class="form-group" style="flex:1;"><label>Phone Display Text</label><input type="text" id="cnt-ph-disp" value="${esc(siteData.contact.phoneDisplay || '')}"></div>
            <div class="form-group" style="flex:1;"><label>Phone Link (tel:)</label><input type="text" id="cnt-ph" value="${esc(siteData.contact.phone || '')}"></div>
          </div>
          <div class="form-row" style="align-items:flex-end;">
            <div class="form-group" style="flex:2;">
              <label>Optional PNG Logo URL</label>
              <input type="text" id="cnt-ph-logo" value="${esc(siteData.contact.phoneLogo || '')}" placeholder="Optional: /uploads/... or image URL" oninput="updateLogoPreview('cnt-ph-logo', 'preview-cnt-ph-logo')">
            </div>
            <div class="form-group" style="flex:1.2;">
              <label>Or Upload PNG Logo</label>
              <input type="file" accept="image/png,image/*" onchange="handleFileUpload(this, 'cnt-ph-logo')">
            </div>
            <div class="form-group" style="flex:0 0 64px; text-align:center;">
              <label>Preview</label>
              <div id="preview-cnt-ph-logo" class="admin-logo-preview-box">
                ${siteData.contact.phoneLogo ? `<img src="${siteData.contact.phoneLogo}" alt="Logo" style="max-width:28px; max-height:28px; object-fit:contain;">` : `<span style="font-size:10px; color:var(--text-muted);">None</span>`}
              </div>
            </div>
          </div>
        </div>

        <!-- LinkedIn Channel Card -->
        <div class="item-card" style="margin-top:16px; padding:18px;">
          <h4 style="font-size:14px; margin-bottom:12px;">LinkedIn Channel</h4>
          <div class="form-row">
            <div class="form-group" style="flex:1;"><label>LinkedIn Display Text</label><input type="text" id="cnt-in-disp" value="${esc(siteData.contact.linkedinDisplay || '')}"></div>
            <div class="form-group" style="flex:1;"><label>LinkedIn URL</label><input type="text" id="cnt-in" value="${esc(siteData.contact.linkedin || '')}"></div>
          </div>
          <div class="form-row" style="align-items:flex-end;">
            <div class="form-group" style="flex:2;">
              <label>Optional PNG Logo URL</label>
              <input type="text" id="cnt-in-logo" value="${esc(siteData.contact.linkedinLogo || '')}" placeholder="Optional: /uploads/... or image URL" oninput="updateLogoPreview('cnt-in-logo', 'preview-cnt-in-logo')">
            </div>
            <div class="form-group" style="flex:1.2;">
              <label>Or Upload PNG Logo</label>
              <input type="file" accept="image/png,image/*" onchange="handleFileUpload(this, 'cnt-in-logo')">
            </div>
            <div class="form-group" style="flex:0 0 64px; text-align:center;">
              <label>Preview</label>
              <div id="preview-cnt-in-logo" class="admin-logo-preview-box">
                ${siteData.contact.linkedinLogo ? `<img src="${siteData.contact.linkedinLogo}" alt="Logo" style="max-width:28px; max-height:28px; object-fit:contain;">` : `<span style="font-size:10px; color:var(--text-muted);">None</span>`}
              </div>
            </div>
          </div>
        </div>

        <!-- Instagram / Second Social Channel Card -->
        <div class="item-card" style="margin-top:16px; padding:18px;">
          <h4 style="font-size:14px; margin-bottom:12px;">Instagram / Secondary Social Channel</h4>
          <div class="form-row">
            <div class="form-group" style="flex:1;"><label>Display Text</label><input type="text" id="cnt-ig-disp" value="${esc(siteData.contact.instagramDisplay || '')}"></div>
            <div class="form-group" style="flex:1;"><label>URL</label><input type="text" id="cnt-ig" value="${esc(siteData.contact.instagram || '')}"></div>
          </div>
          <div class="form-row" style="align-items:flex-end;">
            <div class="form-group" style="flex:2;">
              <label>Optional PNG Logo URL</label>
              <input type="text" id="cnt-ig-logo" value="${esc(siteData.contact.instagramLogo || '')}" placeholder="Optional: /uploads/... or image URL" oninput="updateLogoPreview('cnt-ig-logo', 'preview-cnt-ig-logo')">
            </div>
            <div class="form-group" style="flex:1.2;">
              <label>Or Upload PNG Logo</label>
              <input type="file" accept="image/png,image/*" onchange="handleFileUpload(this, 'cnt-ig-logo')">
            </div>
            <div class="form-group" style="flex:0 0 64px; text-align:center;">
              <label>Preview</label>
              <div id="preview-cnt-ig-logo" class="admin-logo-preview-box">
                ${siteData.contact.instagramLogo ? `<img src="${siteData.contact.instagramLogo}" alt="Logo" style="max-width:28px; max-height:28px; object-fit:contain;">` : `<span style="font-size:10px; color:var(--text-muted);">None</span>`}
              </div>
            </div>
          </div>
        </div>

        <h3 style="margin-top:32px; border-bottom:1px solid #333; padding-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
          <span>Additional Contact Social Links (Optional)</span>
          <span style="font-size:12px; font-weight:normal; color:var(--text-muted);">Add any extra platform links</span>
        </h3>
        <div id="cnt-socials-list">
          ${(siteData.contact.socials || []).map((s, idx) => `
            <div class="item-card cnt-social-row" data-idx="${idx}" style="margin-top:16px; padding:18px;">
              <div class="card-header" style="margin-bottom:14px; padding-bottom:8px;">
                <h4 style="font-size:14px; margin:0;">${esc(s.name || `Channel #${idx + 1}`)}</h4>
                <button class="btn danger btn-del-cnt-soc" data-idx="${idx}" style="padding:6px 14px; font-size:11px;">Delete</button>
              </div>
              <div class="form-row">
                <div class="form-group" style="flex:1;"><label>Platform / Label</label><input type="text" class="cnt-soc-name" value="${esc(s.name || '')}" placeholder="e.g. GitHub, Facebook, WhatsApp"></div>
                <div class="form-group" style="flex:2;"><label>URL</label><input type="text" class="cnt-soc-url" value="${esc(s.url || '')}" placeholder="https://..."></div>
              </div>
              <div class="form-row" style="align-items:flex-end;">
                <div class="form-group" style="flex:2;">
                  <label>Optional PNG Logo URL</label>
                  <input type="text" class="cnt-soc-logo" id="cnt-soc-logo-${idx}" value="${esc(s.logo || '')}" placeholder="Optional: /uploads/... or image URL" oninput="updateLogoPreview('cnt-soc-logo-${idx}', 'preview-cnt-soc-logo-${idx}')">
                </div>
                <div class="form-group" style="flex:1.2;">
                  <label>Or Upload PNG Logo</label>
                  <input type="file" accept="image/png,image/*" onchange="handleFileUpload(this, 'cnt-soc-logo-${idx}')">
                </div>
                <div class="form-group" style="flex:0 0 64px; text-align:center;">
                  <label>Preview</label>
                  <div id="preview-cnt-soc-logo-${idx}" class="admin-logo-preview-box">
                    ${s.logo ? `<img src="${s.logo}" alt="Logo" style="max-width:28px; max-height:28px; object-fit:contain;">` : `<span style="font-size:10px; color:var(--text-muted);">None</span>`}
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        <button class="btn ghost" id="btn-add-cnt-soc" style="margin-top:12px;">+ Add Additional Contact Social</button>
      `;

      // Event listeners for Contact dynamic socials
      const btnAddCntSoc = document.getElementById('btn-add-cnt-soc');
      if (btnAddCntSoc) {
        btnAddCntSoc.onclick = () => {
          collectFormData();
          if (!siteData.contact.socials) siteData.contact.socials = [];
          siteData.contact.socials.push({ name: '', url: '', logo: '' });
          renderEditor();
        };
      }
      document.querySelectorAll('.btn-del-cnt-soc').forEach(btn => {
        btn.onclick = (e) => {
          collectFormData();
          siteData.contact.socials.splice(e.target.dataset.idx, 1);
          renderEditor();
        };
      });
      break;

    case 'footer':
      container.innerHTML = `
        <div class="form-row">
          <div class="form-group"><label>Copyright Text</label><input type="text" id="ft-copy" value="${esc(siteData.footer.copyright)}"></div>
          <div class="form-group"><label>Location</label><input type="text" id="ft-loc" value="${esc(siteData.footer.location)}"></div>
        </div>
      `;
      break;
  }
}

// --- Data Collection from DOM ---
// This grabs values from the current form and puts them back into siteData
function collectFormData() {
  if (!siteData) return;
  const c = currentSection;

  if (c === 'meta') {
    siteData.meta.title = document.getElementById('meta-title')?.value || siteData.meta.title;
    siteData.meta.description = document.getElementById('meta-desc')?.value || siteData.meta.description;
  }
  else if (c === 'hero') {
    siteData.hero.eyebrow = document.getElementById('hero-eyebrow')?.value || '';
    siteData.hero.titleLine1 = document.getElementById('hero-t1')?.value || '';
    siteData.hero.titleLine2 = document.getElementById('hero-t2')?.value || '';
    siteData.hero.subtitle = document.getElementById('hero-sub')?.value || '';
    siteData.hero.ctaPrimary.label = document.getElementById('hero-cta1-lbl')?.value || '';
    siteData.hero.ctaPrimary.href = document.getElementById('hero-cta1-href')?.value || '';
    siteData.hero.ctaSecondary.label = document.getElementById('hero-cta2-lbl')?.value || '';
    siteData.hero.ctaSecondary.href = document.getElementById('hero-cta2-href')?.value || '';
    siteData.hero.image.src = document.getElementById('hero-img-src')?.value || '';
    siteData.hero.image.alt = document.getElementById('hero-img-alt')?.value || '';
  }
  else if (c === 'profile') {
    siteData.profile.sectionNote = document.getElementById('prof-note')?.value || '';
    siteData.profile.lead = document.getElementById('prof-lead')?.value || '';
    siteData.profile.avatar = document.getElementById('prof-avatar')?.value || '';
    siteData.profile.handle = document.getElementById('prof-handle')?.value || '';
    if(!siteData.profile.paragraphs) siteData.profile.paragraphs = [];
    siteData.profile.paragraphs[0] = document.getElementById('prof-p0')?.value || '';
    siteData.profile.paragraphs[1] = document.getElementById('prof-p1')?.value || '';
    
    document.querySelectorAll('.social-row').forEach((row, idx) => {
      if (siteData.profile.socials[idx]) {
        siteData.profile.socials[idx].name = row.querySelector('.soc-name').value;
        siteData.profile.socials[idx].url = row.querySelector('.soc-url').value;
        siteData.profile.socials[idx].logo = row.querySelector('.soc-logo')?.value || '';
      }
    });

    document.querySelectorAll('.edu-card').forEach((card, idx) => {
      if (siteData.profile.education[idx]) {
        siteData.profile.education[idx].year = card.querySelector('.edu-year').value;
        siteData.profile.education[idx].degree = card.querySelector('.edu-degree').value;
        siteData.profile.education[idx].institution = card.querySelector('.edu-inst').value;
        siteData.profile.education[idx].desc = card.querySelector('.edu-desc').value;
      }
    });

    document.querySelectorAll('.aw-card').forEach((card, idx) => {
      if (siteData.profile.awards[idx]) {
        siteData.profile.awards[idx].date = card.querySelector('.aw-date').value;
        siteData.profile.awards[idx].title = card.querySelector('.aw-title').value;
        siteData.profile.awards[idx].desc = card.querySelector('.aw-desc').value;
      }
    });
  }
  else if (c === 'experience') {
    siteData.experience.sectionNote = document.getElementById('exp-note')?.value || '';
    document.querySelectorAll('#exp-list .item-card').forEach((card, idx) => {
      if (siteData.experience.timeline[idx]) {
        siteData.experience.timeline[idx].date = card.querySelector('.exp-date').value;
        siteData.experience.timeline[idx].role = card.querySelector('.exp-role').value;
        siteData.experience.timeline[idx].org = card.querySelector('.exp-org').value;
        siteData.experience.timeline[idx].bullets = card.querySelector('.exp-bullets').value.split('\n').filter(s=>s.trim());
      }
    });
  }
  else if (c === 'projects') {
    siteData.projects.sectionNote = document.getElementById('proj-note')?.value || '';
    document.querySelectorAll('#proj-list .item-card').forEach((card, idx) => {
      if (siteData.projects.items[idx]) {
        siteData.projects.items[idx].name = card.querySelector('.proj-name').value;
        siteData.projects.items[idx].category = card.querySelector('.proj-cat').value;
        siteData.projects.items[idx].client = card.querySelector('.proj-client').value;
        siteData.projects.items[idx].year = card.querySelector('.proj-year').value;
        siteData.projects.items[idx].services = card.querySelector('.proj-srv').value;
        siteData.projects.items[idx].description = card.querySelector('.proj-desc').value;
        siteData.projects.items[idx].longDescription = card.querySelector('.proj-ldesc').value;
        siteData.projects.items[idx].thumbnail = card.querySelector('.proj-thumb').value;
        siteData.projects.items[idx].gallery = card.querySelector('.proj-gal').value.split('\n').map(s=>s.trim()).filter(s=>s);
      }
    });
  }
  else if (c === 'skills') {
    document.querySelectorAll('#skills-cols .item-card').forEach((card, idx) => {
      if (siteData.skills.columns[idx]) {
        siteData.skills.columns[idx].heading = card.querySelector('.skill-head').value;
        siteData.skills.columns[idx].tags = card.querySelector('.skill-tags').value.split(',').map(s=>s.trim()).filter(s=>s);
      }
    });
  }
  else if (c === 'photography') {
    siteData.photography.sectionNote = document.getElementById('photo-note')?.value || '';
    document.querySelectorAll('#photo-list .item-card').forEach((card, idx) => {
      if (siteData.photography.tiles[idx]) {
        siteData.photography.tiles[idx].src = card.querySelector('.ph-src').value;
        siteData.photography.tiles[idx].category = card.querySelector('.ph-cat').value;
        siteData.photography.tiles[idx].aperture = card.querySelector('.ph-ap').value;
        siteData.photography.tiles[idx].location = card.querySelector('.ph-loc').value;
      }
    });
  }
  else if (c === 'media') {
    if (!siteData.media) siteData.media = { sectionNote: '', items: [] };
    siteData.media.sectionNote = document.getElementById('media-note')?.value || '';
    document.querySelectorAll('#media-list .item-card').forEach((card, idx) => {
      if (siteData.media.items[idx]) {
        siteData.media.items[idx].type = card.querySelector('.med-type').value;
        siteData.media.items[idx].title = card.querySelector('.med-title').value;
        siteData.media.items[idx].url = card.querySelector('.med-url').value;
        siteData.media.items[idx].thumbnail = card.querySelector('.med-thumb').value;
      }
    });
  }
  else if (c === 'custom') {
    if (!siteData.customSections) siteData.customSections = [];
    document.querySelectorAll('#custom-list .item-card').forEach((card, idx) => {
      if (siteData.customSections[idx]) {
        siteData.customSections[idx].id = card.querySelector('.c-id').value;
        siteData.customSections[idx].title = card.querySelector('.c-title').value;
        siteData.customSections[idx].theme = card.querySelector('.c-theme').value;
        siteData.customSections[idx].contentHtml = card.querySelector('.c-content').value;
      }
    });
  }
  else if (c === 'genres') {
    document.querySelectorAll('#genres-list .item-card').forEach((card, idx) => {
      if (siteData.genres[idx]) {
        siteData.genres[idx].num = card.querySelector('.g-num').value;
        siteData.genres[idx].name = card.querySelector('.g-name').value;
        siteData.genres[idx].desc = card.querySelector('.g-desc').value;
      }
    });
  }
  else if (c === 'contact') {
    siteData.contact.eyebrow = document.getElementById('cnt-eyebrow')?.value || '';
    siteData.contact.headingBefore = document.getElementById('cnt-head1')?.value || '';
    siteData.contact.headingStrong = document.getElementById('cnt-head2')?.value || '';
    siteData.contact.email = document.getElementById('cnt-email')?.value || '';
    siteData.contact.phoneDisplay = document.getElementById('cnt-ph-disp')?.value || '';
    siteData.contact.phone = document.getElementById('cnt-ph')?.value || '';
    siteData.contact.phoneLogo = document.getElementById('cnt-ph-logo')?.value || '';
    siteData.contact.linkedinDisplay = document.getElementById('cnt-in-disp')?.value || '';
    siteData.contact.linkedin = document.getElementById('cnt-in')?.value || '';
    siteData.contact.linkedinLogo = document.getElementById('cnt-in-logo')?.value || '';
    siteData.contact.instagramDisplay = document.getElementById('cnt-ig-disp')?.value || '';
    siteData.contact.instagram = document.getElementById('cnt-ig')?.value || '';
    siteData.contact.instagramLogo = document.getElementById('cnt-ig-logo')?.value || '';

    siteData.contact.socials = [];
    document.querySelectorAll('.cnt-social-row').forEach((row) => {
      const name = row.querySelector('.cnt-soc-name')?.value || '';
      const url = row.querySelector('.cnt-soc-url')?.value || '';
      const logo = row.querySelector('.cnt-soc-logo')?.value || '';
      if (name || url || logo) {
        siteData.contact.socials.push({ name, url, logo });
      }
    });
  }
  else if (c === 'footer') {
    siteData.footer.copyright = document.getElementById('ft-copy')?.value || '';
    siteData.footer.location = document.getElementById('ft-loc')?.value || '';
  }
}

function esc(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function updateLogoPreview(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  if (!input || !preview) return;
  const val = (input.value || '').trim();
  if (val) {
    preview.innerHTML = `<img src="${val}" alt="Logo" style="max-width:28px; max-height:28px; object-fit:contain;" onerror="this.parentElement.innerHTML='<span style=\\'font-size:9px; color:#ff6b6b;\\'>Broken</span>'">`;
  } else {
    preview.innerHTML = `<span style="font-size:10px; color:var(--text-muted);">None</span>`;
  }
}
window.updateLogoPreview = updateLogoPreview;

async function handleFileUpload(inputElem, targetInputId) {
  if (!inputElem.files || !inputElem.files[0]) return;
  const file = inputElem.files[0];
  const formData = new FormData();
  formData.append('image', file);

  const prevText = inputElem.previousElementSibling ? inputElem.previousElementSibling.innerText : '';
  if (inputElem.previousElementSibling) {
    inputElem.previousElementSibling.innerText = 'Uploading...';
  }

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'x-admin-token': adminToken },
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      const targetInput = document.getElementById(targetInputId);
      if (targetInput) {
        targetInput.value = data.url;
        targetInput.dispatchEvent(new Event('input', { bubbles: true }));
        targetInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const previewBox = document.getElementById('preview-' + targetInputId);
      if (previewBox) {
        previewBox.innerHTML = `<img src="${data.url}" alt="Logo" style="max-width:28px; max-height:28px; object-fit:contain;">`;
      }
      showToast('Image uploaded!');
    } else {
      showToast(data.error || 'Upload failed', true);
    }
  } catch (e) {
    showToast('Server error during upload', true);
  } finally {
    if (inputElem.previousElementSibling) {
      inputElem.previousElementSibling.innerText = prevText;
    }
    inputElem.value = ''; // Reset input
  }
}
