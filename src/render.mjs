/* global window */
// Renderiza os frames num navegador headless e manda direto para o ffmpeg.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import puppeteer from 'puppeteer-core';
import { RAIZ } from './config.mjs';
import { ffmpeg } from './util/midia.mjs';
import { iniciarServidor } from './servidor.mjs';
import { acharNavegador, flagsGpu } from './navegador.mjs';

async function abrir(id, timeline, cfg) {
  const { server, porta } = await iniciarServidor(RAIZ);
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: acharNavegador(cfg.navegador),
      headless: true,
      protocolTimeout: 0,
      args: [...flagsGpu(), '--disable-background-timer-throttling', '--mute-audio'],
    });
    const page = await browser.newPage();
    page.on('console', (m) => {
      if ((m.type() === 'error' || m.type() === 'warn') && !/favicon|404/.test(m.text())) console.log(`  [página] ${m.text()}`);
    });
    page.on('pageerror', (e) => console.log(`  [erro na página] ${e.message}`));
    await page.goto(`http://127.0.0.1:${porta}/web/index.html?v=${encodeURIComponent(id)}`);
    await page.waitForFunction('window.__pronto || window.__erro', { timeout: 120000 });
    const erro = await page.evaluate(() => window.__erro);
    if (erro) throw new Error(erro);
    await page.evaluate((tl) => window.__setup(tl), timeline);
    return { page, fechar: async () => { await browser.close(); server.close(); } };
  } catch (e) {
    await browser?.close();
    server.close();
    throw e;
  }
}

const frameBuf = (dataUrl) => Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');

export async function renderizarStills(id, timeline, tempos, pasta, cfg) {
  fs.rmSync(pasta, { recursive: true, force: true });
  fs.mkdirSync(pasta, { recursive: true });
  const { page, fechar } = await abrir(id, timeline, cfg);
  try {
    for (const [i, t] of tempos.entries()) {
      const url = await page.evaluate((tt) => window.__frame(tt, 0.85), t);
      fs.writeFileSync(path.join(pasta, `s${String(i).padStart(3, '0')}.jpg`), frameBuf(url));
    }
  } finally {
    await fechar();
  }
}

export async function renderizarVideo(id, timeline, saida, cfg) {
  const { page, fechar } = await abrir(id, timeline, cfg);
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
