(function sidePanels(){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const CHARS = ['·','╱','╲','│','─','░','▒','▁','▂','▃','▄','▇','◦','○','◌','→','—','#','*','~'];
  const COLOR = [99, 220, 160];
  const mouse = { x: -999, y: -999 };
  addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

  ['left', 'right'].forEach(side => {
    const c = document.getElementById('blog-canvas-' + side);
    if (!c) return;

    const ctx = c.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const CW = 18, CH = 22;
    let W, H, cols, rows, grid, frame = 0, rafId = null, visible = false;

    function resize() {
      W = c.offsetWidth; H = window.innerHeight;
      c.width  = W * dpr; c.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(1, Math.ceil(W / CW));
      rows = Math.ceil(H / CH);
      grid = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => ({
          ch:    CHARS[Math.floor(Math.random() * CHARS.length)],
          v:     Math.random() * 0.3 + 0.02,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.005 + 0.002,
        }))
      );
    }

    function draw() {
      rafId = null;
      if (!visible) return;
      frame++;
      ctx.fillStyle = 'rgba(10,10,15,0.2)';
      ctx.fillRect(0, 0, W, H);
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textBaseline = 'top';
      const rect = c.getBoundingClientRect();
      const lx = mouse.x - rect.left;
      const ly = mouse.y - rect.top;
      for (let r = 0; r < rows; r++) {
        for (let col = 0; col < cols; col++) {
          const cell = grid[r]?.[col]; if (!cell) continue;
          const x = col * CW, y = r * CH;
          const dx = x - lx, dy = y - ly;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const hover = Math.max(0, 1 - dist / 140);
          const wave = 0.5 + 0.5 * Math.sin(frame * cell.speed + cell.phase);
          const alpha = Math.min(1, cell.v * (0.1 + wave * 0.5) + hover * 0.75);
          if (hover > 0.5 && Math.random() < 0.12)
            cell.ch = CHARS[Math.floor(Math.random() * CHARS.length)];
          ctx.fillStyle = `rgba(${COLOR[0]},${COLOR[1]},${COLOR[2]},${alpha})`;
          ctx.fillText(cell.ch, x, y);
        }
      }
      rafId = requestAnimationFrame(draw);
    }

    const io = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible && !rafId) { resize(); rafId = requestAnimationFrame(draw); }
    }, { threshold: 0 });
    io.observe(c);

    let rt;
    addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => { if (visible) resize(); }, 120);
    });
  });
})();
