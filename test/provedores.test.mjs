import test from 'node:test';
import assert from 'node:assert/strict';
import { PROVEDORES, provedor } from '../src/tts/index.mjs';
import { palavrasDeCaracteres } from '../src/tts/elevenlabs.mjs';
import { ssml, escaparXml } from '../src/tts/azure.mjs';
import { taxaEdge } from '../src/tts/edge.mjs';
import { pastaDaVoz } from '../src/tts/piper.mjs';

test('todos os provedores seguem a mesma interface', () => {
  for (const p of Object.values(PROVEDORES)) {
    assert.equal(typeof p.nome, 'string');
    assert.equal(typeof p.descricao, 'string');
    for (const f of ['vozPadrao', 'verificar', 'criar']) assert.equal(typeof p[f], 'function', `${p.nome}.${f}`);
  }
  assert.throws(() => provedor('nada'), /desconhecido/);
});

test('taxa de velocidade no formato SSML', () => {
  assert.equal(taxaEdge(1.07), '+7%');
  assert.equal(taxaEdge(0.9), '-10%');
});

test('ElevenLabs: caracteres viram palavras com tempo', () => {
  const chars = [...'Oi, mundo!'];
  const ini = chars.map((_, i) => i / 10);
  const fim = chars.map((_, i) => i / 10 + 0.08);
  const r = palavrasDeCaracteres(chars, ini, fim);
  assert.deepEqual(r.map((p) => p.w), ['Oi', 'mundo']);
  assert.equal(r[0].s, 0);
  assert.ok(Math.abs(r[0].e - 0.28) < 1e-9);
  assert.ok(Math.abs(r[1].s - 0.4) < 1e-9);
  assert.ok(Math.abs(r[1].e - 0.98) < 1e-9);
});

test('Azure: SSML escapa o texto', () => {
  assert.equal(escaparXml('a < b & "c"'), 'a &lt; b &amp; &quot;c&quot;');
  const x = ssml('Tom & Jerry', 'pt-BR-AntonioNeural', 1.07);
  assert.match(x, /xml:lang="pt-BR"/);
  assert.match(x, /rate="\+7%"/);
  assert.match(x, /Tom &amp; Jerry/);
});

test('Piper: id curto vira pasta do modelo', () => {
  assert.match(pastaDaVoz('faber-medium'), /modelos[\\/]vits-piper-pt_BR-faber-medium$/);
});
