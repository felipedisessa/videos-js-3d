// Piper rodando localmente via sherpa-onnx: offline, grátis, Windows/macOS/Linux (x64 e ARM), sem Python.
// Os modelos ficam em modelos/ (baixe com `npm run voz:baixar -- faber-medium`).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { RAIZ } from '../config.mjs';

const require = createRequire(import.meta.url);

export const PASTA_MODELOS = path.join(RAIZ, 'modelos');

/** Vozes pt-BR publicadas pelo sherpa-onnx (sufixos -int8 e -fp16 são versões menores). */
export const VOZES_PIPER = [
  { id: 'faber-medium', voz: 'masculina', licenca: 'dataset CC0', recomendada: true },
  { id: 'cadu-medium', voz: 'masculina', licenca: 'dataset CC0' },
  { id: 'jeff-medium', voz: 'masculina', licenca: 'dataset CC0' },
  { id: 'edresson-low', voz: 'masculina (16 kHz)', licenca: 'dataset CC BY 4.0' },
  { id: 'dii-high', voz: 'feminina', licenca: 'confira o MODEL_CARD' },
  { id: 'miro-high', voz: '?', licenca: 'confira o MODEL_CARD' },
];

function carregarSherpa() {
  try {
    return require('sherpa-onnx-node');
  } catch (e) {
    throw new Error(`o pacote sherpa-onnx-node não está instalado para esta plataforma (${process.platform}-${process.arch}). Rode "npm install". Detalhe: ${e.message}`);
  }
}

/** 'faber-medium' → modelos/vits-piper-pt_BR-faber-medium; também aceita nome de pasta ou caminho. */
export function pastaDaVoz(voz) {
  if (path.isAbsolute(voz)) return voz;
  const nome = voz.startsWith('vits-') ? voz : `vits-piper-pt_BR-${voz}`;
  return path.join(PASTA_MODELOS, nome);
}

function arquivosDoModelo(pasta) {
  if (!fs.existsSync(pasta)) throw new Error(`modelo não encontrado em ${pasta}. Baixe com: npm run voz:baixar -- ${path.basename(pasta).replace('vits-piper-pt_BR-', '')}`);
  const onnx = fs.readdirSync(pasta).find((f) => f.endsWith('.onnx'));
  if (!onnx) throw new Error(`nenhum .onnx em ${pasta}`);
  return {
    model: path.join(pasta, onnx),
    tokens: path.join(pasta, 'tokens.txt'),
    dataDir: path.join(pasta, 'espeak-ng-data'),
  };
}

export default {
  nome: 'piper',
  descricao: 'Piper via sherpa-onnx (local, offline, grátis, qualquer SO)',
  vozPadrao: () => process.env.PIPER_VOZ || 'faber-medium',

  async verificar(voz) {
    try {
      carregarSherpa();
      arquivosDoModelo(pastaDaVoz(voz));
      return { ok: true, detalhe: `modelo ${voz} instalado` };
    } catch (e) {
      return { ok: false, detalhe: e.message };
    }
  },

  async criar(voz) {
    const sherpa = carregarSherpa();
    const tts = new sherpa.OfflineTts({
      model: {
        vits: { ...arquivosDoModelo(pastaDaVoz(voz)), noiseScale: 0.667, noiseScaleW: 0.8, lengthScale: 1.0 },
        numThreads: Math.max(1, Math.min(4, os.availableParallelism() - 1)),
        provider: 'cpu',
        debug: false,
      },
      maxNumSentences: 1,
    });
    return {
      async falar(texto, { velocidade }) {
        const audio = tts.generate({ text: texto, sid: 0, speed: velocidade });
        return { amostras: audio.samples, taxa: audio.sampleRate };
      },
      fechar() {},
    };
  },
};
