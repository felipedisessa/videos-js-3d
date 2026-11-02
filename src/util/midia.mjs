// Utilitários de áudio: ffmpeg (decodificar/reamostrar) e escrita de WAV.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';
import { SR } from '../config.mjs';

export const ffmpeg = ffmpegPath;

export function rodarFfmpeg(args) {
  const r = spawnSync(ffmpeg, ['-y', '-v', 'error', ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(`ffmpeg falhou: ${r.stderr}`);
  return r;
}

/** Decodifica qualquer arquivo de áudio para Float32 mono na taxa do projeto. */
export function decodificar(arquivo, taxa = SR) {
  const r = spawnSync(ffmpeg, ['-v', 'error', '-i', arquivo, '-ac', '1', '-ar', String(taxa), '-f', 'f32le', '-'], { maxBuffer: 512 * 1024 * 1024 });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(`ffmpeg não conseguiu ler ${arquivo}: ${r.stderr}`);
  const buf = r.stdout;
  return new Float32Array(buf.buffer, buf.byteOffset, buf.length / 4).slice();
}

/** WAV PCM 16-bit. `canais` = array de Float32Array (1 = mono, 2 = estéreo). */
export function wavPcm16(canais, taxa) {
  const n = canais[0].length;
  const nc = canais.length;
  const out = Buffer.alloc(44 + n * nc * 2);
  out.write('RIFF', 0);
  out.writeUInt32LE(36 + n * nc * 2, 4);
  out.write('WAVE', 8);
  out.write('fmt ', 12);
  out.writeUInt32LE(16, 16);
  out.writeUInt16LE(1, 20);
  out.writeUInt16LE(nc, 22);
  out.writeUInt32LE(taxa, 24);
  out.writeUInt32LE(taxa * nc * 2, 28);
  out.writeUInt16LE(nc * 2, 32);
  out.writeUInt16LE(16, 34);
  out.write('data', 36);
  out.writeUInt32LE(n * nc * 2, 40);
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < nc; c++) {
      const v = Math.max(-1, Math.min(1, canais[c][i]));
      out.writeInt16LE(Math.round(v * 32767), 44 + (i * nc + c) * 2);
    }
  }
  return out;
}

export function salvarWav(arquivo, amostras, taxa) {
  fs.writeFileSync(arquivo, wavPcm16([amostras], taxa));
}
