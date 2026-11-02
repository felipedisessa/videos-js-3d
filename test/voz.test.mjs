import test from 'node:test';
import assert from 'node:assert/strict';
import { alinhar, resolverCue, norm } from '../src/voz.mjs';

const palavras = (txt) => txt.split(' ').map((w, i) => ({ w, txt: w, s: i * 0.5, e: i * 0.5 + 0.4 }));

test('norm tira acento, caixa e pontuação', () => {
  assert.equal(norm('Estômago!'), 'estomago');
});

test('alinhar mantém a pontuação e junta números agrupados pelo TTS', () => {
  const r = alinhar('Levaria uns 38 minutos.', [{ w: 'Levaria' }, { w: 'uns' }, { w: '38 minutos' }]);
  assert.deepEqual(r.map((w) => w.txt), ['Levaria', 'uns', '38 minutos.']);
});

test('resolverCue entende todos os formatos', () => {
  const b = { id: 'x', cues: { mito: 'mito', depois: 'mito+0.5' } };
  const ctx = { falaFim: 3, dur: 4, words: palavras('mas isso é mito e mito de novo 28') };
  assert.equal(resolverCue(1.2, b, ctx), 1.2);
  assert.equal(resolverCue('mito', b, ctx), 1.5);
  assert.equal(resolverCue('mito@2', b, ctx), 2.5);
  assert.equal(resolverCue('depois', b, ctx), 2.0);
  assert.equal(resolverCue('>fim-0.5', b, ctx), 2.5);
  assert.equal(resolverCue('%50', b, ctx), 2);
  assert.equal(resolverCue('w:28', b, ctx), 4.0);
  assert.equal(resolverCue('0.25', b, ctx), 0.25);
  assert.throws(() => resolverCue('banana', b, ctx), /não encontrada/);
});
