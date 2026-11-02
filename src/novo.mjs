// Cria o esqueleto de um vídeo novo (roteiro + cenas) que já renderiza:
//   npm run novo -- polvo "Por que o polvo tem três corações?"
import fs from 'node:fs';
import path from 'node:path';
import { RAIZ } from './config.mjs';
import { carregarRoteiros, PASTA_ROTEIROS } from './roteiros.mjs';

const [id, ...resto] = process.argv.slice(2);
const titulo = resto.join(' ').trim();
if (!id || !/^[a-z0-9-]+$/.test(id) || !titulo) {
  console.error('Uso: npm run novo -- <id-em-minusculas> "Título do vídeo"');
  process.exit(1);
}
const arqRoteiro = path.join(PASTA_ROTEIROS, `${id}.mjs`);
const arqCenas = path.join(RAIZ, 'web', 'videos', `${id}.js`);
if (fs.existsSync(arqRoteiro) || fs.existsSync(arqCenas)) {
  console.error(`Já existe um vídeo "${id}".`);
  process.exit(1);
}

const roteiros = await carregarRoteiros();
const ordem = Math.max(0, ...Object.values(roteiros).map((r) => r.ordem ?? 0)) + 1;
const semAcento = titulo.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[?!:/\\*"<>|]/g, '');
const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

fs.writeFileSync(arqRoteiro, `// Roteiro: ${titulo}. Formato documentado em src/roteiros.mjs e no README.
export default {
  ordem: ${ordem},
  titulo: '${esc(titulo)}',
  arquivo: '${String(ordem).padStart(2, '0')} - ${esc(semAcento)}',
  velocidade: '+7%',
  musica: { bpm: 104, acordes: ['Am', 'F', 'C', 'G'], clima: 'curioso' },
  publicacao: {
    tiktok: '${esc(titulo)} 🤯',
    hashtags: ['#curiosidades', '#vocesabia', '#ciencia', '#fy', '#fatoscuriosos'],
    shortsTitulo: '${esc(titulo)} #shorts #curiosidades',
    shortsDescricao: 'TODO: uma frase resumindo a resposta.',
    shortsHashtags: ['#curiosidades', '#vocesabia', '#animacao3d'],
    reserva: ['#fyp', '#viral'],
  },
  beats: [
    {
      id: 'gancho',
      texto: '${esc(titulo)}',
      hold: 0.6,
      destaque: [],
      cues: { fim: '>fim' },
      sfx: [['whoosh', 0], ['boing', 'fim']],
    },
    {
      id: 'explica',
      texto: 'TODO: a explicação, em frases curtas e com um fato surpreendente.',
      destaque: [],
      cues: {},
      sfx: [['whoosh', 0]],
    },
    {
      id: 'final',
      texto: 'TODO: uma frase final que puxe de volta para o começo do vídeo.',
      hold: 1.2,
      destaque: [],
      cues: {},
      sfx: [['whoosh', 0], ['ding', '>fim']],
    },
  ],
};
`);

fs.writeFileSync(arqCenas, `// Cenas do vídeo "${titulo}". Uma função por beat do roteiro (roteiros/${id}.mjs).
// Veja os outros arquivos desta pasta para exemplos de cenários, props e efeitos.
import { W, seg, smooth, back, lerp, pulse } from '../engine.js';
import { Boneco, misturar } from '../bonequinho.js';
import { pilula } from './chiclete.js';

export function criar(E) {
  const prota = new Boneco({ camisa: 0x22c55e, estilo: 'curto', cabelo: 0x3a2417 });
  const palco = E.set();
  palco.add(prota.root);

  return {
    beats: {
      gancho(s) {
        E.show(palco);
        E.fundo(0x7dd3fc, 0xfef3c7);
        const susto = smooth(seg(s.t, s.cue('fim') - 0.2, s.cue('fim')));
        prota.update(s.T, { ...misturar('idle', 'maosRosto', susto), ry: 0.15 }, { expr: susto > 0.5 ? 'surpreso' : 'sorriso' });
        E.cam(0.4, 2.0, lerp(4.8, 4.3, smooth(s.p)), 0, 1.75, 0, 36);
        E.tremer(pulse(s.t, s.cue('fim'), 0.3) * 0.5);
      },

      explica(s) {
        E.show(palco);
        E.fundo(0xc4b5fd, 0xfdf4ff);
        prota.update(s.T, { ...misturar('idle', 'pensando', smooth(seg(s.t, 0.2, 0.6))), ry: -0.2 }, { expr: 'confuso' });
        E.cam(-0.6, 2.1, 5.2, 0, 1.75, 0, 36);
      },

      final(s) {
        E.show(palco);
        E.fundo(0xfde68a, 0xfff7ed);
        prota.update(s.T, { ...misturar('idle', 'comemorar', smooth(seg(s.t, 0.3, 0.8))), ry: 0.1 }, { expr: 'feliz' });
        E.cam(0.3, 2.0, lerp(4.8, 4.3, smooth(s.p)), 0, 1.75, 0, 36);
        const cta = seg(s.t, s.dur - 1.5, s.dur - 1.2);
        if (cta > 0) E.desenhar((ctx) => pilula(ctx, 'SIGA PRA MAIS CURIOSIDADES!', W / 2, 330, back(cta)));
      },
    },
  };
}
`);

console.log(`Criados:\n  ${path.relative(RAIZ, arqRoteiro)}\n  ${path.relative(RAIZ, arqCenas)}\n`);
console.log(`Próximos passos: escreva o roteiro, depois\n  npm run audio -- ${id}\n  npm run stills -- ${id}   (confira build/${id}/sheet.jpg)\n  npm run video -- ${id}`);
