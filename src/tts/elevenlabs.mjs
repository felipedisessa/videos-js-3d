// ElevenLabs: vozes premium (inclusive clonadas), pago, com tempo de cada letra.
// Precisa de ELEVENLABS_API_KEY e ELEVENLABS_VOZ (id da voz) no .env.
import fs from 'node:fs';
import path from 'node:path';

const API = 'https://api.elevenlabs.io/v1';

/** Junta o alinhamento por caractere da API em palavras com início/fim. */
export function palavrasDeCaracteres(chars, inicios, fins) {
  const palavras = [];
  let atual = null;
  chars.forEach((c, i) => {
    if (/\s/.test(c)) {
      if (atual) palavras.push(atual);
      atual = null;
      return;
    }
    if (!atual) atual = { w: '', s: inicios[i], e: fins[i] };
    atual.w += c;
    atual.e = fins[i];
  });
  if (atual) palavras.push(atual);
  return palavras.map((p) => ({ ...p, w: p.w.replace(/[^\p{L}\p{N}'-]/gu, '') })).filter((p) => p.w);
}

function credenciais() {
  const chave = process.env.ELEVENLABS_API_KEY;
  if (!chave) throw new Error('defina ELEVENLABS_API_KEY no .env');
  return chave;
}

export default {
  nome: 'elevenlabs',
  descricao: 'ElevenLabs (online, pago, a voz mais natural e com clonagem)',
  vozPadrao: () => process.env.ELEVENLABS_VOZ || '',

  async verificar(voz) {
    try {
      const chave = credenciais();
      if (!voz) return { ok: false, detalhe: 'defina ELEVENLABS_VOZ (id da voz) no .env ou use --voz' };
      const r = await fetch(`${API}/voices/${encodeURIComponent(voz)}`, { headers: { 'xi-api-key': chave } });
      return { ok: r.ok, detalhe: r.ok ? `voz ${voz} encontrada` : `a API respondeu ${r.status}` };
    } catch (e) {
      return { ok: false, detalhe: e.message };
    }
  },

  async criar(voz) {
    const chave = credenciais();
    if (!voz) throw new Error('defina ELEVENLABS_VOZ (id da voz) no .env ou use --voz');
    const modelo = process.env.ELEVENLABS_MODELO || 'eleven_multilingual_v2';
    return {
      async falar(texto, { velocidade, tmp }) {
        const r = await fetch(`${API}/text-to-speech/${encodeURIComponent(voz)}/with-timestamps?output_format=mp3_44100_128`, {
          method: 'POST',
          headers: { 'xi-api-key': chave, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: texto,
            model_id: modelo,
            voice_settings: { stability: 0.5, similarity_boost: 0.75, speed: Math.max(0.7, Math.min(1.2, velocidade)) },
          }),
        });
        if (!r.ok) throw new Error(`ElevenLabs respondeu ${r.status}: ${await r.text()}`);
        const j = await r.json();
        fs.mkdirSync(tmp, { recursive: true });
        const arquivo = path.join(tmp, 'fala.mp3');
        fs.writeFileSync(arquivo, Buffer.from(j.audio_base64, 'base64'));
        const a = j.alignment;
        const palavras = a ? palavrasDeCaracteres(a.characters, a.character_start_times_seconds, a.character_end_times_seconds) : undefined;
        return { arquivo, palavras };
      },
      fechar() {},
    };
  },
};
