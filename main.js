/* ============================================
   Music Spot-koppe — main.js
   ============================================ */

/* ── 1. PARTICLE (星・光の粒) ── */
(function () {
  const canvas = document.getElementById('particle-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomBetween(a, b) { return a + Math.random() * (b - a); }

  function createParticles() {
    particles = [];
    const count = Math.floor((W * H) / 8000);
    for (let i = 0; i < count; i++) {
      const size = randomBetween(0.4, 2.2);
      particles.push({
        x: randomBetween(0, W), y: randomBetween(0, H),
        size, baseSize: size,
        speedX: randomBetween(-0.12, 0.12),
        speedY: randomBetween(-0.18, -0.04),
        opacity: randomBetween(0.1, 0.7),
        blinkOffset: randomBetween(0, Math.PI * 2),
        blinkSpeed:  randomBetween(0.005, 0.018),
        hue: Math.random() < 0.3 ? 200 : 0,
        sat: Math.random() < 0.3 ? 60  : 0,
      });
    }
  }

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    frame++;
    for (const p of particles) {
      const blink = 0.5 + 0.5 * Math.sin(frame * p.blinkSpeed + p.blinkOffset);
      const alpha = p.opacity * blink;
      const size  = p.baseSize * (0.8 + 0.4 * blink);
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fillStyle = p.hue === 0
        ? `rgba(255,255,255,${alpha})`
        : `hsla(${p.hue},${p.sat}%,80%,${alpha})`;
      ctx.fill();
      if (p.baseSize > 1.5) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 2.5, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 2.5);
        grad.addColorStop(0, `rgba(126,200,227,${alpha * 0.3})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fill();
      }
      p.x += p.speedX;
      p.y += p.speedY;
      if (p.y < -5)  p.y = H + 5;
      if (p.x < -5)  p.x = W + 5;
      if (p.x > W+5) p.x = -5;
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); createParticles(); });
  resize();
  createParticles();
  draw();
})();


/* ── 2a. RIPPLE — ボタン ── */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function (e) {
    const old = this.querySelector('.ripple');
    if (old) old.remove();
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x    = e.clientX - rect.left - size / 2;
    const y    = e.clientY - rect.top  - size / 2;
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
    this.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
});


/* ── 2b. CLICK RIPPLE — 画面全体 ── */
document.addEventListener('click', (e) => {
  if (e.target.closest('.btn')) return; // ボタンは 2a に任せる

  const el = document.createElement('div');
  el.classList.add('click-ripple');
  el.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;`;
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
});


/* ── 3. CURSOR SPARKLE TRAIL ── */
(function () {
  const COLORS = [
    'rgba(126,200,227,',
    'rgba(255,255,255,',
    'rgba(74,158,206,',
    'rgba(200,220,255,',
  ];

  let lastX = -999, lastY = -999;

  function spawnSparkle(x, y) {
    const el    = document.createElement('div');
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const size  = 3 + Math.random() * 5;
    const angle = Math.random() * 360;
    const dist  = 8 + Math.random() * 18;
    const dx    = Math.cos(angle * Math.PI / 180) * dist;
    const dy    = Math.sin(angle * Math.PI / 180) * dist;

    el.classList.add('cursor-sparkle');
    el.style.cssText = `
      left:${x}px; top:${y}px;
      width:${size}px; height:${size}px;
      background:${color}0.9);
      --dx:${dx}px; --dy:${dy}px;
      box-shadow:0 0 ${size * 2}px ${color}0.6);
    `;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }

  document.addEventListener('mousemove', (e) => {
    const dx   = e.clientX - lastX;
    const dy   = e.clientY - lastY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 6) return;
    lastX = e.clientX;
    lastY = e.clientY;
    const count = Math.min(Math.floor(dist / 6), 3);
    for (let i = 0; i < count; i++) spawnSparkle(e.clientX, e.clientY);
  });
})();


/* ── 4. SCROLL REVEAL ── */
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = (i % 4) * 0.08 + 's';
  obs.observe(el);
});
