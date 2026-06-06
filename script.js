/* ───── Loader ───── */
(function loader(){
  const fill = document.getElementById('loader-fill');
  const pct  = document.getElementById('loader-pct');
  const el   = document.getElementById('loader');
  if (!fill || !pct || !el) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const dismiss = () => {
    el.classList.add('is-gone');
    el.setAttribute('aria-hidden', 'true');
    setTimeout(() => el.remove(), 700);
  };

  if (prefersReduced) { dismiss(); return; }

  let p = 0;
  let done = false;

  const finish = () => {
    if (done) return;
    done = true;
    fill.style.width = '100%';
    pct.textContent = '100';
    setTimeout(dismiss, 280);
  };

  const maxTimer = setTimeout(finish, 800);

  const tick = () => {
    if (done) return;
    p += Math.random() * 14 + 6;
    if (p >= 100) { clearTimeout(maxTimer); finish(); return; }
    fill.style.width = p + '%';
    pct.textContent = String(Math.floor(p)).padStart(3, '0');
    setTimeout(tick, 50 + Math.random() * 70);
  };
  tick();
})();

/* ───── Shared mouse state ───── */
const mouse = { x: innerWidth / 2, y: innerHeight / 2 };
addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

/* ───── Cursor ───── */
(function cursor(){
  const cur = document.getElementById('cursor');
  if (!cur) return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;
  let cx = mouse.x, cy = mouse.y;
  addEventListener('mousedown', () => cur.classList.add('is-press'));
  addEventListener('mouseup',   () => cur.classList.remove('is-press'));
  document.addEventListener('focusin', e => {
    const rect = e.target.getBoundingClientRect();
    mouse.x = rect.left + rect.width / 2;
    mouse.y = rect.top + rect.height / 2;
  });
  (function loop(){
    cx += (mouse.x - cx) * 0.28;
    cy += (mouse.y - cy) * 0.28;
    cur.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('a, button, .work, .blog__item, .stack__row, .channel, .event').forEach(el => {
    el.addEventListener('mouseenter', () => cur.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => cur.classList.remove('is-hover'));
  });
})();

/* ───── Hero ASCII canvas ───── */
(function heroCanvas(){
  const c = document.getElementById('hero-canvas');
  if (!c) return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;
  const ctx = c.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W, H;
  const chars = '▁▂▃▄▅▆▇█·•◦◯○◌◍◉╱╲─━│┃═║╴╶╸╺  ';
  const charsArr = chars.split('');
  let cols = 0, rows = 0;
  const cellW = 18, cellH = 22;
  let grid = [];
  let frame = 0;
  let rafId = null;
  let isVisible = false;

  let resizeTimer;
  function resize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      W = c.clientWidth = innerWidth;
      H = c.clientHeight = c.parentElement.offsetHeight;
      c.width = W * dpr; c.height = H * dpr;
      c.style.width = W + 'px'; c.style.height = H + 'px';
      ctx.scale(dpr, dpr);
      cols = Math.ceil(W / cellW);
      rows = Math.ceil(H / cellH);
      grid = [];
      for (let r = 0; r < rows; r++) {
        const row = [];
        for (let col = 0; col < cols; col++) {
          row.push({
            ch: charsArr[Math.floor(Math.random() * charsArr.length)],
            v: Math.random() * 0.6 + 0.05,
            phase: Math.random() * Math.PI * 2,
          });
        }
        grid.push(row);
      }
    }, 120);
  }
  resize();
  addEventListener('resize', resize);

  const io = new IntersectionObserver(entries => {
    isVisible = entries[0].isIntersecting;
    if (isVisible && !rafId) rafId = requestAnimationFrame(draw);
  }, { threshold: 0.01 });
  io.observe(c);

  function draw() {
    rafId = null;
    if (!isVisible) return;
    frame++;
    const mx = mouse.x - c.getBoundingClientRect().left;
    const my = mouse.y - c.getBoundingClientRect().top;
    ctx.fillStyle = 'rgba(10, 10, 15, 0.22)';
    ctx.fillRect(0, 0, W, H);
    ctx.font = '14px "JetBrains Mono", monospace';
    ctx.textBaseline = 'top';
    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < cols; col++) {
        const cell = grid[r][col];
        const x = col * cellW;
        const y = r * cellH;
        const dx = x + cellW/2 - mx;
        const dy = y + cellH/2 - my;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const mouseInfluence = Math.max(0, 1 - dist / 260);
        const wave = 0.5 + 0.5 * Math.sin((frame * 0.012) + cell.phase + (x + y) * 0.004);
        const baseAlpha = cell.v * (0.22 + wave * 0.55);
        const finalAlpha = Math.min(1, baseAlpha + mouseInfluence * 0.95);
        if (mouseInfluence > 0.5 && Math.random() < 0.18) {
          cell.ch = charsArr[Math.floor(Math.random() * charsArr.length)];
        }
        if (mouseInfluence > 0.4) {
          ctx.fillStyle = `rgba(226, 232, 240, ${finalAlpha})`;
        } else {
          ctx.fillStyle = `rgba(226, 232, 240, ${finalAlpha * 0.45})`;
        }
        ctx.fillText(cell.ch, x, y);
      }
    }
    rafId = requestAnimationFrame(draw);
  }
})();

