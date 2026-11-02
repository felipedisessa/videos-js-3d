// Azure AI Speech (Microsoft): as mesmas vozes neurais do Edge, mas pela API oficial e com licença de uso comercial.
// Tem cota gratuita mensal. Precisa de AZURE_SPEECH_KEY e AZURE_SPEECH_REGION no .env.
import fs from 'node:fs';
import path from 'node:path';
import { taxaEdge } from './edge.mjs';

export function escaparXml(s) {
  return s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]);
}

export function ssml(texto, voz, velocidade) {
  const lang = voz.split('-').slice(0, 2).join('-');
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${lang}"><voice name="${escaparXml(voz)}"><prosody rate="${taxaEdge(velocidade)}">${escaparXml(texto)}</prosody></voice></speak>`;
}

function credenciais() {
  const chave = process.env.AZURE_SPEECH_KEY;
  const regiao = process.env.AZURE_SPEECH_REGION;
  if (!chave || !regiao) throw new Error('defina AZURE_SPEECH_KEY e AZURE_SPEECH_REGION no .env');
  return { chave, regiao };
}

export default {
  nome: 'azure',
  descricao: 'Azure AI Speech (oficial, uso comercial, mesmas vozes do Edge)',
  vozPadrao: () => process.env.AZURE_VOZ || 'pt-BR-AntonioNeural',

  async verificar() {
    try {
      const { chave, regiao } = credenciais();
      const r = await fetch(`https://${regiao}.tts.speech.microsoft.com/cognitiveservices/voices/list`, { headers: { 'Ocp-Apim-Subscription-Key': chave } });
      return { ok: r.ok, detalhe: r.ok ? `chave válida (${regiao})` : `a API respondeu ${r.status}` };
    } catch (e) {
      return { ok: false, detalhe: e.message };
    }
  },

  async criar(voz) {
    const { chave, regiao } = credenciais();
    return {
      async falar(texto, { velocidade, tmp }) {
        const r = await fetch(`https://${regiao}.tts.speech.microsoft.com/cognitiveservices/v1`, {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': chave,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm',
            'User-Agent': 'gerador-videos-dark-3d',
          },
          body: ssml(texto, voz, velocidade),
        });
        if (!r.ok) throw new Error(`Azure respondeu ${r.status}: ${await r.text()}`);
        fs.mkdirSync(tmp, { recursive: true });
        const arquivo = path.join(tmp, 'fala.wav');
        fs.writeFileSync(arquivo, Buffer.from(await r.arrayBuffer()));
        return { arquivo };
      },
      fechar() {},
    };
  },
};
