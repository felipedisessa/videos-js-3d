// Narração (voz neural do Edge) com o tempo de cada palavra, e montagem da timeline do vídeo.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { VIDEOS } from '../web/roteiros.js';

export const SR = 48000;
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

export async function gerarVoz(id) {
  const v = VIDEOS[id];
  const dir = path.join('build', id, 'voz');
  fs.mkdirSync(dir, { recursive: true });
  let tts = null;
  for (const [i, b] of v.beats.entries()) {
    const base = path.join(dir, `${i}-${b.id}`);
    const chave = `${v.voz}|${v.velocidade}|${b.texto}`;
    if (fs.existsSync(base + '.json') && JSON.parse(fs.readFileSync(base + '.json', 'utf8')).chave === chave) continue;
    if (!tts) {
      tts = new MsEdgeTTS();
      await tts.setMetadata(v.voz, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3, { wordBoundaryEnabled: true });
    }
    const tmp = base + '_tmp';
    fs.rmSync(tmp, { recursive: true, force: true });
    fs.mkdirSync(tmp);
    let r;
    for (let tentativa = 1; ; tentativa++) {
      try {
        r = await tts.toFile(tmp, b.texto, { rate: v.velocidade });
        break;
      } catch (e) {
        if (tentativa >= 3) throw e;
        tts.close();
        tts = new MsEdgeTTS();
        await tts.setMetadata(v.voz, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3, { wordBoundaryEnabled: true });
      }
    }
    const meta = JSON.parse(fs.readFileSync(r.metadataFilePath, 'utf8')).Metadata
      .filter((m) => m.Type === 'WordBoundary' && (m.Data.text.BoundaryType ?? 'WordBoundary') === 'WordBoundary')
      .map((m) => ({ w: m.Data.text.Text, s: m.Data.Offset / 1e7, e: (m.Data.Offset + m.Data.Duration) / 1e7 }));
    const dec = spawnSync(ffmpeg, ['-v', 'error', '-i', r.audioFilePath, '-ac', '1', '-ar', String(SR), '-f', 'f32le', base + '.f32']);
    if (dec.status !== 0) throw new Error('ffmpeg: ' + dec.stderr);
    const dur = fs.statSync(base + '.f32').size / 4 / SR;
    fs.writeFileSync(base + '.json', JSON.stringify({ chave, dur, words: meta }, null, 1));
    fs.rmSync(tmp, { recursive: true, force: true });
    console.log(`  voz ${id}/${b.id}: ${dur.toFixed(2)}s`);
  }
  tts?.close();
}

// alinha as palavras do TTS com o texto original (para manter pontuação na legenda)
function alinhar(texto, words) {
  const tokens = texto.split(/\s+/).filter(Boolean);
  let j = 0;
  return words.map((w) => {
    const alvo = norm(w.w);
    for (let k = j; k < Math.min(tokens.length, j + 4); k++) {
      if (norm(tokens[k]).includes(alvo) || alvo.includes(norm(tokens[k]))) {
        // o TTS às vezes junta "38 minutos" numa palavra só: junta os tokens correspondentes
        let txt = tokens[k];
        let fim = k + 1;
        while (fim < tokens.length && norm(txt).length < alvo.length && alvo.startsWith(norm(txt + tokens[fim]))) txt += ' ' + tokens[fim++];
        j = fim;
        return { ...w, txt };
      }
    }
    return { ...w, txt: w.w };
  });
}

function resolverCue(spec, b, ctx) {
  if (typeof spec === 'number') return spec;
  const m = /^(.*?)([+-]\d*\.?\d+)?$/.exec(spec);
  let base = m[1];
  const off = m[2] ? parseFloat(m[2]) : 0;
  let t;
  if (base === '>fim') t = ctx.falaFim;
  else if (base.startsWith('%')) t = (parseFloat(base.slice(1)) / 100) * ctx.dur;
  else if (/^\d*\.?\d+$/.test(base)) t = parseFloat(base);
  else if (b.cues && b.cues[base] !== undefined && b.cues[base] !== spec) t = resolverCue(b.cues[base], b, ctx);
  else {
    if (base.startsWith('w:')) base = base.slice(2);
    let n = 1;
    if (base.includes('@')) [base, n] = [base.split('@')[0], parseInt(base.split('@')[1], 10)];
    const alvo = norm(base);
    const achados = ctx.words.filter((w) => norm(w.txt).startsWith(alvo) || norm(w.w).startsWith(alvo));
    if (!achados[n - 1]) throw new Error(`cue "${spec}" não encontrada no beat ${b.id}`);
    t = achados[n - 1].s;
  }
  return t + off;
}

export function montarTimeline(id, fps = 30) {
  const v = VIDEOS[id];
  const dir = path.join('build', id, 'voz');
  let t = 0;
  const beats = v.beats.map((b, i) => {
    const voz = JSON.parse(fs.readFileSync(path.join(dir, `${i}-${b.id}.json`), 'utf8'));
    const pre = b.pre ?? 0.05;
    const ultima = voz.words[voz.words.length - 1];
    const falaFim = pre + ultima.e;
    const dur = falaFim + (b.post ?? 0.14) + (b.hold ?? 0);
    const words = alinhar(b.texto, voz.words).map((w) => ({ ...w, s: w.s + pre, e: w.e + pre }));
    // destaques: 'palavra' (todas) ou 'palavra@n' (só a n-ésima)
    for (const d of b.destaque ?? []) {
      const [alvo, nStr] = d.split('@');
      const achados = words.filter((w) => norm(w.txt).startsWith(norm(alvo)));
      (nStr ? [achados[parseInt(nStr, 10) - 1]] : achados).forEach((w) => w && (w.destaque = true));
    }
    const ctx = { falaFim, dur, words };
    const cues = {};
    for (const [k, spec] of Object.entries(b.cues ?? {})) cues[k] = resolverCue(spec, b, ctx);
    const sfx = (b.sfx ?? []).map(([tipo, spec, ganho = 1]) => ({ tipo, t: resolverCue(spec, b, ctx), ganho }));
    const out = { id: b.id, start: t, dur, pre, falaFim, words, cues, sfx, audio: path.join(dir, `${i}-${b.id}.f32`) };
    t += dur;
    return out;
  });
  // arredonda a duração para frames inteiros
  const total = Math.ceil(t * fps) / fps;
  return { id, fps, dur: total, beats, musica: v.musica, arquivo: v.arquivo };
}
