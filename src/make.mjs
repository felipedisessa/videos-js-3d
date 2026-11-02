// Gera os vídeos. Exemplos:
//   npm run video -- chiclete                   vídeo final (voz → áudio → render → MP4)
//   npm run video -- all                        todos os roteiros
//   npm run stills -- buraco                    só miniaturas de conferência (build/<id>/sheet.jpg)
//   npm run audio -- lua                        só narração, timeline e mixagem
//   npm run video -- sal --tts piper --voz jeff-medium
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { lerConfig } from './config.mjs';
import { carregarRoteiros, validarRoteiro } from './roteiros.mjs';
import { gerarVoz, montarTimeline, pastaBuild, escolherVoz } from './voz.mjs';
import { mixar, SFX } from './audio.mjs';
import { renderizarStills, renderizarVideo } from './render.mjs';
import { escreverLeiame, PASTA_SEM_MUSICA } from './leiame.mjs';
import { rodarFfmpeg } from './util/midia.mjs';

const { values: op, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    stills: { type: 'boolean', default: false },
    'so-audio': { type: 'boolean', default: false },
    'reusar-video': { type: 'boolean', default: false },
    tts: { type: 'string' },
    voz: { type: 'string' },
    saida: { type: 'string' },
    ajuda: { type: 'boolean', short: 'h', default: false },
  },
});

const roteiros = await carregarRoteiros();
if (op.ajuda) {
  console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('\n').filter((l) => l.startsWith('//')).join('\n'));
  console.log(`\nVídeos: ${Object.keys(roteiros).join(', ')}\nOpções: --stills --so-audio --reusar-video --tts <edge|piper|sistema|azure|elevenlabs> --voz <id> --saida <pasta>`);
  process.exit(0);
}

const cfg = lerConfig(op);
const projetos = Object.keys(roteiros).filter((id) => roteiros[id].origem === 'projeto');
const ids = !positionals.length || positionals.includes('all') ? projetos : positionals;
if (!ids.length) {
  console.error(`Nenhum projeto em ${cfg.projetos}. Crie um com: npm run novo -- <id> "Título" (ou rode um exemplo: npm run video -- chiclete)`);
  process.exit(1);
}
const desconhecidos = ids.filter((id) => !roteiros[id]);
if (desconhecidos.length) {
  console.error(`Vídeo(s) desconhecido(s): ${desconhecidos.join(', ')}. Disponíveis: ${Object.keys(roteiros).join(', ')}`);
  process.exit(1);
}

let falhas = 0;
for (const id of ids) {
  const roteiro = roteiros[id];
  console.log(`\n== ${id} ==`);
  try {
    const erros = validarRoteiro(roteiro, { efeitos: Object.keys(SFX) });
    if (erros.length) throw new Error(`roteiro inválido:\n  - ${erros.join('\n  - ')}`);
    const { p, voz } = escolherVoz(roteiro, cfg);
    console.log(`  voz: ${p.nome} / ${voz || 'padrão do sistema'}`);
    const dir = pastaBuild(id);
    fs.mkdirSync(dir, { recursive: true });
    await gerarVoz(roteiro, cfg);
    const tl = montarTimeline(roteiro, cfg.fps);
    fs.writeFileSync(path.join(dir, 'timeline.json'), JSON.stringify(tl, null, 1));
    console.log(`  duração: ${tl.dur.toFixed(2)}s, ${tl.beats.length} cenas`);

    if (op.stills) {
      const tempos = tl.beats.flatMap((b) => [0.15, 0.5, 0.85].map((k) => b.start + b.dur * k));
      const pasta = path.join(dir, 'stills');
      await renderizarStills(id, tl, tempos, pasta, cfg);
      const folha = path.join(dir, 'sheet.jpg');
      rodarFfmpeg(['-i', path.join(pasta, 's%03d.jpg'), '-vf', `scale=360:640,tile=6x${Math.ceil(tempos.length / 6)}`, '-frames:v', '1', '-q:v', '3', folha]);
      console.log(`  stills em ${folha}`);
      continue;
    }

    mixar(tl, path.join(dir, 'mix.wav'), { musica: true });
    mixar(tl, path.join(dir, 'mix-sem-musica.wav'), { musica: false });
    if (op['so-audio']) continue;

    const video = path.join(dir, 'video.mp4');
    if (!op['reusar-video'] || !fs.existsSync(video)) {
      const t0 = Date.now();
      await renderizarVideo(id, tl, video, cfg);
      console.log(`  render: ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    fs.mkdirSync(path.join(cfg.saida, PASTA_SEM_MUSICA), { recursive: true });
    const juntar = (wav, saida) => rodarFfmpeg([
      '-i', video, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
      '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k',
      '-shortest', '-movflags', '+faststart', saida,
    ]);
    const final = path.join(cfg.saida, `${tl.arquivo}.mp4`);
    juntar(path.join(dir, 'mix.wav'), final);
    juntar(path.join(dir, 'mix-sem-musica.wav'), path.join(cfg.saida, PASTA_SEM_MUSICA, `${tl.arquivo} (sem musica).mp4`));
    fs.writeFileSync(path.join(dir, 'final.json'), JSON.stringify({ dur: tl.dur, tts: p.nome, voz, arquivo: final, data: new Date().toISOString() }, null, 1));
    console.log(`  pronto: ${final}`);
  } catch (e) {
    falhas++;
    console.error(`  ERRO em ${id}: ${e.message}`);
  }
}

if (!op.stills && !op['so-audio']) console.log(`\nLEIA-ME atualizado: ${escreverLeiame(Object.fromEntries(projetos.map((id) => [id, roteiros[id]])), cfg.saida)}`);
if (falhas) {
  console.error(`\n${falhas} vídeo(s) com erro. Rode "npm run doctor" para checar o ambiente.`);
  process.exit(1);
}
