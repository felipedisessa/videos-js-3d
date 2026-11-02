// Baixa um modelo de voz Piper (pt-BR) já convertido pelo projeto sherpa-onnx.
//   npm run voz:baixar -- faber-medium        (padrão)
//   npm run voz:baixar -- jeff-medium-int8    (versão menor, ~21 MB)
//   npm run voz:baixar -- --lista
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { PASTA_MODELOS, VOZES_PIPER, pastaDaVoz } from './tts/piper.mjs';

const BASE = 'https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models';
const args = process.argv.slice(2);

if (args.includes('--lista')) {
  console.log('Vozes Piper pt-BR (adicione -int8 ou -fp16 ao id para baixar uma versão menor):\n');
  for (const v of VOZES_PIPER) console.log(`  ${v.id.padEnd(14)} ${v.voz.padEnd(20)} ${v.licenca}${v.recomendada ? '  ← recomendada' : ''}`);
  process.exit(0);
}

const voz = args.find((a) => !a.startsWith('--')) || 'faber-medium';
const nome = `vits-piper-pt_BR-${voz}`;
const destino = pastaDaVoz(voz);
if (fs.existsSync(destino)) {
  console.log(`Já instalada: ${destino}`);
  process.exit(0);
}
fs.mkdirSync(PASTA_MODELOS, { recursive: true });
const arquivo = path.join(PASTA_MODELOS, `${nome}.tar.bz2`);
const url = `${BASE}/${nome}.tar.bz2`;

console.log(`Baixando ${url}`);
const r = await fetch(url);
if (!r.ok) {
  console.error(`Falhou (${r.status}). Veja as vozes disponíveis com: npm run voz:baixar -- --lista`);
  process.exit(1);
}
const total = Number(r.headers.get('content-length')) || 0;
let baixado = 0;
let ultimo = 0;
const progresso = new TransformStream({
  transform(chunk, ctl) {
    baixado += chunk.length;
    if (total && baixado - ultimo > total / 20) {
      ultimo = baixado;
      process.stdout.write(`  ${Math.round((100 * baixado) / total)}%\r`);
    }
    ctl.enqueue(chunk);
  },
});
await pipeline(Readable.fromWeb(r.body.pipeThrough(progresso)), fs.createWriteStream(arquivo));
console.log(`  ${(baixado / 1e6).toFixed(1)} MB`);

// tar existe no Windows 10+, macOS e Linux; rodar com cwd evita problemas com "C:" no tar do Git Bash
const x = spawnSync('tar', ['-xjf', path.basename(arquivo)], { cwd: PASTA_MODELOS, stdio: 'inherit' });
fs.rmSync(arquivo, { force: true });
if (x.status !== 0 || !fs.existsSync(destino)) {
  console.error('Não consegui extrair o arquivo com o tar do sistema.');
  process.exit(1);
}
console.log(`Pronto: ${destino}\nUse com: npm run video -- <id> --tts piper --voz ${voz}  (ou TTS_PROVEDOR=piper no .env)`);
