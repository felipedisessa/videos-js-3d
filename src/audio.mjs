// Trilha e efeitos sonoros sintetizados na hora (sem samples de terceiros), mixados com a narração.
import fs from 'node:fs';
import { SR } from './voz.mjs';

const TAU = Math.PI * 2;

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Biquad RBJ
class Filtro {
  constructor(tipo = 'lp', f = 1000, q = 0.707) { this.x1 = this.x2 = this.y1 = this.y2 = 0; this.set(tipo, f, q); }
  set(tipo, f, q) {
    const w = (TAU * Math.min(f, SR * 0.45)) / SR;
    const cs = Math.cos(w);
    const al = Math.sin(w) / (2 * q);
    let b0, b1, b2;
    if (tipo === 'lp') { b0 = (1 - cs) / 2; b1 = 1 - cs; b2 = b0; }
    else if (tipo === 'hp') { b0 = (1 + cs) / 2; b1 = -(1 + cs); b2 = b0; }
    else { b0 = al; b1 = 0; b2 = -al; }
    const a0 = 1 + al;
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0; this.a1 = (-2 * cs) / a0; this.a2 = (1 - al) / a0;
    this.tipo = tipo;
  }
  run(x) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y;
    return y;
  }
}

// escreve d segundos gerados por fn(t, x, i) a partir de t0
function render(buf, t0, d, fn, amp = 1) {
  const i0 = Math.round(t0 * SR);
  const n = Math.round(d * SR);
  for (let i = 0; i < n; i++) {
    const k = i0 + i;
    if (k < 0 || k >= buf.length) continue;
    const t = i / SR;
    buf[k] += fn(t, t / d, i) * amp;
  }
}

function osc() { let ph = 0; return (f) => { ph += f / SR; return Math.sin(TAU * ph); }; }

const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
function acorde(nome) {
  const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[nome[0]];
  let r = base;
  let resto = nome.slice(1);
  if (resto.startsWith('b')) { r -= 1; resto = resto.slice(1); }
  if (resto.startsWith('#')) { r += 1; resto = resto.slice(1); }
  const menor = resto.startsWith('m');
  return { r, notas: [0, menor ? 3 : 4, 7].map((x) => r + x) };
}

