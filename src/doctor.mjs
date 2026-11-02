/* global document */
// Confere se o ambiente está pronto para gerar vídeos: npm run doctor
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import puppeteer from 'puppeteer-core';
import { lerConfig } from './config.mjs';
import { carregarRoteiros, validarRoteiro, verificarCenas } from './roteiros.mjs';
import { PROVEDORES } from './tts/index.mjs';
import { SFX } from './audio.mjs';
import { ffmpeg } from './util/midia.mjs';
import { acharNavegador, flagsGpu } from './navegador.mjs';

const cfg = lerConfig();
let problemas = 0;
const ok = (msg) => console.log(`  ✔ ${msg}`);
const falha = (msg, dica) => {
  problemas++;
  console.log(`  ✘ ${msg}${dica ? `\n      → ${dica}` : ''}`);
};
const aviso = (msg) => console.log(`  • ${msg}`);

console.log('\nAmbiente');
const major = Number(process.versions.node.split('.')[0]);
major >= 24 ? ok(`Node ${process.versions.node}`) : falha(`Node ${process.versions.node}`, 'instale o Node 24 ou mais novo');
console.log(`  • sistema: ${process.platform}-${process.arch}`);

const ff = spawnSync(ffmpeg, ['-version'], { encoding: 'utf8' });
ff.status === 0 ? ok(`ffmpeg (${ff.stdout.split('\n')[0].split(' ').slice(0, 3).join(' ')})`) : falha('ffmpeg não roda', 'rode "npm install" de novo');

let navegador = null;
try {
  navegador = acharNavegador(cfg.navegador);
  ok(`navegador: ${navegador}`);
} catch (e) {
  falha('navegador não encontrado', e.message.split('\n').slice(1).join(' '));
}

if (navegador) {
  try {
    const b = await puppeteer.launch({ executablePath: navegador, headless: true, args: flagsGpu() });
    const p = await b.newPage();
    const gl = await p.evaluate(() => {
      const c = document.createElement('canvas').getContext('webgl2');
      if (!c) return null;
      const ext = c.getExtension('WEBGL_debug_renderer_info');
      return ext ? c.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'WebGL2 ok';
    });
    await b.close();
    if (!gl) falha('WebGL2 indisponível no navegador headless', 'atualize o driver de vídeo ou o navegador');
    else if (/swiftshader|llvmpipe/i.test(gl)) aviso(`WebGL por software (${gl}) — funciona, mas o render fica bem mais lento`);
    else ok(`WebGL2 na GPU: ${gl}`);
  } catch (e) {
    falha('não consegui abrir o navegador headless', e.message);
  }
}

try {
  fs.mkdirSync(cfg.saida, { recursive: true });
  fs.accessSync(cfg.saida, fs.constants.W_OK);
  ok(`pasta de saída: ${cfg.saida}`);
} catch (e) {
  falha(`sem permissão de escrita em ${cfg.saida}`, `defina SAIDA_DIR no .env (${e.message})`);
}

console.log('\nVozes');
for (const p of Object.values(PROVEDORES)) {
  const ativo = p.nome === cfg.tts;
  const precisaChave = (p.nome === 'azure' && !process.env.AZURE_SPEECH_KEY) || (p.nome === 'elevenlabs' && !process.env.ELEVENLABS_API_KEY);
  if (precisaChave && !ativo) {
    aviso(`${p.nome}: não configurado (opcional) — ${p.descricao}`);
    continue;
  }
  const voz = ativo && cfg.voz ? cfg.voz : p.vozPadrao();
  const r = await p.verificar(voz);
  const rotulo = `${p.nome}${ativo ? ' [em uso]' : ''}: ${r.detalhe}`;
  if (r.ok) ok(rotulo);
  else if (ativo) falha(rotulo, p.nome === 'piper' ? `npm run voz:baixar -- ${voz}` : 'veja a seção "Vozes" do README');
  else aviso(rotulo);
}

console.log(`\nVídeos (projetos em ${cfg.projetos})`);
const roteiros = await carregarRoteiros();
for (const r of Object.values(roteiros)) {
  const erros = [...validarRoteiro(r, { efeitos: Object.keys(SFX) }), ...verificarCenas(r)];
  if (erros.length) erros.forEach((e) => falha(e));
  else ok(`${r.id}${r.origem === 'exemplo' ? ' [exemplo]' : ''} (${r.beats.length} cenas)${fs.existsSync(path.join(cfg.saida, `${r.arquivo}.mp4`)) ? '' : ' — ainda não gerado'}`);
}

console.log(problemas ? `\n${problemas} problema(s) encontrado(s).` : '\nTudo pronto para gerar vídeos.');
process.exit(problemas ? 1 : 0);
