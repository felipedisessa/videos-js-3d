// Uso:
//   node src/make.mjs chiclete            → vídeo final na Área de Trabalho
//   node src/make.mjs all                 → os três
//   node src/make.mjs buraco --stills     → só miniaturas de conferência (build/<id>/sheet.jpg)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
import { VIDEOS } from '../web/roteiros.js';
import { gerarVoz, montarTimeline } from './voz.mjs';
import { mixar } from './audio.mjs';
import { renderizarStills, renderizarVideo } from './render.mjs';

const DESTINO = path.join(os.homedir(), 'Desktop', 'Videos Canal Dark 3D');
const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
let ids = args.filter((a) => !a.startsWith('--'));
if (!ids.length || ids.includes('all')) ids = Object.keys(VIDEOS);

function ff(argv) {
  const r = spawnSync(ffmpeg, ['-y', '-v', 'error', ...argv], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error('ffmpeg: ' + r.stderr);
}

for (const id of ids) {
  console.log(`\n== ${id} ==`);
  const dir = path.join('build', id);
  fs.mkdirSync(dir, { recursive: true });
  await gerarVoz(id);
  const tl = montarTimeline(id);
  fs.writeFileSync(path.join(dir, 'timeline.json'), JSON.stringify(tl, null, 1));
  console.log(`  duração: ${tl.dur.toFixed(2)}s, ${tl.beats.length} cenas`);

  if (flags.has('--stills')) {
    const tempos = tl.beats.flatMap((b) => [0.15, 0.5, 0.85].map((k) => b.start + b.dur * k));
    const pasta = path.join(dir, 'stills');
    await renderizarStills(id, tl, tempos, pasta);
    ff(['-i', path.join(pasta, 's%03d.jpg'), '-vf', 'scale=360:640,tile=6x' + Math.ceil(tempos.length / 6), '-frames:v', '1', '-q:v', '3', path.join(dir, 'sheet.jpg')]);
    console.log(`  stills em ${path.join(dir, 'sheet.jpg')}`);
    continue;
  }

  mixar(tl, path.join(dir, 'mix.wav'), { musica: true });
  mixar(tl, path.join(dir, 'mix-sem-musica.wav'), { musica: false });
  if (flags.has('--so-audio')) continue;

  const video = path.join(dir, 'video.mp4');
  if (!flags.has('--reusar-video') || !fs.existsSync(video)) {
    const t0 = Date.now();
    await renderizarVideo(id, tl, video);
    console.log(`  render: ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  fs.mkdirSync(path.join(DESTINO, 'sem musica (para usar som em alta do TikTok)'), { recursive: true });
  const juntar = (wav, saida) => ff([
    '-i', video, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
    '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k',
    '-shortest', '-movflags', '+faststart', saida,
  ]);
  juntar(path.join(dir, 'mix.wav'), path.join(DESTINO, `${tl.arquivo}.mp4`));
  juntar(path.join(dir, 'mix-sem-musica.wav'), path.join(DESTINO, 'sem musica (para usar som em alta do TikTok)', `${tl.arquivo} (sem musica).mp4`));
  console.log(`  pronto: ${path.join(DESTINO, tl.arquivo)}.mp4`);
}
