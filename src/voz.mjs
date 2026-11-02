// Narração (qualquer provedor de voz) com o tempo de cada palavra, e montagem da timeline do vídeo.
import fs from 'node:fs';
import path from 'node:path';
import { RAIZ, SR, fatorVelocidade } from './config.mjs';
import { provedor } from './tts/index.mjs';
import { estimarPalavras } from './tts/alinhamento.mjs';
import { decodificar, salvarWav } from './util/midia.mjs';

export const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

export const pastaBuild = (id) => path.join(RAIZ, 'build', id);

/** Qual voz usar: --voz > vozes do roteiro > padrão do provedor. */
export function escolherVoz(roteiro, cfg) {
  const p = provedor(cfg.tts);
  return { p, voz: cfg.voz ?? roteiro.vozes?.[p.nome] ?? p.vozPadrao() };
}

export async function gerarVoz(roteiro, cfg) {
  const { p, voz } = escolherVoz(roteiro, cfg);
  const velocidade = fatorVelocidade(roteiro.velocidade);
  const dir = path.join(pastaBuild(roteiro.id), 'voz');
  fs.mkdirSync(dir, { recursive: true });
  let sint = null;
  try {
    for (const [i, b] of roteiro.beats.entries()) {
      const base = path.join(dir, `${i}-${b.id}`);
      const chave = `${p.nome}|${voz}|${velocidade}|${b.texto}`;
      if (fs.existsSync(base + '.json') && JSON.parse(fs.readFileSync(base + '.json', 'utf8')).chave === chave) continue;
      sint ??= await p.criar(voz);
      const tmp = base + '_tmp';
      const r = await sint.falar(b.texto, { velocidade, tmp });
      let arquivo = r.arquivo;
      if (!arquivo) {
        fs.mkdirSync(tmp, { recursive: true });
        arquivo = path.join(tmp, 'fala.wav');
        salvarWav(arquivo, r.amostras, r.taxa);
      }
      const amostras = decodificar(arquivo);
      const palavras = r.palavras?.length ? r.palavras : estimarPalavras(amostras, SR, b.texto);
      fs.writeFileSync(base + '.f32', Buffer.from(amostras.buffer, amostras.byteOffset, amostras.byteLength));
      const dur = amostras.length / SR;
      const alinhamento = r.palavras?.length ? 'nativo' : 'estimado';
      fs.writeFileSync(base + '.json', JSON.stringify({ chave, provedor: p.nome, voz, alinhamento, dur, words: palavras }, null, 1));
      fs.rmSync(tmp, { recursive: true, force: true });
      console.log(`  voz ${roteiro.id}/${b.id}: ${dur.toFixed(2)}s (${p.nome}/${voz || 'padrão'}, tempos ${alinhamento})`);
    }
  } finally {
    sint?.fechar();
  }
}

/** Alinha as palavras do TTS com o texto original (para manter a pontuação na legenda). */
export function alinhar(texto, words) {
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

/** Converte a especificação de um momento (ver src/roteiros.mjs) em segundos desde o início do beat. */
export function resolverCue(spec, b, ctx) {
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
    if (!achados[n - 1]) throw new Error(`cue "${spec}" não encontrada no beat ${b.id} (palavras: ${ctx.words.map((w) => w.txt).join(' ')})`);
    t = achados[n - 1].s;
  }
  return t + off;
}

export function montarTimeline(roteiro, fps = 30) {
  const dir = path.join(pastaBuild(roteiro.id), 'voz');
  let t = 0;
  const beats = roteiro.beats.map((b, i) => {
    const voz = JSON.parse(fs.readFileSync(path.join(dir, `${i}-${b.id}.json`), 'utf8'));
    const pre = b.pre ?? 0.05;
    const ultima = voz.words[voz.words.length - 1];
    const falaFim = pre + (ultima ? ultima.e : voz.dur);
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
  return { id: roteiro.id, fps, dur: total, beats, musica: roteiro.musica, arquivo: roteiro.arquivo };
}
