// Estima o tempo de cada palavra direto do áudio, para vozes que não informam isso (Piper, voz do sistema, Azure REST).
// Ideia: acha os trechos de silêncio, usa os maiores como pausas nas pontuações do texto e, dentro de cada frase,
// divide o tempo entre as palavras de acordo com o número de sílabas.

const PONTUACAO = /[.,;:!?…]+["')\]]*$/;
const PESO_PAUSA = { '.': 3, '!': 3, '?': 3, '…': 3, ':': 2, ';': 2, ',': 1 };

export function silabas(palavra) {
  const p = palavra.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  if (/^\d+$/.test(p)) return Math.max(2, p.length * 2);
  const grupos = p.match(/[aeiouy]+/g);
  return Math.max(1, grupos ? grupos.length : 1);
}

/** Envelope RMS em quadros de `passo` segundos. */
function envelope(amostras, taxa, passo = 0.01) {
  const n = Math.max(1, Math.round(taxa * passo));
  const qtd = Math.ceil(amostras.length / n);
  const env = new Float32Array(qtd);
  for (let q = 0; q < qtd; q++) {
    let soma = 0;
    const fim = Math.min(amostras.length, (q + 1) * n);
    for (let i = q * n; i < fim; i++) soma += amostras[i] * amostras[i];
    env[q] = Math.sqrt(soma / Math.max(1, fim - q * n));
  }
  return env;
}

/** Trechos de silêncio (em segundos) dentro da fala, ordenados no tempo. */
export function analisarFala(amostras, taxa, { passo = 0.01, pausaMin = 0.11 } = {}) {
  const env = envelope(amostras, taxa, passo);
  const ordenado = Float32Array.from(env).sort();
  const p95 = ordenado[Math.floor(ordenado.length * 0.95)] || 0;
  const limiar = Math.max(1e-4, p95 * 0.08);
  const voz = Array.from(env, (v) => v > limiar);
  const ini = voz.indexOf(true);
  const fim = voz.lastIndexOf(true);
  if (ini < 0) return { inicio: 0, fim: amostras.length / taxa, pausas: [] };
  const pausas = [];
  let q = ini;
  while (q <= fim) {
    if (!voz[q]) {
      const a = q;
      while (q <= fim && !voz[q]) q++;
      const dur = (q - a) * passo;
      if (dur >= pausaMin) pausas.push({ s: a * passo, e: q * passo, dur });
    } else q++;
  }
  return { inicio: ini * passo, fim: (fim + 1) * passo, pausas };
}

/**
 * @param {Float32Array} amostras áudio mono
 * @param {number} taxa taxa de amostragem
 * @param {string} texto texto falado
 * @returns {{w: string, s: number, e: number}[]} tempos em segundos
 */
export function estimarPalavras(amostras, taxa, texto) {
  const tokens = texto.split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t));
  if (!tokens.length) return [];
  const { inicio, fim, pausas } = analisarFala(amostras, taxa);
  const pesos = tokens.map((t) => silabas(t) + 0.35);

  // quebras de frase = palavras terminadas em pontuação (menos a última)
  const quebras = [];
  tokens.forEach((t, i) => {
    const m = PONTUACAO.exec(t);
    if (m && i < tokens.length - 1) quebras.push({ i, forca: PESO_PAUSA[m[0][0]] ?? 1 });
  });

  // tempo esperado de cada quebra se a fala fosse uniforme
  const total = pesos.reduce((a, b) => a + b, 0);
  let acum = 0;
  const esperado = [];
  pesos.forEach((p, i) => {
    acum += p;
    esperado[i] = inicio + ((fim - inicio) * acum) / total;
  });

  // associa as maiores pausas às quebras mais próximas, mantendo a ordem
  const escolhidas = [...pausas].sort((a, b) => b.dur - a.dur).slice(0, quebras.length).sort((a, b) => a.s - b.s);
  const cortes = [];
  let ultima = -1;
  for (const p of escolhidas) {
    let melhor = null;
    for (let k = ultima + 1; k < quebras.length; k++) {
      const dist = Math.abs(esperado[quebras[k].i] - p.s) / Math.max(0.5, quebras[k].forca);
      if (!melhor || dist < melhor.dist) melhor = { k, dist };
    }
    if (!melhor) break;
    ultima = melhor.k;
    cortes.push({ apos: quebras[melhor.k].i, s: p.s, e: p.e });
  }

  // monta segmentos [inicioFala, pausa1.s], [pausa1.e, pausa2.s], ... e distribui as palavras
  const palavras = [];
  let primeira = 0;
  let t0 = inicio;
  const segmentos = [...cortes, { apos: tokens.length - 1, s: fim, e: fim }];
  for (const c of segmentos) {
    const idx = [];
    for (let i = primeira; i <= c.apos; i++) idx.push(i);
    const soma = idx.reduce((a, i) => a + pesos[i], 0);
    let t = t0;
    for (const i of idx) {
      const d = ((c.s - t0) * pesos[i]) / soma;
      palavras.push({ w: tokens[i].replace(/[^\p{L}\p{N}'-]/gu, ''), s: t, e: t + d * 0.92 });
      t += d;
    }
    primeira = c.apos + 1;
    t0 = c.e;
  }
  return palavras;
}