// ---------------- efeitos ----------------
const SFX = {
  whoosh(b, t0, g, R) {
    const f = new Filtro('bp', 500, 1.1);
    render(b, t0 - 0.12, 0.5, (t, x, i) => {
      if (i % 32 === 0) f.set('bp', 300 * Math.pow(14, Math.sin(Math.PI * x)), 1.1);
      return f.run(R() * 2 - 1) * Math.pow(Math.sin(Math.PI * x), 1.5);
    }, 1.6 * g);
  },
  pop(b, t0, g) {
    const o = osc();
    render(b, t0, 0.1, (t) => o(1400 * Math.exp(-t * 28) + 260) * Math.exp(-t * 42), 0.8 * g);
  },
  gulp(b, t0, g) {
    for (const [dt, a] of [[0, 1], [0.15, 0.8]]) {
      const o = osc();
      render(b, t0 + dt, 0.13, (t, x) => o(140 + 300 * Math.exp(-x * 3)) * Math.sin(Math.PI * x), 0.9 * g * a);
    }
  },
  boing(b, t0, g) {
    const o = osc();
    render(b, t0, 0.6, (t, x) => {
      const f = 210 * (1 + 0.45 * Math.sin(TAU * 17 * t) * Math.exp(-5 * t)) * (1 + 0.7 * x);
      const s = o(f);
      return (s + 0.25 * s * s * s) * Math.exp(-3.4 * t);
    }, 0.55 * g);
  },
  buzz(b, t0, g) {
    const f = new Filtro('lp', 1800);
    let p1 = 0, p2 = 0;
    render(b, t0, 0.5, (t, x) => {
      p1 += 118 / SR; p2 += 125 / SR;
      const sq = Math.sign(Math.sin(TAU * p1)) + Math.sign(Math.sin(TAU * p2));
      const env = Math.min(1, t / 0.005) * Math.min(1, (1 - x) / 0.12);
      return f.run(sq) * env;
    }, 0.17 * g);
  },
  stamp(b, t0, g, R) {
    const o = osc();
    const f = new Filtro('lp', 450);
    render(b, t0, 0.5, (t) => o(48 + 50 * Math.exp(-t * 12)) * Math.exp(-t * 8) + f.run(R() * 2 - 1) * Math.exp(-t * 28) * 1.5, 1.1 * g);
  },
  bubbles(b, t0, g, R) {
    for (let k = 0; k < 14; k++) {
      const o = osc();
      const f0 = 500 + R() * 700;
      const d = 0.04 + R() * 0.05;
      render(b, t0 + R() * 1.1, d, (t, x) => o(f0 * (1 + x * 0.7)) * Math.sin(Math.PI * x), 0.3 * g);
    }
  },
  ding(b, t0, g) {
    const parc = [[1, 1, 2.2], [2.0, 0.45, 3.2], [2.76, 0.3, 4.5], [5.4, 0.12, 7]];
    const os = parc.map(() => osc());
    render(b, t0, 1.5, (t) => parc.reduce((a, [m, amp, dec], j) => a + os[j](1318.5 * m) * amp * Math.exp(-dec * t), 0) * Math.min(1, t / 0.002), 0.32 * g);
  },
  squish(b, t0, g, R) {
    const f = new Filtro('bp', 800, 3);
    render(b, t0, 0.32, (t, x, i) => {
      if (i % 32 === 0) f.set('bp', 900 - 550 * x, 3);
      return f.run(R() * 2 - 1) * Math.pow(Math.sin(Math.PI * x), 0.7) * (0.6 + 0.4 * Math.sin(TAU * 32 * t));
    }, 2.2 * g);
  },
  flush(b, t0, g, R) {
    const f = new Filtro('lp', 800, 0.9);
    render(b, t0, 2.4, (t, x, i) => {
      if (i % 64 === 0) f.set('lp', 500 + 2200 * Math.sin(Math.PI * Math.min(1, x * 1.3)), 0.9);
      const gorg = 0.6 + 0.4 * Math.sin(TAU * 6 * t + 3 * Math.sin(TAU * 0.7 * t));
      return f.run(R() * 2 - 1) * gorg * Math.min(1, t / 0.15) * Math.pow(1 - x, 0.8);
    }, 0.75 * g);
  },
  alarm(b, t0, g) {
    let ph = 0;
    render(b, t0, 1.2, (t, x) => {
      ph += (Math.floor(t / 0.15) % 2 ? 720 : 960) / SR;
      const s = Math.sin(TAU * ph) + Math.sin(TAU * ph * 3) / 3 + Math.sin(TAU * ph * 5) / 5;
      return s * Math.min(1, (1 - x) / 0.1);
    }, 0.16 * g);
  },
  crack(b, t0, g, R) {
    const pings = [0, 0.016 + R() * 0.006, 0.034 + R() * 0.008];
    for (const dt of pings) {
      const f = new Filtro('bp', 2400 + R() * 1400, 3.5);
      const o = osc();
      render(b, t0 + dt, 0.05, (t) => f.run(R() * 2 - 1) * Math.exp(-t * 700) * 4 + o(1900 + R() * 300) * Math.exp(-t * 900) * 0.5, 0.9 * g);
    }
    const o = osc();
    render(b, t0, 0.12, (t) => o(170) * Math.exp(-t * 55), 0.45 * g);
  },
  boom(b, t0, g, R) {
    const o = osc();
    const f = new Filtro('lp', 220);
    render(b, t0, 1.1, (t) => o(36 + 30 * Math.exp(-t * 6)) * Math.exp(-t * 3.2) + f.run(R() * 2 - 1) * Math.exp(-t * 7) * 1.6, 1.0 * g);
  },
  bloop(b, t0, g) {
    const o = osc();
    render(b, t0, 0.15, (t, x) => o(280 * Math.pow(3.2, x)) * Math.sin(Math.PI * x), 0.5 * g);
  },
  stretch(b, t0, g) {
    const f = new Filtro('bp', 900, 2);
    let ph = 0;
    render(b, t0, 0.5, (t, x) => {
      ph += (140 + 130 * x + 8 * Math.sin(TAU * 9 * t)) / SR;
      return f.run(2 * (ph % 1) - 1) * Math.sin(Math.PI * x);
    }, 0.5 * g);
  },
  riser(b, t0, g, R) {
    const f = new Filtro('bp', 400, 1.5);
    const o = osc();
    render(b, t0, 0.9, (t, x, i) => {
      if (i % 32 === 0) f.set('bp', 400 * Math.pow(12, x), 1.5);
      return (f.run(R() * 2 - 1) * 1.6 + o(220 * Math.pow(4, x)) * 0.25) * x * x * Math.min(1, (1 - x) / 0.04);
    }, 0.45 * g);
  },
  tick(b, t0, g) {
    for (let k = 0; k < 10; k++) {
      const o = osc();
      const f = k % 2 ? 1800 : 2500;
      render(b, t0 + k * 0.25, 0.04, (t) => o(f) * Math.exp(-t * 260), 0.3 * g);
    }
  },
  fail(b, t0, g) {
    const notas = [[392, 0.22], [370, 0.22], [349, 0.22], [311, 0.6]];
    let t = t0;
    const f = new Filtro('lp', 1400);
    for (const [hz, d] of notas) {
      let ph = 0;
      render(b, t, d, (tt, x) => {
        ph += hz * (1 + (d > 0.5 ? 0.02 * Math.sin(TAU * 6 * tt) : 0)) / SR;
        const s = Math.sin(TAU * ph) + 0.5 * Math.sin(TAU * ph * 2) + 0.33 * Math.sin(TAU * ph * 3);
        return f.run(s) * Math.min(1, tt / 0.02) * Math.min(1, (1 - x) / 0.15);
      }, 0.17 * g);
      t += d;
    }
  },
  dun(b, t0, g) {
    for (const [dt, hz] of [[0, 110], [0.32, 98]]) {
      const f = new Filtro('lp', 900);
      let ph = 0;
      render(b, t0 + dt, 0.7, (t) => {
        ph += hz / SR;
        const s = 2 * (ph % 1) - 1 + Math.sin(TAU * ph * 0.5) * 0.8;
        return f.run(s) * Math.exp(-t * 4);
      }, 0.45 * g);
    }
  },
  tada(b, t0, g, R) {
    [1046.5, 1318.5, 1568, 2093].forEach((hz, k) => {
      const o = osc();
      const o2 = osc();
      render(b, t0 + k * 0.07, 1.2, (t) => (o(hz) + 0.3 * o2(hz * 2.76)) * Math.exp(-t * 3), 0.2 * g);
    });
    const f = new Filtro('hp', 5000);
    render(b, t0, 1.0, (t) => f.run(R() * 2 - 1) * (R() < 0.02 ? 3 : 0.3) * Math.exp(-t * 3), 0.25 * g);
  },
  wind(b, t0, g, R, dMax) {
    const f = new Filtro('bp', 500, 0.8);
    const d = Math.max(0.6, dMax);
    render(b, t0, d, (t, x, i) => {
      if (i % 64 === 0) f.set('bp', 450 + 350 * Math.sin(TAU * 0.35 * t), 0.8);
      return f.run(R() * 2 - 1) * (0.6 + 0.4 * Math.sin(TAU * 0.5 * t + 1)) * Math.min(1, t / 0.3) * Math.min(1, (d - t) / 0.4);
    }, 1.1 * g);
  },
  fall(b, t0, g) {
    const o = osc();
    render(b, t0, 1.1, (t, x) => o(1500 * Math.pow(0.28, x)) * Math.sin(Math.PI * Math.min(1, x * 1.2)), 0.16 * g);
  },
  sizzle(b, t0, g, R, dMax) {
    const f = new Filtro('hp', 3000);
    const d = Math.max(1, dMax);
    render(b, t0, d, (t) => f.run((R() < 0.015 ? (R() * 2 - 1) * 6 : 0) + (R() * 2 - 1) * 0.25) * Math.min(1, t / 0.3) * Math.min(1, (d - t) / 0.4), 0.35 * g);
  },
  brake(b, t0, g) {
    const f = new Filtro('lp', 1200);
    let ph = 0;
    render(b, t0, 0.8, (t, x) => {
      ph += (70 + 430 * Math.pow(1 - x, 2)) / SR;
      return f.run(2 * (ph % 1) - 1) * Math.sin(Math.PI * Math.min(1, x * 1.1));
    }, 0.3 * g);
  },
  splash(b, t0, g, R) {
    const f = new Filtro('lp', 4000);
    render(b, t0, 1.0, (t, x, i) => {
      if (i % 32 === 0) f.set('lp', 4000 * Math.pow(0.15, x), 0.7);
      return f.run(R() * 2 - 1) * Math.exp(-t * 4) * Math.min(1, t / 0.01);
    }, 1.3 * g);
    SFX.bubbles(b, t0 + 0.15, g * 0.6, R);
  },
};

