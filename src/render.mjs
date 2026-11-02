// Renderiza os frames no Edge headless e manda direto para o ffmpeg.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import puppeteer from 'puppeteer-core';
import ffmpeg from 'ffmpeg-static';
import { iniciarServidor } from './servidor.mjs';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function abrir(id, timeline) {
  const { server, porta } = await iniciarServidor('.');
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: true,
    protocolTimeout: 0,
    args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--disable-background-timer-throttling', '--mute-audio'],
  });
  const page = await browser.newPage();
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warn') console.log(`  [página] ${m.text()}`); });
  page.on('pageerror', (e) => console.log(`  [erro na página] ${e.message}`));
  await page.goto(`http://127.0.0.1:${porta}/web/index.html?v=${id}`);
  await page.waitForFunction('window.__pronto || window.__erro', { timeout: 120000 });
  const erro = await page.evaluate(() => window.__erro);
  if (erro) throw new Error(erro);
  await page.evaluate((tl) => window.__setup(tl), timeline);
  const fechar = async () => { await browser.close(); server.close(); };
  return { page, fechar };
}

const frameBuf = (dataUrl) => Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');

export async function renderizarStills(id, timeline, tempos, pasta) {
  fs.rmSync(pasta, { recursive: true, force: true });
  fs.mkdirSync(pasta, { recursive: true });
  const { page, fechar } = await abrir(id, timeline);
  try {
    for (const [i, t] of tempos.entries()) {
      const url = await page.evaluate((tt) => window.__frame(tt, 0.85), t);
      fs.writeFileSync(path.join(pasta, `s${String(i).padStart(3, '0')}.jpg`), frameBuf(url));
    }
  } finally {
    await fechar();
  }
}

export async function renderizarVideo(id, timeline, saida) {
  const { page, fechar } = await abrir(id, timeline);
  const fps = timeline.fps;
  const total = Math.round(timeline.dur * fps);
  const enc = spawn(ffmpeg, [
    '-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
    '-r', String(fps), '-movflags', '+faststart', saida,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const fim = new Promise((res, rej) => enc.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg saiu com ' + c)))));
  const t0 = Date.now();
  try {
    for (let f = 0; f < total; f++) {
      const url = await page.evaluate((tt) => window.__frame(tt, 0.94), f / fps);
      if (!enc.stdin.write(frameBuf(url))) await new Promise((r) => enc.stdin.once('drain', r));
      if (f % 150 === 0) console.log(`  frame ${f}/${total} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    }
  } finally {
    enc.stdin.end();
    await fechar();
  }
  await fim;
}
