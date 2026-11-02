import test from 'node:test';
import assert from 'node:assert/strict';
import { fatorVelocidade, lerConfig } from '../src/config.mjs';

test('fatorVelocidade aceita porcentagem e número', () => {
  assert.equal(fatorVelocidade('+7%'), 1.07);
  assert.equal(fatorVelocidade('-10%'), 0.9);
  assert.equal(fatorVelocidade(1.2), 1.2);
  assert.equal(fatorVelocidade(undefined), 1);
  assert.throws(() => fatorVelocidade('rápido'), /velocidade inválida/);
});

test('flags têm prioridade sobre o ambiente', () => {
  const antes = process.env.TTS_PROVEDOR;
  process.env.TTS_PROVEDOR = 'sistema';
  try {
    assert.equal(lerConfig().tts, 'sistema');
    assert.equal(lerConfig({ tts: 'PIPER' }).tts, 'piper');
  } finally {
    if (antes === undefined) delete process.env.TTS_PROVEDOR;
    else process.env.TTS_PROVEDOR = antes;
  }
});