/* ───── Glow parallax ───── */
(function glow(){
  const g1 = document.getElementById('glow-1');
  const g2 = document.getElementById('glow-2');
  if (!g1 || !g2) return;
  addEventListener('mousemove', () => {
    const x = (mouse.x / innerWidth - 0.5);
    const y = (mouse.y / innerHeight - 0.5);
    g1.style.transform = `translate(${x * 60}px, ${y * 60}px)`;
    g2.style.transform = `translate(${-x * 80}px, ${-y * 80}px)`;
  });
})();

/* ───── Audio toggle (decorative) ───── */
(function audio(){
  const btn = document.getElementById('audio-toggle');
  const lbl = document.getElementById('audio-label');
  if (!btn || !lbl) return;
  btn.addEventListener('click', () => {
    btn.classList.toggle('is-muted');
    const muted = btn.classList.contains('is-muted');
    lbl.textContent = muted ? 'SOUND OFF' : 'SOUND ON';
    btn.setAttribute('aria-pressed', muted ? 'true' : 'false');
  });
})();


/* ───── Work cover ASCII canvas ───── */
(function workCovers(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const configs = [
    { id: 'wc-1', chars: ['const','let','async','await','fetch','=>','{}','[]','()'], color: [99,179,237] },
    { id: 'wc-2', chars: ['▁','▂','▃','▄','▅','▆','▇','█','░','▒','▓','╱','╲','│','─'], color: [252,176,64] },
    { id: 'wc-3', chars: ['◦','○','◎','●','◯','◌','▸','△','▽','◇','◆','□','■'], color: [104,211,145] },
    { id: 'wc-4', chars: ['+','−','×','÷','=','%','$','¥','↑','↓','→','←','▲','▼'], color: [197,128,255] },
    { id: 'wc-5', chars: ['<','/','>','{','}','[',']','#','*','·','—','~','`'], color: [160,174,192] },
    { id: 'wc-6', chars: ['記','事','文','投','稿','A','I','自','動','生','成'], color: [94,234,212] },
    { id: 'wc-7', chars: ['SSH','LAN','WAN','VPN','192','255','RTX','UDP','TCP','→','⇄','#'], color: [0,180,255] },
    { id: 'wc-8', chars: ['◎','○','▲','△','×','馬','競','予','測','A','I'], color: [255,195,0] },
    { id: 'wc-9', chars: ['rm','-rf','del','GB','MB','~/','bin','log','tmp','↓','[]','{}'], color: [125,211,252] },
    { id: 'wc-10', chars: ['@','#','投','稿','自','動','→','↑','07','12','20','AM','PM'], color: [251,113,133] },
  ];

  const supportsOffscreen = typeof OffscreenCanvas !== 'undefined'
    && window.location.protocol !== 'file:';

  configs.forEach(({ id, chars, color }) => { try {
    const container = document.getElementById(id);
    if (!container) return;
    const c = document.createElement('canvas');
    container.insertBefore(c, container.firstChild);

    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.unobserve(container);

      const W = container.offsetWidth;
      const H = container.offsetHeight;
      c.width = W; c.height = H;

      if (supportsOffscreen) {
        const offscreen = c.transferControlToOffscreen();
        const worker = new Worker('worker-canvas.js');
        worker.postMessage({ type: 'init', canvas: offscreen, chars, color, width: W, height: H }, [offscreen]);
        return;
      }

      /* フォールバック: メインスレッド描画（Safari / Firefox） */
      const ctx = c.getContext('2d');
      const cW = 22, cH = 16;
      let frame = Math.random() * 200;
      const cols = Math.ceil(W / cW), rows = Math.ceil(H / cH);
      const grid = [];
      for (let r = 0; r < rows; r++) {
        const row = [];
        for (let col = 0; col < cols; col++) {
          row.push({
            ch: chars[Math.floor(Math.random() * chars.length)],
            v: Math.random() * 0.4 + 0.05,
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.008 + 0.004,
          });
        }
        grid.push(row);
      }
      function draw() {
        frame++;
        ctx.fillStyle = 'rgba(10,10,15,0.22)';
        ctx.fillRect(0, 0, W, H);
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.textBaseline = 'top';
        for (let r = 0; r < rows; r++) {
          for (let col = 0; col < cols; col++) {
            if (!grid[r]?.[col]) continue;
            const cell = grid[r][col];
            const wave = 0.5 + 0.5 * Math.sin(frame * cell.speed + cell.phase);
            const alpha = cell.v * (0.1 + wave * 0.55);
            ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${alpha})`;
            ctx.fillText(cell.ch, col * cW, r * cH);
          }
        }
        requestAnimationFrame(draw);
      }
      requestAnimationFrame(draw);
    }, { threshold: 0.1 });
    obs.observe(container);
  } catch (e) { console.warn(`workCovers: ${id} failed`, e); } });
})();

/* ───── Notes section canvas ───── */
(function notesCanvas(){
  const c = document.getElementById('notes-canvas');
  if (!c) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = c.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const chars = ['文','字','N','—','·','#','→','✦','01','//','{}','[]','<>','※','§'];
  const color = [99, 220, 160];
  let W, H, cols, rows, grid, frame = 0, rafId = null, isVisible = false;

  function resize() {
    W = c.clientWidth; H = c.clientHeight;
    c.width = W * dpr; c.height = H * dpr;
    ctx.scale(dpr, dpr);
    const cW = 28, cH = 20;
    cols = Math.ceil(W / cW); rows = Math.ceil(H / cH);
    grid = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let col = 0; col < cols; col++) {
        row.push({
          ch: chars[Math.floor(Math.random() * chars.length)],
          v: Math.random() * 0.35 + 0.03,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.006 + 0.002,
        });
      }
      grid.push(row);
    }
  }

  function draw() {
    rafId = null;
    if (!isVisible) return;
    frame++;
    ctx.fillStyle = 'rgba(10,10,15,0.18)';
    ctx.fillRect(0, 0, W, H);
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.textBaseline = 'top';
    const cW = 28, cH = 20;
    const mx = mouse.x - c.getBoundingClientRect().left;
    const my = mouse.y - c.getBoundingClientRect().top;
    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < cols; col++) {
        if (!grid[r]?.[col]) continue;
        const cell = grid[r][col];
        const x = col * cW, y = r * cH;
        const dx = x - mx, dy = y - my;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const hover = Math.max(0, 1 - dist / 180);
        const wave = 0.5 + 0.5 * Math.sin(frame * cell.speed + cell.phase);
        const alpha = Math.min(1, cell.v * (0.15 + wave * 0.5) + hover * 0.7);
        if (hover > 0.4 && Math.random() < 0.1) {
          cell.ch = chars[Math.floor(Math.random() * chars.length)];
        }
        ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${alpha})`;
        ctx.fillText(cell.ch, x, y);
      }
    }
    rafId = requestAnimationFrame(draw);
  }

  const io = new IntersectionObserver(entries => {
    isVisible = entries[0].isIntersecting;
    if (isVisible && !rafId) { resize(); rafId = requestAnimationFrame(draw); }
  }, { threshold: 0.01 });
  io.observe(c);

  addEventListener('resize', () => { if (isVisible) resize(); });
})();

/* ───── Hamburger / Drawer ───── */
(function nav(){
  const burger = document.querySelector('.chrome__burger');
  const drawer = document.getElementById('drawer-nav');
  if (!burger || !drawer) return;

  const getFocusable = () => [...drawer.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])')];

  function open() {
    drawer.classList.add('is-open');
    drawer.removeAttribute('aria-hidden');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    const items = getFocusable();
    if (items.length) items[0].focus();
  }

  function close() {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    burger.focus();
  }

  burger.addEventListener('click', () => {
    drawer.classList.contains('is-open') ? close() : open();
  });

  document.addEventListener('keydown', e => {
    if (!drawer.classList.contains('is-open')) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Tab') {
      const items = getFocusable();
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
  });

  drawer.addEventListener('click', e => { if (e.target === drawer) close(); });
})();