SFX.hic = (b, t0, g, R) => {
  const o = osc();
  const f = new Filtro('bp', 1400, 2);
  render(b, t0, 0.11, (t, x) => (o(780 - 380 * x) * 0.8 + f.run(R() * 2 - 1) * 1.5) * Math.sin(Math.PI * x) * Math.exp(-x * 2), 0.75 * g);
};
SFX.chuva = (b, t0, g, R, dMax) => {
  const f = new Filtro('hp', 1800);
  const d = Math.max(1, dMax);
  render(b, t0, d, (t) => f.run((R() * 2 - 1) * 0.5 + (R() < 0.004 ? (R() * 2 - 1) * 4 : 0)) * Math.min(1, t / 0.4) * Math.min(1, (d - t) / 0.4), 0.5 * g);
};
SFX.radio = (b, t0, g, R) => {
  const f = new Filtro('bp', 2200, 1.5);
  render(b, t0, 0.55, (t, x) => f.run(R() * 2 - 1) * (0.6 + 0.4 * Math.sin(2 * Math.PI * 23 * t)) * Math.sin(Math.PI * x), 1.2 * g);
  SFX.beep(b, t0 + 0.55, g * 0.8);
};
SFX.beep = (b, t0, g) => {
  const o = osc();
  render(b, t0, 0.12, (t, x) => o(1250) * Math.min(1, t / 0.005) * Math.min(1, (1 - x) / 0.2), 0.22 * g);
};

