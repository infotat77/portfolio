// npm install canvas  →  node og-generate.js
const { createCanvas } = require('canvas');
const fs = require('fs');

const W = 1200, H = 630;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

// 背景
ctx.fillStyle = '#0a0a0f';
ctx.fillRect(0, 0, W, H);

// グリッドライン（装飾）
ctx.strokeStyle = 'rgba(255,255,255,0.04)';
ctx.lineWidth = 1;
for (let x = 0; x < W; x += 60) {
  ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
}
for (let y = 0; y < H; y += 60) {
  ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
}

// アクセントライン
ctx.strokeStyle = 'rgba(72,187,120,0.3)';
ctx.lineWidth = 1;
ctx.beginPath(); ctx.moveTo(60, 60); ctx.lineTo(W - 60, 60); ctx.stroke();
ctx.beginPath(); ctx.moveTo(60, H - 60); ctx.lineTo(W - 60, H - 60); ctx.stroke();

// 名前
ctx.fillStyle = '#e2e8f0';
ctx.font = 'bold 160px sans-serif';
ctx.fillText('TaT', 80, 400);

// サブテキスト
ctx.fillStyle = '#4a5568';
ctx.font = '28px monospace';
ctx.fillText('IT法人営業 8年 × Claude Code  /  業務委託受付中', 80, 470);

// 右下タグ
ctx.fillStyle = '#48bb78';
ctx.font = '20px monospace';
ctx.fillText('tatsuya-portfolio.vercel.app', W - 420, H - 80);

const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('og.png', buffer);
console.log('og.png を生成しました');
