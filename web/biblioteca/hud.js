// Elementos 2D por cima do vídeo: pílula de chamada, estrela de brilho, barra de porcentagem e gráfico de barras.
import { W, seg, smooth, textoContorno } from '../engine.js';

export function estrela(ctx, x, y, r) {
  if (r <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const rr = i % 2 ? r * 0.28 : r;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = '#fff6a8';
  ctx.shadowColor = '#ffe135';
  ctx.shadowBlur = 20;
  ctx.fill();
  ctx.restore();
}

export function pilula(ctx, txt, x, y, k) {
  if (k <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.font = '900 54px Montserrat';
  const w = ctx.measureText(txt).width + 80;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -48, w, 96, 48);
  ctx.fillStyle = '#ff2d55';
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#111';
  ctx.stroke();
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(txt, 0, 3);
  ctx.restore();
}

export function barra(ctx, rotulo, frac, cor, y, k = 1) {
  if (k <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, k * 1.5);
  const x0 = 140;
  const larg = 800;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.beginPath(); ctx.roundRect(x0, y, larg, 70, 35); ctx.fill();
  ctx.fillStyle = cor;
  ctx.beginPath(); ctx.roundRect(x0, y, Math.max(70, larg * frac), 70, 35); ctx.fill();
  ctx.lineWidth = 8; ctx.strokeStyle = '#111';
  ctx.beginPath(); ctx.roundRect(x0, y, larg, 70, 35); ctx.stroke();
  ctx.restore();
  textoContorno(ctx, rotulo, W / 2, y - 48, { size: 54, cor: '#fff' });
  textoContorno(ctx, `${Math.round(frac * 100)}%`, x0 + Math.max(70, larg * frac) - 70, y + 36, { size: 46, cor: '#fff', contorno: 0.18 });
}

export function grafico(ctx, linhas, t) {
  linhas.forEach(([nome, v, cor, t0], i) => {
    const k = seg(t, t0, t0 + 0.5);
    if (t < t0) return;
    const y = 240 + i * 120;
    const larg = Math.max(18, (v / 200) * 540 * smooth(k));
    ctx.save();
    ctx.globalAlpha = Math.min(1, k * 3);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath(); ctx.roundRect(60, y - 44, 960, 88, 44); ctx.fill();
    ctx.fillStyle = cor;
    ctx.beginPath(); ctx.roundRect(330, y - 26, larg, 52, 26); ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = '#111'; ctx.stroke();
    ctx.restore();
    textoContorno(ctx, nome, 195, y, { size: 46, cor: '#fff', contorno: 0.18 });
    textoContorno(ctx, `${Math.round(v * smooth(k))} KM/H`, Math.min(330 + larg + 115, 940), y, { size: 46, cor: '#ffe135', contorno: 0.18 });
  });
}
