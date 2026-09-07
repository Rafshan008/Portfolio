/* =========================================================
   doodles.js — Site-wide background doodle layer
   SVG wireframe cameras + animated neural network canvas
   ========================================================= */

(function () {
  'use strict';

  /* ── 1. Inject the fixed doodle layer HTML ──────────────── */
  const layer = document.createElement('div');
  layer.id = 'site-doodle-layer';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = `
    <!-- Neural network canvas -->
    <canvas id="neural-canvas"></canvas>

    <!-- ① Vintage Box Camera — top-left -->
    <svg class="sdoodle sd-vintage-cam" viewBox="0 0 160 130" fill="none"
         stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <rect x="8" y="32" width="144" height="88" rx="6" stroke-width="1.8"/>
      <rect x="30" y="22" width="90" height="14" rx="3" stroke-width="1.4"/>
      <circle cx="72" cy="76" r="32" stroke-width="1.8"/>
      <circle cx="72" cy="76" r="22" stroke-width="1.2"/>
      <circle cx="72" cy="76" r="13" stroke-width="1.2"/>
      <circle cx="72" cy="76" r="5"  stroke-width="1"/>
      <rect x="110" y="38" width="28" height="20" rx="3" stroke-width="1.4"/>
      <circle cx="124" cy="48" r="6" stroke-width="1"/>
      <circle cx="24" cy="44" r="4" stroke-width="1"/>
      <circle cx="72" cy="26" r="5" stroke-width="1.4"/>
      <path d="M 130 24 Q 140 20 144 30" stroke-width="1.4"/>
      <circle cx="144" cy="30" r="3" stroke-width="1"/>
      <rect x="2" y="48" width="10" height="8" rx="2" stroke-width="1.2"/>
      <rect x="148" y="48" width="10" height="8" rx="2" stroke-width="1.2"/>
      <line x1="8" y1="110" x2="152" y2="110" stroke-width="0.8" stroke-dasharray="4 3"/>
      <line x1="72" y1="54" x2="72" y2="58" stroke-width="0.8"/>
      <line x1="72" y1="94" x2="72" y2="98" stroke-width="0.8"/>
      <line x1="50" y1="76" x2="54" y2="76" stroke-width="0.8"/>
      <line x1="90" y1="76" x2="94" y2="76" stroke-width="0.8"/>
    </svg>

    <!-- ② Film Reel — top-right -->
    <svg class="sdoodle sd-film-reel" viewBox="0 0 120 120" fill="none"
         stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="60" cy="60" r="56" stroke-width="1.8"/>
      <circle cx="60" cy="60" r="48" stroke-width="0.8" stroke-dasharray="5 4"/>
      <circle cx="60" cy="60" r="26" stroke-width="1.4"/>
      <circle cx="60" cy="60" r="10" stroke-width="1.6"/>
      <circle cx="60" cy="60" r="4"  stroke-width="1"/>
      <line x1="60" y1="50" x2="60" y2="34" stroke-width="1.4"/>
      <line x1="73.9" y1="53" x2="83.9" y2="40.7" stroke-width="1.4"/>
      <line x1="73.9" y1="67" x2="83.9" y2="79.3" stroke-width="1.4"/>
      <line x1="60" y1="70" x2="60" y2="86" stroke-width="1.4"/>
      <line x1="46.1" y1="67" x2="36.1" y2="79.3" stroke-width="1.4"/>
      <line x1="46.1" y1="53" x2="36.1" y2="40.7" stroke-width="1.4"/>
      <rect x="55" y="2"   width="10" height="8" rx="2" stroke-width="1.2"/>
      <rect x="55" y="110" width="10" height="8" rx="2" stroke-width="1.2"/>
      <rect x="2"  y="55"  width="8"  height="10" rx="2" stroke-width="1.2"/>
      <rect x="110" y="55" width="8"  height="10" rx="2" stroke-width="1.2"/>
    </svg>

    <!-- ③ Cine / Movie Camera — mid-right -->
    <svg class="sdoodle sd-cine-cam" viewBox="0 0 180 150" fill="none"
         stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <ellipse cx="90" cy="28" rx="38" ry="26" stroke-width="1.8"/>
      <ellipse cx="90" cy="28" rx="28" ry="18" stroke-width="1"/>
      <line x1="90" y1="2" x2="90" y2="54" stroke-width="0.8" stroke-dasharray="3 3"/>
      <rect x="38" y="52" width="104" height="72" rx="8" stroke-width="1.8"/>
      <circle cx="90" cy="88" r="26" stroke-width="1.8"/>
      <circle cx="90" cy="88" r="18" stroke-width="1.2"/>
      <circle cx="90" cy="88" r="10" stroke-width="1.2"/>
      <circle cx="90" cy="88" r="4"  stroke-width="1"/>
      <rect x="118" y="56" width="32" height="22" rx="4" stroke-width="1.4"/>
      <circle cx="134" cy="67" r="7" stroke-width="1"/>
      <rect x="130" y="82" width="20" height="50" rx="10" stroke-width="1.6"/>
      <circle cx="44" cy="68" r="10" stroke-width="1.2"/>
      <circle cx="44" cy="68" r="4"  stroke-width="0.8"/>
      <circle cx="42" cy="106" r="10" stroke-width="1.2"/>
      <circle cx="42" cy="106" r="4"  stroke-width="0.8"/>
      <line x1="64" y1="74" x2="64" y2="102" stroke-width="0.8" stroke-dasharray="2 3"/>
      <line x1="116" y1="74" x2="116" y2="102" stroke-width="0.8" stroke-dasharray="2 3"/>
      <circle cx="54" cy="58" r="3" stroke-width="1"/>
      <line x1="68" y1="62" x2="68" y2="66" stroke-width="0.8"/>
      <line x1="78" y1="62" x2="78" y2="66" stroke-width="0.8"/>
      <line x1="88" y1="62" x2="88" y2="66" stroke-width="0.8"/>
      <line x1="98" y1="62" x2="98" y2="66" stroke-width="0.8"/>
      <line x1="108" y1="62" x2="108" y2="66" stroke-width="0.8"/>
    </svg>

    <!-- ④ Modern DSLR — bottom-left -->
    <svg class="sdoodle sd-modern-cam" viewBox="0 0 175 135" fill="none"
         stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <rect x="8" y="26" width="159" height="100" rx="10" stroke-width="1.8"/>
      <rect x="130" y="12" width="38" height="28" rx="8" stroke-width="1.6"/>
      <path d="M 50 26 L 64 8 L 110 8 L 124 26" stroke-width="1.6"/>
      <rect x="72" y="4" width="34" height="8" rx="2" stroke-width="1.2"/>
      <circle cx="76" cy="76" r="38" stroke-width="1.8"/>
      <circle cx="76" cy="76" r="28" stroke-width="1.2"/>
      <circle cx="76" cy="76" r="18" stroke-width="1.2"/>
      <circle cx="76" cy="76" r="8"  stroke-width="1"/>
      <line x1="76" y1="38" x2="76" y2="44" stroke-width="0.8"/>
      <line x1="76" y1="108" x2="76" y2="114" stroke-width="0.8"/>
      <line x1="38" y1="76" x2="44" y2="76" stroke-width="0.8"/>
      <line x1="108" y1="76" x2="114" y2="76" stroke-width="0.8"/>
      <rect x="124" y="44" width="36" height="50" rx="4" stroke-width="1.4"/>
      <line x1="134" y1="44" x2="134" y2="94" stroke-width="0.5" stroke-dasharray="2 4"/>
      <line x1="150" y1="44" x2="150" y2="94" stroke-width="0.5" stroke-dasharray="2 4"/>
      <line x1="124" y1="62" x2="160" y2="62" stroke-width="0.5" stroke-dasharray="2 4"/>
      <line x1="124" y1="76" x2="160" y2="76" stroke-width="0.5" stroke-dasharray="2 4"/>
      <circle cx="148" cy="18" r="7" stroke-width="1.4"/>
      <circle cx="124" cy="18" r="9" stroke-width="1.4"/>
      <line x1="124" y1="9" x2="124" y2="27" stroke-width="0.8"/>
      <line x1="115" y1="18" x2="133" y2="18" stroke-width="0.8"/>
      <rect x="68" y="8" width="38" height="18" rx="3" stroke-width="1.2"/>
    </svg>

    <!-- ⑤ Film Strip — mid-left, vertical -->
    <svg class="sdoodle sd-film-strip" viewBox="0 0 52 240" fill="none"
         stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <rect x="4" y="4" width="44" height="232" rx="3" stroke-width="1.6"/>
      <line x1="14" y1="24"  x2="38" y2="24"  stroke-width="0.8"/>
      <line x1="14" y1="64"  x2="38" y2="64"  stroke-width="0.8"/>
      <line x1="14" y1="104" x2="38" y2="104" stroke-width="0.8"/>
      <line x1="14" y1="144" x2="38" y2="144" stroke-width="0.8"/>
      <line x1="14" y1="184" x2="38" y2="184" stroke-width="0.8"/>
      <line x1="14" y1="224" x2="38" y2="224" stroke-width="0.8"/>
      <rect x="6"  y="10"  width="7" height="10" rx="1" stroke-width="1.2"/>
      <rect x="6"  y="30"  width="7" height="10" rx="1" stroke-width="1.2"/>
      <rect x="6"  y="50"  width="7" height="10" rx="1" stroke-width="1.2"/>
      <rect x="6"  y="70"  width="7" height="10" rx="1" stroke-width="1.2"/>
      <rect x="6"  y="90"  width="7" height="10" rx="1" stroke-width="1.2"/>
      <rect x="6"  y="110" width="7" height="10" rx="1" stroke-width="1.2"/>
      <rect x="6"  y="130" width="7" height="10" rx="1" stroke-width="1.2"/>
      <rect x="6"  y="150" width="7" height="10" rx="1" stroke-width="1.2"/>
      <rect x="6"  y="170" width="7" height="10" rx="1" stroke-width="1.2"/>
      <rect x="6"  y="190" width="7" height="10" rx="1" stroke-width="1.2"/>
      <rect x="6"  y="210" width="7" height="10" rx="1" stroke-width="1.2"/>
      <rect x="39" y="10"  width="7" height="10" rx="1" stroke-width="1.2"/>
      <rect x="39" y="30"  width="7" height="10" rx="1" stroke-width="1.2"/>
      <rect x="39" y="50"  width="7" height="10" rx="1" stroke-width="1.2"/>
      <rect x="39" y="70"  width="7" height="10" rx="1" stroke-width="1.2"/>
      <rect x="39" y="90"  width="7" height="10" rx="1" stroke-width="1.2"/>
      <rect x="39" y="110" width="7" height="10" rx="1" stroke-width="1.2"/>
      <rect x="39" y="130" width="7" height="10" rx="1" stroke-width="1.2"/>
      <rect x="39" y="150" width="7" height="10" rx="1" stroke-width="1.2"/>
      <rect x="39" y="170" width="7" height="10" rx="1" stroke-width="1.2"/>
      <rect x="39" y="190" width="7" height="10" rx="1" stroke-width="1.2"/>
      <rect x="39" y="210" width="7" height="10" rx="1" stroke-width="1.2"/>
    </svg>

    <!-- ⑥ Aperture Iris — bottom-right -->
    <svg class="sdoodle sd-aperture" viewBox="0 0 100 100" fill="none"
         stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="50" cy="50" r="46" stroke-width="1.6"/>
      <circle cx="50" cy="50" r="30" stroke-width="1"/>
      <circle cx="50" cy="50" r="14" stroke-width="1.4"/>
      <path d="M 50 20 Q 70 36 50 50 Q 30 36 50 20" stroke-width="1" stroke-dasharray="2 2"/>
      <path d="M 75 32 Q 72 55 50 50 Q 44 28 75 32" stroke-width="1" stroke-dasharray="2 2"/>
      <path d="M 75 68 Q 55 72 50 50 Q 66 36 75 68" stroke-width="1" stroke-dasharray="2 2"/>
      <path d="M 50 80 Q 30 64 50 50 Q 70 64 50 80" stroke-width="1" stroke-dasharray="2 2"/>
      <path d="M 25 68 Q 28 45 50 50 Q 56 72 25 68" stroke-width="1" stroke-dasharray="2 2"/>
      <path d="M 25 32 Q 45 28 50 50 Q 34 64 25 32" stroke-width="1" stroke-dasharray="2 2"/>
      <line x1="50" y1="2"  x2="50" y2="8"  stroke-width="1"/>
      <line x1="72" y1="8"  x2="69" y2="13" stroke-width="1"/>
      <line x1="88" y1="24" x2="83" y2="27" stroke-width="1"/>
      <line x1="94" y1="46" x2="88" y2="47" stroke-width="1"/>
    </svg>
  `;
  document.body.insertBefore(layer, document.body.firstChild);

  /* ── 2. Neural Network Canvas ───────────────────────────── */
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const CFG = {
    nodeCount : 32,
    maxDist   : window.innerWidth < 768 ? 130 : 220,
    speed     : 0.28,
    nc        : '163, 159, 114',   // Sage accent RGB (#A39F72)
    nodeAlpha : 0.40,
    lineAlpha : 0.24,
  };

  let W, H, nodes;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function mkNode() {
    const angle = Math.random() * Math.PI * 2;
    const spd   = (Math.random() * 0.5 + 0.1) * CFG.speed;
    return {
      x     : Math.random() * W,
      y     : Math.random() * H,
      vx    : Math.cos(angle) * spd,
      vy    : Math.sin(angle) * spd,
      r     : Math.random() * 2 + 1.5,
      phase : Math.random() * Math.PI * 2,
    };
  }

  function initNodes() { nodes = Array.from({ length: CFG.nodeCount }, mkNode); }

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);
    const t = performance.now() * 0.001;

    // Connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx   = nodes[j].x - nodes[i].x;
        const dy   = nodes[j].y - nodes[i].y;
        const dist = Math.hypot(dx, dy);
        if (dist >= CFG.maxDist) continue;
        const prox  = 1 - dist / CFG.maxDist;
        const pulse = 0.5 + 0.5 * Math.sin(t * 0.7 + i * 0.3 + j * 0.2);
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.strokeStyle = `rgba(${CFG.nc}, ${prox * CFG.lineAlpha * pulse})`;
        ctx.lineWidth   = prox * 1.2;
        ctx.stroke();
      }
    }

    // Nodes
    nodes.forEach(n => {
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.2 + n.phase);
      const r     = n.r + pulse * 1.2;

      ctx.beginPath();
      ctx.arc(n.x, n.y, r * 3.5, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${CFG.nc}, ${0.08 * pulse})`;
      ctx.lineWidth   = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(n.x, n.y, r * 1.9, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${CFG.nc}, ${0.18 * pulse})`;
      ctx.lineWidth   = 0.8;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CFG.nc}, ${CFG.nodeAlpha * pulse})`;
      ctx.fill();

      n.x += n.vx;
      n.y += n.vy;
      const P = 20;
      if (n.x < P || n.x > W - P) { n.vx *= -1; n.x = Math.max(P, Math.min(W - P, n.x)); }
      if (n.y < P || n.y > H - P) { n.vy *= -1; n.y = Math.max(P, Math.min(H - P, n.y)); }
    });

    // Connect to mouse cursor
    if (mouse.active) {
      nodes.forEach(n => {
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 140) {
          const prox = 1 - dist / 140;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(${CFG.nc}, ${prox * 0.5})`;
          ctx.lineWidth = prox * 1.5;
          ctx.stroke();
        }
      });
    }

    requestAnimationFrame(drawFrame);
  }

  let mouse = { x: -1000, y: -1000, active: false };
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });
  window.addEventListener('mouseleave', () => { mouse.active = false; });

  resize(); initNodes(); drawFrame();

  window.addEventListener('resize', () => {
    resize();
    nodes.forEach(n => { n.x = Math.min(n.x, W - 20); n.y = Math.min(n.y, H - 20); });
  });

  // Mouse gentle repel and subtle parallax for SVG doodles
  const doodles = document.querySelectorAll('.sdoodle');
  window.addEventListener('mousemove', e => {
    nodes.forEach(n => {
      const dx = n.x - e.clientX, dy = n.y - e.clientY;
      const dist = Math.hypot(dx, dy);
      if (dist < 100) {
        const f = (100 - dist) / 100 * 0.35;
        n.vx += (dx / dist) * f;
        n.vy += (dy / dist) * f;
        const spd = Math.hypot(n.vx, n.vy);
        if (spd > 1.8) { n.vx = (n.vx / spd) * 1.8; n.vy = (n.vy / spd) * 1.8; }
      }
    });

    const nx = (e.clientX / window.innerWidth - 0.5) * 16;
    const ny = (e.clientY / window.innerHeight - 0.5) * 16;
    doodles.forEach((d, idx) => {
      const factor = (idx % 2 === 0 ? 1 : -1) * 0.75;
      d.style.setProperty('--parallax-x', `${(nx * factor).toFixed(1)}px`);
      d.style.setProperty('--parallax-y', `${(ny * factor).toFixed(1)}px`);
    });
  });

})();
