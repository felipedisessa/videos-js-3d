import test from 'node:test';
import assert from 'node:assert/strict';
import { carregarRoteiros, validarRoteiro, verificarCenas } from '../src/roteiros.mjs';
import { SFX } from '../src/audio.mjs';
import { textoLeiame } from '../src/leiame.mjs';

const roteiros = await carregarRoteiros();

test('existem roteiros', () => assert.ok(Object.keys(roteiros).length > 0));

for (const r of Object.values(roteiros)) {
  test(`roteiro ${r.id} é válido e tem todas as cenas`, () => {
    assert.deepEqual([...validarRoteiro(r, { efeitos: Object.keys(SFX) }), ...verificarCenas(r)], []);
    assert.ok(r.publicacao?.tiktok, 'falta publicacao.tiktok');
  });
}

test('ordem e nomes de arquivo não se repetem', () => {
  const lista = Object.values(roteiros);
  assert.equal(new Set(lista.map((r) => r.ordem)).size, lista.length);
  assert.equal(new Set(lista.map((r) => r.arquivo)).size, lista.length);
});

test('LEIA-ME inclui título e hashtags de cada vídeo', () => {
  const txt = textoLeiame(roteiros, '/pasta-que-nao-existe');
  for (const r of Object.values(roteiros)) {
    assert.ok(txt.includes(r.titulo), r.titulo);
    assert.ok(txt.includes(r.publicacao.hashtags.join(' ')));
  }
});