// ---------------- música ----------------
function marimba(b, t0, hz, amp) {
  const o1 = osc(), o2 = osc();
  render(b, t0, 0.6, (t) => (o1(hz) * Math.exp(-t * 7) + 0.22 * o2(hz * 4) * Math.exp(-t * 22)) * Math.min(1, t / 0.003), amp);
}
function pluck(b, t0, hz, amp, R, decay = 0.994) {
  // Karplus-Strong
  const n = Math.max(2, Math.round(SR / hz));
  const linha = new Float32Array(n).map(() => R() * 2 - 1);
  let j = 0;
  render(b, t0, 1.0, () => {
    const a = linha[j];
    const prox = linha[(j + 1) % n];
    linha[j] = (a + prox) * 0.5 * decay;
    j = (j + 1) % n;
    return a;
  }, amp);
}
function baixo(b, t0, hz, d, amp) {
  const o = osc();
  render(b, t0, d, (t, x) => { const s = o(hz); return (s + 0.3 * Math.sign(s) * s * s) * Math.exp(-t * 3) * Math.min(1, t / 0.01) * Math.min(1, (1 - x) / 0.1); }, amp);
}
function kick(b, t0, amp) {
  const o = osc();
  render(b, t0, 0.35, (t) => o(45 + 90 * Math.exp(-t * 30)) * Math.exp(-t * 9), amp);
}
function hat(b, t0, amp, R) {
  const f = new Filtro('hp', 7000);
  render(b, t0, 0.06, (t) => f.run(R() * 2 - 1) * Math.exp(-t * 70), amp);
}
function snap(b, t0, amp, R) {
  const f = new Filtro('bp', 1700, 1.2);
  render(b, t0, 0.15, (t) => f.run(R() * 2 - 1) * Math.exp(-t * 30), amp);
}
function pad(b, t0, d, notas, amp) {
  const os = notas.flatMap(() => [osc(), osc()]);
  const f = new Filtro('lp', 1100);
  render(b, t0, d + 0.8, (t) => {
    let s = 0;
    notas.forEach((m, k) => {
      const hz = midi(m);
      s += os[2 * k](hz * 1.003) + os[2 * k + 1](hz * 0.997) + 0.3 * Math.sin(TAU * hz * 2 * t);
    });
    const env = Math.min(1, t / 0.7) * (t > d ? Math.max(0, 1 - (t - d) / 0.8) : 1);
    return f.run(s) * env;
  }, amp);
}

