import test from 'node:test';
import assert from 'node:assert/strict';
import { estimarPalavras, analisarFala, silabas } from '../src/tts/alinhamento.mjs';

const TAXA = 16000;

/** Áudio sintético: blocos de "fala" (ruído modulado) separados por silêncios. */
function sintetico(blocos) {
  const total = blocos.reduce((a, b) => a + b.fala + b.pausa, 0);
  const out = new Float32Array(Math.round(total * TAXA));
  let t = 0;
  let semente = 1;
  for (const b of blocos) {
    const i0 = Math.round(t * TAXA);
    const n = Math.round(b.fala * TAXA);
    for (let i = 0; i < n; i++) {
      semente = (semente * 16807) % 2147483647;
      out[i0 + i] = ((semente / 2147483647) * 2 - 1) * 0.5 * (0.6 + 0.4 * Math.sin(i / 300));
    }
    t += b.fala + b.pausa;
  }
  return out;
}

test('silabas conta grupos de vogais', () => {
  assert.equal(silabas('chiclete'), 3);
  assert.equal(silabas('é'), 1);
  assert.equal(silabas('Oceano'), 3);
  assert.ok(silabas('28') >= 2);
});

test('analisarFala acha início, fim e pausas', () => {
  const a = sintetico([{ fala: 0.6, pausa: 0.3 }, { fala: 0.8, pausa: 0 }]);
  const r = analisarFala(a, TAXA);
  assert.ok(r.inicio < 0.02);
  assert.ok(Math.abs(r.fim - 1.7) < 0.03);
  assert.equal(r.pausas.length, 1);
  assert.ok(Math.abs(r.pausas[0].s - 0.6) < 0.03);
});

test('estimarPalavras usa as pausas nas pontuações', () => {
  const texto = 'Mas isso é mito. O ácido desmancha a comida em volta, mas ele continua inteirinho.';
  const a = sintetico([{ fala: 1.0, pausa: 0.35 }, { fala: 1.6, pausa: 0.25 }, { fala: 1.4, pausa: 0 }]);
  const p = estimarPalavras(a, TAXA, texto);
  assert.equal(p.length, texto.split(' ').length);
  const inicio = (w, n = 0) => p.filter((x) => x.w === w)[n].s;
  assert.ok(Math.abs(inicio('O') - 1.35) < 0.05, `"O" em ${inicio('O')}`);
  assert.ok(Math.abs(inicio('mas') - 3.2) < 0.05, `"mas" em ${inicio('mas')}`);
  for (let i = 1; i < p.length; i++) assert.ok(p[i].s >= p[i - 1].e, 'palavras em ordem e sem sobreposição');
});

test('estimarPalavras sem áudio útil não quebra', () => {
  const p = estimarPalavras(new Float32Array(1600), TAXA, 'Olá mundo');
  assert.equal(p.length, 2);
});
