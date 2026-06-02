self.onmessage = (e) => {
  const { type, canvas, chars, color, width, height } = e.data;
  if (type !== 'init') return;

  const ctx = canvas.getContext('2d');
  const W = width, H = height;
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
    ctx.font = '11px monospace';
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
    self.requestAnimationFrame(draw);
  }
  draw();
};
