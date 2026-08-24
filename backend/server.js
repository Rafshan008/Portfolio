'use strict';
const express = require('express');
const fs      = require('fs');
const path    = require('path');
const crypto  = require('crypto');

const app      = express();
const PORT     = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_PATH = path.join(DATA_DIR, 'site-data.json');

// ──────────────────────────────────────────────
// Admin password (SHA-256)
// Default password: rafshan2026
// Change it from the Settings tab in admin panel
// ──────────────────────────────────────────────
let ADMIN_HASH = sha256('rafshan2026');

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

function readData() {
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
}

function writeData(obj) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_PATH, JSON.stringify(obj, null, 2), 'utf8');
}

// ── Middleware ──────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../frontend')));

// ── Auth middleware (for write endpoints) ───────
function requireAuth(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (!token || token !== ADMIN_HASH) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// ── File Upload (Multer) ────────────────────────
const multer = require('multer');
const UPLOADS_DIR = path.join(__dirname, '../frontend/uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR)
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + ext)
  }
});
const upload = multer({ storage: storage });

// POST /api/upload → handle image uploads (admin only)
app.post('/api/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ success: true, url: '/uploads/' + req.file.filename });
});

// ── API Routes ──────────────────────────────────

// POST /api/auth  → login
app.post('/api/auth', (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required' });
  const hash = sha256(password);
  if (hash === ADMIN_HASH) {
    res.json({ success: true, token: hash });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// GET /api/data → public site data (no auth required)
app.get('/api/data', (req, res) => {
  try {
    res.json(readData());
  } catch (e) {
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// PUT /api/data → replace all site data (admin only)
app.put('/api/data', requireAuth, (req, res) => {
  try {
    writeData(req.body);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to write data: ' + e.message });
  }
});

// PUT /api/data/section/:key → update one section (admin only)
app.put('/api/data/section/:key', requireAuth, (req, res) => {
  try {
    const data = readData();
    data[req.params.key] = req.body;
    writeData(data);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/auth/change-password → change admin password (admin only)
app.post('/api/auth/change-password', requireAuth, (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  ADMIN_HASH = sha256(newPassword);
  res.json({ success: true, token: ADMIN_HASH });
});

// ── Start ────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   🌿  RAFSHAN WEB — LOCAL SERVER          ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║   Site:    http://localhost:${PORT}           ║`);
  console.log(`║   Admin:   http://localhost:${PORT}/admin.html ║`);
  console.log('║   Password: rafshan2026                  ║');
  console.log('╚══════════════════════════════════════════╝\n');
});
