// Voz que já vem no sistema operacional: zero instalação, mas soa mais robótica.
// Windows: SAPI (ex.: Microsoft Maria) · macOS: `say` (ex.: Luciana) · Linux: espeak-ng.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const PLAT = process.platform;

const PS_FALAR = `
Add-Type -AssemblyName System.Speech
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
if ($env:TTS_VOZ) { $s.SelectVoice($env:TTS_VOZ) }
else {
  $v = $s.GetInstalledVoices() | Where-Object { $_.Enabled -and $_.VoiceInfo.Culture.Name -eq 'pt-BR' } | Select-Object -First 1
  if ($v) { $s.SelectVoice($v.VoiceInfo.Name) }
}
$s.Rate = [int]$env:TTS_RATE
$s.SetOutputToWaveFile($env:TTS_SAIDA)
$s.Speak([IO.File]::ReadAllText($env:TTS_TEXTO, [Text.Encoding]::UTF8))
$s.Dispose()
`;
const PS_LISTAR = `Add-Type -AssemblyName System.Speech; (New-Object System.Speech.Synthesis.SpeechSynthesizer).GetInstalledVoices() | ForEach-Object { $_.VoiceInfo.Name + '|' + $_.VoiceInfo.Culture.Name }`;

function rodar(cmd, args, env = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', env: { ...process.env, ...env } });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(`${cmd} falhou: ${r.stderr || r.stdout}`);
  return r.stdout;
}

function comandoLinux() {
  for (const c of ['espeak-ng', 'espeak']) {
    if (spawnSync(c, ['--version'], { encoding: 'utf8' }).status === 0) return c;
  }
  return null;
}

export default {
  nome: 'sistema',
  descricao: 'Voz do sistema operacional (offline, zero instalação, mais robótica)',
  vozPadrao: () => process.env.SISTEMA_VOZ || '',

  async verificar(voz) {
    try {
      if (PLAT === 'win32') {
        const vozes = rodar('powershell', ['-NoProfile', '-NonInteractive', '-Command', PS_LISTAR]).trim().split(/\r?\n/);
        const pt = vozes.filter((v) => v.endsWith('|pt-BR')).map((v) => v.split('|')[0]);
        if (voz) return { ok: vozes.some((v) => v.startsWith(voz + '|')), detalhe: `vozes: ${vozes.join(', ')}` };
        return { ok: pt.length > 0, detalhe: pt.length ? `vozes pt-BR: ${pt.join(', ')}` : 'nenhuma voz pt-BR instalada (Configurações > Hora e idioma > Fala)' };
      }
      if (PLAT === 'darwin') {
        const lista = rodar('say', ['-v', '?']);
        const alvo = voz || 'Luciana';
        return { ok: lista.includes(alvo), detalhe: lista.includes(alvo) ? `voz ${alvo} disponível` : `voz ${alvo} não instalada (Ajustes > Acessibilidade > Conteúdo Falado)` };
      }
      const c = comandoLinux();
      return { ok: !!c, detalhe: c ? `${c} instalado` : 'instale o espeak-ng (ex.: sudo apt install espeak-ng)' };
    } catch (e) {
      return { ok: false, detalhe: e.message };
    }
  },

  async criar(voz) {
    return {
      async falar(texto, { velocidade, tmp }) {
        fs.rmSync(tmp, { recursive: true, force: true });
        fs.mkdirSync(tmp, { recursive: true });
        const txt = path.join(tmp, 'texto.txt');
        fs.writeFileSync(txt, texto, 'utf8');
        if (PLAT === 'win32') {
          const saida = path.join(tmp, 'fala.wav');
          const rate = Math.max(-10, Math.min(10, Math.round((velocidade - 1) / 0.06)));
          rodar('powershell', ['-NoProfile', '-NonInteractive', '-Command', PS_FALAR], { TTS_VOZ: voz, TTS_RATE: String(rate), TTS_SAIDA: saida, TTS_TEXTO: txt });
          return { arquivo: saida };
        }
        if (PLAT === 'darwin') {
          const saida = path.join(tmp, 'fala.aiff');
          rodar('say', ['-v', voz || 'Luciana', '-r', String(Math.round(180 * velocidade)), '-o', saida, '-f', txt]);
          return { arquivo: saida };
        }
        const c = comandoLinux();
        if (!c) throw new Error('espeak-ng não encontrado');
        const saida = path.join(tmp, 'fala.wav');
        rodar(c, ['-v', voz || 'pt-br', '-s', String(Math.round(170 * velocidade)), '-w', saida, '-f', txt]);
        return { arquivo: saida };
      },
      fechar() {},
    };
  },
};
