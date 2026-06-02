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
    const count = Math.floor((W * H) / 8000); // 画面サイズに比例
    for (let i = 0; i < count; i++) {
      const size = randomBetween(0.4, 2.2);
      particles.push({
        x:     randomBetween(0, W),
        y:     randomBetween(0, H),
        size,
        baseSize: size,
        speedX: randomBetween(-0.12, 0.12),
        speedY: randomBetween(-0.18, -0.04),
        opacity: randomBetween(0.1, 0.7),
        // 点滅周期をランダムにずらす
        blinkOffset: randomBetween(0, Math.PI * 2),
        blinkSpeed:  randomBetween(0.005, 0.018),
        // 色：白 or 薄い青
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
      // 点滅（サインカーブで opacity を揺らす）
      const blink = 0.5 + 0.5 * Math.sin(frame * p.blinkSpeed + p.blinkOffset);
      const alpha = p.opacity * blink;
      const size  = p.baseSize * (0.8 + 0.4 * blink);

      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);

      if (p.hue === 0) {
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      } else {
        ctx.fillStyle = `hsla(${p.hue},${p.sat}%,80%,${alpha})`;
      }
      ctx.fill();

      // 少し大きい粒にグロウ
      if (p.baseSize > 1.5) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 2.5, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 2.5);
        grad.addColorStop(0, `rgba(126,200,227,${alpha * 0.3})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // 移動
      p.x += p.speedX;
      p.y += p.speedY;

      // 画面外に出たら反対側から再登場
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


/* ── 2. RIPPLE (波紋エフェクト) ── */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function (e) {
    // すでにあるリップルを削除
    const old = this.querySelector('.ripple');
    if (old) old.remove();

    const rect   = this.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height) * 2;
    const x      = e.clientX - rect.left - size / 2;
    const y      = e.clientY - rect.top  - size / 2;

    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    ripple.style.cssText = `
      width:${size}px; height:${size}px;
      left:${x}px; top:${y}px;
    `;
    this.appendChild(ripple);

    // アニメーション終了後に削除
    ripple.addEventListener('animationend', () => ripple.remove());
  });
});


/* ── 3. SCROLL REVEAL ── */
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = (i % 4) * 0.08 + 's';
  obs.observe(el);
});