function reverb(buf, mix = 0.18) {
  const combs = [1557, 1617, 1491, 1422].map((n) => ({ d: new Float32Array(Math.round(n * SR / 44100)), i: 0, fb: 0.8, lp: 0 }));
  const aps = [556, 441].map((n) => ({ d: new Float32Array(Math.round(n * SR / 44100)), i: 0 }));
  for (let k = 0; k < buf.length; k++) {
    const x = buf[k];
    let s = 0;
    for (const c of combs) {
      const y = c.d[c.i];
      c.lp = y * 0.75 + c.lp * 0.25;
      c.d[c.i] = x + c.lp * c.fb;
      c.i = (c.i + 1) % c.d.length;
      s += y;
    }
    s *= 0.25;
    for (const a of aps) {
      const y = a.d[a.i];
      a.d[a.i] = s + y * 0.5;
      a.i = (a.i + 1) % a.d.length;
      s = y - s * 0.5;
    }
    buf[k] = x + s * mix;
  }
}

export function gerarMusica(cfg, dur, seed = 7) {
  const R = rng(seed);
  const b = new Float32Array(Math.ceil((dur + 1.5) * SR));
  const beat = 60 / cfg.bpm;
  const compasso = beat * 4;
  const nComp = Math.ceil(dur / compasso) + 1;
  for (let c = 0; c < nComp; c++) {
    const t = c * compasso;
    const { r, notas } = acorde(cfg.acordes[c % cfg.acordes.length]);
    const tons = [notas[0], notas[1], notas[2], notas[0] + 12];
    const bateria = c >= 1;
    if (cfg.clima === 'brincalhao') {
      [0, 1, 2, 1, 3, 2, 1, 2].forEach((ix, k) => marimba(b, t + k * beat / 2, midi(tons[ix] + 60), k % 2 ? 0.16 : 0.22));
      baixo(b, t, midi(r + 36), beat * 0.9, 0.35);
      baixo(b, t + beat * 2, midi(r + 36), beat * 0.9, 0.3);
      baixo(b, t + beat * 3.5, midi(notas[2] + 36), beat * 0.45, 0.25);
      if (bateria) {
        for (let k = 0; k < 4; k++) {
          if (k % 2 === 0) kick(b, t + k * beat, 0.5);
          else snap(b, t + k * beat, 0.22, R);
          hat(b, t + k * beat + beat / 2, 0.12, R);
        }
      }
    } else if (cfg.clima === 'curioso') {
      [0, null, 2, 1, null, 2, 3, 1].forEach((ix, k) => { if (ix !== null) pluck(b, t + k * beat / 2, midi(tons[ix] + 60), 0.22, R, 0.993); });
      pluck(b, t, midi(r + 36), 0.4, R, 0.996);
      pluck(b, t + beat * 2, midi(notas[2] + 36), 0.32, R, 0.996);
      if (bateria) {
        kick(b, t, 0.45);
        kick(b, t + beat * 1.5, 0.3);
        snap(b, t + beat, 0.18, R);
        snap(b, t + beat * 3, 0.18, R);
        for (let k = 0; k < 8; k++) hat(b, t + k * beat / 2, k % 2 ? 0.1 : 0.05, R);
      }
    } else {
      pad(b, t, compasso, notas.map((m) => m + 48), 0.05);
      for (let k = 0; k < 8; k++) baixo(b, t + k * beat / 2, midi(r + 36), beat * 0.4, k % 2 ? 0.14 : 0.22);
      for (let k = 0; k < 4; k += 2) marimba(b, t + k * beat + beat * 0.5, midi(tons[Math.floor(R() * 4)] + 72), 0.08);
      if (bateria) {
        kick(b, t, 0.45);
        kick(b, t + beat * 2.5, 0.3);
        for (let k = 0; k < 8; k++) hat(b, t + k * beat / 2, 0.06, R);
        snap(b, t + beat * 2, 0.12, R);
      }
    }
  }
  reverb(b, 0.22);
  return b;
}

