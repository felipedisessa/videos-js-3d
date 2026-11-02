// Voz neural do Microsoft Edge ("Ler em voz alta"). Online e gratuita, com o tempo de cada palavra.
import fs from 'node:fs';
import path from 'node:path';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

const FORMATO = OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3;

export function taxaEdge(fator) {
  const p = Math.round((fator - 1) * 100);
  return `${p >= 0 ? '+' : ''}${p}%`;
}

async function conectar(voz) {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voz, FORMATO, { wordBoundaryEnabled: true });
  return tts;
}

export default {
  nome: 'edge',
  descricao: 'Microsoft Edge (online, grátis, neural, com tempo das palavras)',
  vozPadrao: () => process.env.EDGE_VOZ || 'pt-BR-AntonioNeural',

  async verificar(voz) {
    try {
      const tts = new MsEdgeTTS();
      const vozes = await tts.getVoices();
      const ok = vozes.some((v) => v.ShortName === voz);
      const pt = vozes.filter((v) => v.Locale === 'pt-BR').map((v) => v.ShortName).join(', ');
      return { ok, detalhe: ok ? `voz ${voz} disponível` : `voz "${voz}" não existe. Vozes pt-BR: ${pt}` };
    } catch (e) {
      return { ok: false, detalhe: `sem acesso ao serviço do Edge (precisa de internet): ${e.message}` };
    }
  },

  async criar(voz) {
    let tts = await conectar(voz);
    return {
      async falar(texto, { velocidade, tmp }) {
        fs.rmSync(tmp, { recursive: true, force: true });
        fs.mkdirSync(tmp, { recursive: true });
        let r;
        for (let tentativa = 1; ; tentativa++) {
          try {
            r = await tts.toFile(tmp, texto, { rate: taxaEdge(velocidade) });
            break;
          } catch (e) {
            if (tentativa >= 3) throw e;
            tts.close();
            tts = await conectar(voz);
          }
        }
        const palavras = JSON.parse(fs.readFileSync(r.metadataFilePath, 'utf8')).Metadata
          .filter((m) => m.Type === 'WordBoundary' && (m.Data.text.BoundaryType ?? 'WordBoundary') === 'WordBoundary')
          .map((m) => ({ w: m.Data.text.Text, s: m.Data.Offset / 1e7, e: (m.Data.Offset + m.Data.Duration) / 1e7 }));
        return { arquivo: path.resolve(r.audioFilePath), palavras };
      },
      fechar: () => tts.close(),
    };
  },
};
