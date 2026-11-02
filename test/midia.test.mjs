import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { wavPcm16, salvarWav, decodificar } from '../src/util/midia.mjs';

test('wavPcm16 gera cabeçalho correto', () => {
  const b = wavPcm16([new Float32Array(10), new Float32Array(10)], 48000);
  assert.equal(b.toString('ascii', 0, 4), 'RIFF');
  assert.equal(b.readUInt16LE(22), 2);
  assert.equal(b.readUInt32LE(24), 48000);
  assert.equal(b.length, 44 + 10 * 2 * 2);
});

test('salvar e decodificar com reamostragem (ffmpeg)', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gerador-'));
  try {
    const a = new Float32Array(22050).map((_, i) => 0.5 * Math.sin(i / 10));
    const arq = path.join(dir, 't.wav');
    salvarWav(arq, a, 22050);
    const d = decodificar(arq);
    assert.ok(Math.abs(d.length - 48000) < 50, `tamanho ${d.length}`);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