// ---------------- mixagem ----------------
export function mixar(tl, saida, { musica = true } = {}) {
  const N = Math.ceil(tl.dur * SR);
  const voz = new Float32Array(N);
  const fx = new Float32Array(N + SR * 3);
  const R = rng(1234);
  for (const b of tl.beats) {
    const raw = fs.readFileSync(b.audio);
    const dados = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
    const i0 = Math.round((b.start + b.pre) * SR);
    for (let i = 0; i < dados.length && i0 + i < N; i++) voz[i0 + i] += dados[i];
    for (const s of b.sfx) {
      const fn = SFX[s.tipo];
      if (!fn) throw new Error('efeito desconhecido: ' + s.tipo);
      fn(fx, b.start + s.t, s.ganho, R, b.dur - s.t);
    }
  }
  const mus = musica ? gerarMusica(tl.musica, tl.dur) : null;
  // envelope da voz para abaixar a música enquanto alguém fala
  const env = new Float32Array(N);
  let e = 0;
  const at = Math.exp(-1 / (0.01 * SR));
  const rl = Math.exp(-1 / (0.35 * SR));
  for (let i = 0; i < N; i++) {
    const a = Math.abs(voz[i]);
    e = a > e ? at * e + (1 - at) * a : rl * e + (1 - rl) * a;
    env[i] = e;
  }
  const out = Buffer.alloc(44 + N * 4);
  for (let i = 0; i < N; i++) {
    let x = voz[i] * 0.95 + fx[i] * 0.5;
    if (mus) {
      const duck = 1 - 0.55 * Math.min(1, env[i] / 0.05);
      const fade = Math.min(1, i / (SR * 0.05)) * Math.min(1, (N - i) / (SR * 0.25));
      x += mus[i] * 0.33 * duck * fade;
    }
    const y = Math.tanh(x * 0.9);
    const v = Math.max(-32767, Math.min(32767, Math.round(y * 32767)));
    out.writeInt16LE(v, 44 + i * 4);
    out.writeInt16LE(v, 46 + i * 4);
  }
  out.write('RIFF', 0); out.writeUInt32LE(36 + N * 4, 4); out.write('WAVE', 8);
  out.write('fmt ', 12); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(2, 22);
  out.writeUInt32LE(SR, 24); out.writeUInt32LE(SR * 4, 28); out.writeUInt16LE(4, 32); out.writeUInt16LE(16, 34);
  out.write('data', 36); out.writeUInt32LE(N * 4, 40);
  fs.writeFileSync(saida, out);
}
