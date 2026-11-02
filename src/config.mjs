// Configuração central: variáveis de ambiente (arquivo .env opcional) + flags da linha de comando.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SR = 48000;

const arquivoEnv = path.join(RAIZ, '.env');
if (fs.existsSync(arquivoEnv)) process.loadEnvFile(arquivoEnv);

function pastaSaidaPadrao() {
  const desktop = path.join(os.homedir(), 'Desktop');
  return fs.existsSync(desktop) ? path.join(desktop, 'Videos Canal Dark 3D') : path.join(RAIZ, 'saida');
}

/** Junta .env, variáveis de ambiente e flags (as flags têm prioridade). */
export function lerConfig(flags = {}) {
  const env = process.env;
  return {
    tts: String(flags.tts ?? env.TTS_PROVEDOR ?? 'edge').toLowerCase(),
    voz: flags.voz ?? null,
    saida: path.resolve(flags.saida ?? env.SAIDA_DIR ?? pastaSaidaPadrao()),
    navegador: env.NAVEGADOR || null,
    fps: Number(env.FPS ?? 30),
  };
}

/** '+7%' → 1.07, '-10%' → 0.9, 1.1 → 1.1 */
export function fatorVelocidade(v) {
  if (v === undefined || v === null || v === '') return 1;
  if (typeof v === 'number') return v;
  const m = /^([+-]?\d+(?:\.\d+)?)%$/.exec(String(v).trim());
  if (!m) throw new Error(`velocidade inválida: "${v}" (use número como 1.07 ou porcentagem como "+7%")`);
  return 1 + parseFloat(m[1]) / 100;
}
