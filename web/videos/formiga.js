// Vídeo 5: O que acontece se uma formiga cair de um prédio?
import {
  THREE, W, mat, mesh, group, rng, seg, smooth, easeOut, back, pulse, wob, lerp, textoContorno,
} from '../engine.js';
import { Boneco, POSES, criarOlho } from '../bonequinho.js';
import { RoundedBoxGeometry } from '../props.js';
import { pilula } from './chiclete.js';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const Z = V(0, 0, 1);

function criarFormiga() {
  const g = new THREE.Group();
  const corpo = group(g);
  const m = mat(0x4a2a18, { roughness: 0.3, clearcoat: 0.9 });
  mesh(new THREE.SphereGeometry(0.16, 24, 16), m, { pos: [-0.24, 0.2, 0], scale: [1.4, 1.05, 1], parent: corpo });
  mesh(new THREE.SphereGeometry(0.045, 12, 8), m, { pos: [-0.04, 0.17, 0], parent: corpo });
  mesh(new THREE.SphereGeometry(0.1, 20, 14), m, { pos: [0.08, 0.17, 0], scale: [1.35, 0.85, 0.85], parent: corpo });
  const cabeca = group(corpo, [0.3, 0.22, 0]);
  mesh(new THREE.SphereGeometry(0.13, 24, 16), m, { scale: [1, 0.95, 1.05], parent: cabeca });
  const olhos = [1, -1].map((sz) => {
    const ol = criarOlho(0.055);
    const d = V(0.75, 0.25, sz * 0.62).normalize();
    ol.g.position.copy(d).multiplyScalar(0.12);
    ol.g.quaternion.setFromUnitVectors(Z, d);
    cabeca.add(ol.g);
    return ol;
  });
  const sorriso = mesh(new THREE.TorusGeometry(0.035, 0.009, 6, 12, Math.PI), mat(0x1a0d06), { pos: [0.115, -0.05, 0], rot: [0, Math.PI / 2, Math.PI], parent: cabeca });
  for (const sz of [1, -1]) {
    const an = group(cabeca, [0.04, 0.1, sz * 0.05]);
    an.rotation.set(sz * 0.5, 0, -0.5);
    mesh(new THREE.CapsuleGeometry(0.012, 0.16, 4, 6), m, { pos: [0, 0.09, 0], parent: an });
    const ponta = group(an, [0, 0.18, 0]);
    ponta.rotation.z = 1.0;
    mesh(new THREE.CapsuleGeometry(0.012, 0.12, 4, 6), m, { pos: [0, 0.07, 0], parent: ponta });
  }
  const pernas = [];
  [-0.02, 0.08, 0.18].forEach((x, i) => {
    for (const sz of [1, -1]) {
      const p = group(corpo, [x, 0.14, sz * 0.05]);
      const sup = group(p);
      sup.rotation.set(sz * 1.0, 0, 0);
      mesh(new THREE.CapsuleGeometry(0.014, 0.12, 4, 6), m, { pos: [0, 0.07, 0], parent: sup });
      const inf = group(sup, [0, 0.14, 0]);
      inf.rotation.x = sz * 1.9;
      mesh(new THREE.CapsuleGeometry(0.012, 0.14, 4, 6), m, { pos: [0, 0.08, 0], parent: inf });
      pernas.push({ p, sup, sz, fase: (i + (sz > 0 ? 0 : 1)) % 2 ? Math.PI : 0, i });
    }
  });
  g.atualizar = (T, { andar = 0, abre = 0, expr = 'feliz', gx = 0, gy = 0 } = {}) => {
    pernas.forEach((pe) => {
      const sw = Math.sin(T * 14 + pe.fase) * andar;
      pe.p.rotation.set(0, sw * 0.45, 0);
      pe.sup.rotation.x = pe.sz * (1.0 + 0.45 * abre) - Math.max(0, sw) * 0.25 * pe.sz;
    });
    corpo.position.y = andar * 0.01 * Math.abs(Math.sin(T * 14));
    sorriso.visible = expr !== 'assustado';
    olhos.forEach((ol) => {
      ol.lid.scale.set(1, expr === 'tonto' ? 0.25 : 1, 1);
      ol.pupila.scale.setScalar(expr === 'assustado' ? 0.6 : 1);
      ol.pupila.position.set(gx * 0.012, gy * 0.014, ol.pupila.position.z);
    });
  };
  g.cabeca = cabeca;
  return g;
}

function criarGato() {
  const g = new THREE.Group();
  const laranja = mat(0xff9f43, { roughness: 0.55, clearcoat: 0.2, sheen: 0.4 });
  const branco = mat(0xfff4e6, { roughness: 0.6 });
  mesh(new THREE.CapsuleGeometry(0.24, 0.42, 8, 20), laranja, { rot: [Math.PI / 2, 0, 0], pos: [0, 0.45, 0], parent: g });
  mesh(new THREE.SphereGeometry(0.2, 20, 14), branco, { pos: [0, 0.36, 0.12], scale: [0.9, 0.7, 1.3], parent: g });
  const cab = group(g, [0, 0.66, 0.42]);
  mesh(new THREE.SphereGeometry(0.27, 32, 20), laranja, { scale: [1.08, 0.95, 0.95], parent: cab });
  mesh(new THREE.SphereGeometry(0.12, 16, 12), branco, { pos: [0, -0.08, 0.2], scale: [1.3, 0.8, 0.7], parent: cab });
  mesh(new THREE.SphereGeometry(0.035, 10, 8), mat(0xff7a9a), { pos: [0, -0.03, 0.27], parent: cab });
  for (const sx of [1, -1]) {
    mesh(new THREE.ConeGeometry(0.1, 0.18, 4), laranja, { pos: [sx * 0.15, 0.24, 0], rot: [0, 0, -sx * 0.3], parent: cab });
    const ol = criarOlho(0.075);
    const d = V(sx * 0.36, 0.18, 0.92).normalize();
    ol.g.position.copy(d).multiplyScalar(0.25);
    ol.g.quaternion.setFromUnitVectors(Z, d);
    cab.add(ol.g);
    for (const dy of [-0.02, 0.02]) mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.22, 4), mat(0x333333), { pos: [sx * 0.2, -0.06 + dy, 0.2], rot: [0, 0, Math.PI / 2 + sx * dy * 4], parent: cab, sombra: false });
  }
  const patas = [];
  for (const sx of [1, -1]) for (const sz of [1, -1]) {
    const p = group(g, [sx * 0.15, 0.35, sz * 0.22]);
    mesh(new THREE.CapsuleGeometry(0.065, 0.22, 4, 8), laranja, { pos: [0, -0.14, 0], parent: p });
    mesh(new THREE.SphereGeometry(0.075, 12, 8), branco, { pos: [0, -0.3, 0.02], parent: p });
    patas.push({ p, sx });
  }
  const rabo = new THREE.CatmullRomCurve3([V(0, 0.5, -0.3), V(0, 0.65, -0.55), V(0, 0.95, -0.6), V(0.05, 1.1, -0.45)]);
  const raboM = mesh(new THREE.TubeGeometry(rabo, 20, 0.05, 8), laranja, { parent: g });
  g.atualizar = (T, abre) => {
    patas.forEach(({ p, sx }) => p.rotation.set(0, 0, sx * (0.2 + 1.1 * abre) + 0.08 * Math.sin(T * 9 + sx)));
    raboM.rotation.y = 0.3 * Math.sin(T * 4);
  };
  return g;
}

function texturaJanelas(cor = '#5b6b82', luz = 0.35, seed = 1) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = cor;
  x.fillRect(0, 0, 256, 256);
  const R = rng(seed);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    x.fillStyle = R() < luz ? '#ffe7a3' : '#a9d4f5';
    x.fillRect(i * 64 + 12, j * 64 + 10, 40, 44);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export function predio(w, h, d, cor, seed) {
  const tx = texturaJanelas(cor, 0.3, seed);
  tx.repeat.set(w / 1.2, h / 1.2);
  const lado = new THREE.MeshStandardMaterial({ map: tx, roughness: 0.7 });
  const topo = new THREE.MeshStandardMaterial({ color: 0x8a8f99, roughness: 0.9 });
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [lado, lado, topo, topo, lado, lado]);
  m.receiveShadow = true;
  return m;
}

function seta(cor) {
  const g = new THREE.Group();
  const m = mat(cor, { roughness: 0.3, clearcoat: 0.8, emissive: cor, emissiveIntensity: 0.25 });
  const haste = mesh(new THREE.CylinderGeometry(0.07, 0.07, 1, 16), m, { pos: [0, 0.5, 0], parent: g });
  const ponta = mesh(new THREE.ConeGeometry(0.17, 0.32, 20), m, { parent: g });
  g.comprimento = (L) => {
    g.visible = L > 0.02;
    const l = Math.max(0.02, L);
    haste.scale.y = l;
    haste.position.y = l / 2;
    ponta.position.y = l + 0.14;
  };
  return g;
}

export function nuvem(R) {
  const g = new THREE.Group();
  const m = mat(0xffffff, { roughness: 1, clearcoat: 0 });
  const n = 4 + Math.floor(R() * 3);
  for (let i = 0; i < n; i++) mesh(new THREE.SphereGeometry(0.5 + R() * 0.5, 16, 12), m, { pos: [(i - n / 2) * 0.6, R() * 0.3, R() * 0.4], parent: g, sombra: false });
  return g;
}

function grafico(ctx, linhas, t) {
  linhas.forEach(([nome, v, cor, t0], i) => {
    const k = seg(t, t0, t0 + 0.5);
    if (t < t0) return;
    const y = 240 + i * 120;
    const larg = Math.max(18, (v / 200) * 540 * smooth(k));
    ctx.save();
    ctx.globalAlpha = Math.min(1, k * 3);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath(); ctx.roundRect(60, y - 44, 960, 88, 44); ctx.fill();
    ctx.fillStyle = cor;
    ctx.beginPath(); ctx.roundRect(330, y - 26, larg, 52, 26); ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = '#111'; ctx.stroke();
    ctx.restore();
    textoContorno(ctx, nome, 195, y, { size: 46, cor: '#fff', contorno: 0.18 });
    textoContorno(ctx, `${Math.round(v * smooth(k))} KM/H`, Math.min(330 + larg + 115, 940), y, { size: 46, cor: '#ffe135', contorno: 0.18 });
  });
}

export function criar(E) {
  const cara = new Boneco({ camisa: 0xef4444, estilo: 'espetado', cabelo: 0x3a2417, calca: 0x1f2937, fase: 0.6 });
  const formiga = criarFormiga();
  const gato = criarGato();
  const R = rng(5);

  // ---------- topo do prédio ----------
  const topo = E.set();
  const corpoPredio = predio(7, 40, 7, '#6b7a93', 3);
  corpoPredio.position.set(0, -20, -1.5);
  topo.add(corpoPredio);
  const mureta = mesh(new RoundedBoxGeometry(7, 0.42, 0.3, 2, 0.04), mat(0x9aa1ad, { roughness: 0.85 }), { pos: [0, 0.21, 1.85], parent: topo });
  void mureta;
  mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.4, 24), mat(0x6b7280, { roughness: 0.6, metalness: 0.3 }), { pos: [-2.2, 0.7, -2.5], parent: topo });
  const cidade = group(topo);
  for (let i = 0; i < 26; i++) {
    const h = 8 + R() * 22;
    const b = predio(3 + R() * 3, h, 3 + R() * 3, ['#7c8aa5', '#94a3b8', '#a3889a', '#8aa59a'][i % 4], 10 + i);
    b.position.set((R() - 0.5) * 50, -40 + h / 2, -12 - R() * 40 + (i % 3) * 4);
    cidade.add(b);
  }
  for (let i = 0; i < 8; i++) {
    const b = predio(3 + R() * 3, 30, 3 + R() * 3, '#8796ad', 60 + i);
    b.position.set((i % 2 ? 1 : -1) * (6 + R() * 6), -38 + R() * 6, 6 + R() * 14);
    cidade.add(b);
  }
  mesh(new THREE.PlaneGeometry(200, 200), mat(0x4b5563, { roughness: 1 }), { rot: [-Math.PI / 2, 0, 0], pos: [0, -40, 0], parent: topo, sombra: false });
  Array.from({ length: 5 }, (_, i) => { const n = nuvem(R); n.position.set(-12 + i * 6, 6 + R() * 5, -30 - R() * 10); n.scale.setScalar(2.5); topo.add(n); return n; });

  // ---------- calçada ----------
  const calcada = E.set();
  const piso = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const x = c.getContext('2d');
    x.fillStyle = '#c3c7cf'; x.fillRect(0, 0, 256, 256);
    x.fillStyle = '#9ea4ae'; x.fillRect(0, 0, 256, 6); x.fillRect(0, 0, 6, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(8, 3);
    return t;
  })();
  mesh(new THREE.BoxGeometry(16, 0.3, 6), new THREE.MeshStandardMaterial({ map: piso, roughness: 0.9 }), { pos: [0, 0.0, -1.4], parent: calcada });
  mesh(new THREE.BoxGeometry(16, 0.1, 6), mat(0x2f3338, { roughness: 0.95 }), { pos: [0, -0.2, 4.6], parent: calcada });
  for (let i = -3; i <= 3; i++) mesh(new THREE.BoxGeometry(0.9, 0.02, 0.12), mat(0xffffff, { roughness: 0.8 }), { pos: [i * 2.2, -0.14, 4.0], parent: calcada });
  const base = predio(16, 8, 1, '#a07a62', 77);
  base.position.set(0, 4.15, -4.6);
  calcada.add(base);
  const hidrante = group(calcada, [-1.7, 0.15, -0.6]);
  mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.6, 16), mat(0xe11d48, { roughness: 0.4, clearcoat: 0.6 }), { pos: [0, 0.3, 0], parent: hidrante });
  mesh(new THREE.SphereGeometry(0.17, 16, 12), mat(0xe11d48, { roughness: 0.4, clearcoat: 0.6 }), { pos: [0, 0.62, 0], parent: hidrante });

  // ---------- céu (queda) ----------
  const ceu = E.set();
  const nuvensCeu = Array.from({ length: 10 }, (_, i) => { const n = nuvem(R); n.userData = { x: (R() - 0.5) * 9, z: -2 - R() * 7, f: i / 10 }; ceu.add(n); return n; });
  const nL = 40;
  const linhas = new THREE.InstancedMesh(new THREE.BoxGeometry(0.02, 1, 0.02), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 }), nL);
  ceu.add(linhas);
  const dL = Array.from({ length: nL }, () => ({ x: (R() - 0.5) * 7, z: (R() - 0.5) * 4, f: R(), l: 1 + R() * 3 }));
  const peso = seta(0xff3b4d);
  const ar = seta(0x3da5ff);
  const peso2 = seta(0xff3b4d);
  const ar2 = seta(0x3da5ff);
  ceu.add(peso, ar, peso2, ar2);
  const o3 = new THREE.Object3D();
  function ceuBase(s, vel) {
    E.show(ceu);
    E.fundo(0x2f8fff, 0xd6f0ff, { chao: false, near: 30, far: 80 });
    E.gtao.enabled = false;
    nuvensCeu.forEach((n) => {
      const y = ((n.userData.f + s.T * vel * 0.05) % 1) * 26 - 13;
      n.position.set(n.userData.x, y, n.userData.z);
    });
    dL.forEach((d, i) => {
      const y = ((d.f + s.T * vel * 0.18) % 1) * 16 - 8;
      o3.position.set(d.x, y, d.z);
      o3.scale.set(1, d.l * Math.min(1, vel / 4), 1);
      o3.updateMatrix();
      linhas.setMatrixAt(i, o3.matrix);
    });
    linhas.instanceMatrix.needsUpdate = true;
    linhas.visible = vel > 0.6;
    [peso, ar, peso2, ar2].forEach((a) => (a.visible = false));
    gato.visible = false;
    cara.root.visible = false;
    formiga.visible = false;
  }

  return {
    beats: {
      gancho(s) {
        const { t } = s;
        E.show(topo);
        topo.add(cara.root, formiga);
        formiga.visible = true;
        E.fundo(0x3d9bff, 0xcfe9ff, { chao: false, near: 30, far: 110, neblina: 0xcfe9ff });
        E.sombra(0, 1, 5);
        const c = s.cue('cai');
        const k = Math.max(0, t - c);
        const escorrega = smooth(seg(t, c - 0.35, c));
        formiga.position.set(0.25, 0.42 + 0.03 * Math.sin(t * 9) * (t < c - 0.4 ? 1 : 0) - 4.9 * k * k * 0.6, 1.85 + 0.25 * escorrega + 0.4 * k);
        formiga.rotation.set(0, -Math.PI / 2 + 0.5, -escorrega * 0.6 - k * 4);
        formiga.scale.setScalar(0.55);
        formiga.atualizar(s.T, { andar: t < c - 0.5 ? 0.6 : 0, abre: k > 0 ? 1 : 0, expr: t < c - 0.3 ? 'feliz' : 'assustado', gy: -0.5 });
        cara.update(s.T, { ...POSES.encolhido, lKnee: 1.2, rKnee: 1.2, lLeg: 0.9, rLeg: 0.9, y: -0.28, x: -0.65, z: 1.15, ry: 0.55, headX: 0.35 }, { expr: t < c ? 'sorriso' : 'assustado', gy: -0.6, gx: 0.4 });
        const desce = smooth(seg(t, c, c + 0.7));
        E.cam(lerp(2.3, 1.2, desce), lerp(1.7, 0.2, desce), lerp(5.8, 5.0, desce), lerp(-0.25, 0.25, desce), lerp(0.55, -2.4, desce), lerp(1.4, 2.2, desce), 36);
        E.rotulo(formiga.position.clone().add(V(0, 0.2, 0)), 'FORMIGA', { k: seg(t, 0.4, 0.7) * (1 - seg(t, c - 0.3, c)), dx: 120, dy: -260, bg: '#ffd23f' });
      },

      nada(s) {
        const { t } = s;
        E.show(calcada);
        calcada.add(formiga);
        formiga.visible = true;
        E.fundo(0x8fd0ff, 0xe8f4ff, { chao: false, near: 12, far: 40 });
        E.sombra(0, 0, 4);
        const na = s.cue('nada');
        const an = s.cue('andando');
        const cai = seg(t, -0.6, na);
        const quica = t > na ? Math.abs(Math.sin((t - na) * 9)) * 0.15 * Math.max(0, 1 - (t - na) * 2) : 0;
        const anda = Math.max(0, t - an + 0.3);
        formiga.position.set(lerp(-0.2, -0.2, cai) + anda * 0.7, t < na ? lerp(2.8, 0.15, cai) : 0.15 + quica, 0.4);
        formiga.rotation.set(0, anda > 0 ? -0.2 : 0.5, t < na ? 0.4 * Math.sin(t * 6) : 0);
        formiga.scale.set(1.15 * (1 + 0.3 * pulse(t, na, 0.18)), 1.15 * (1 - 0.35 * pulse(t, na, 0.18)), 1.15);
        const tonto = t > na + 0.1 && t < an - 0.4;
        formiga.atualizar(s.T, { andar: anda > 0 ? 1 : 0, abre: t < na ? 1 : 0, expr: tonto ? 'tonto' : 'feliz', gx: 0.6 });
        formiga.cabeca.rotation.y = tonto ? 0.4 * Math.sin(t * 14) : 0;
        E.cam(0.7, 1.15, 4.4, 0.15, 0.3, 0, 36);
        const cab = formiga.cabeca.getWorldPosition(V());
        E.desenhar((ctx) => {
          if (!tonto) return;
          const [x, y] = E.projetar(cab);
          for (let i = 0; i < 3; i++) {
            const a = s.T * 6 + (i * Math.PI * 2) / 3;
            textoContorno(ctx, '★', x + Math.cos(a) * 90, y - 120 + Math.sin(a) * 25, { size: 60, cor: '#ffe135', contorno: 0.15 });
          }
        });
      },

      terminal(s) {
        const { t } = s;
        const pa = s.cue('para');
        const vel = 1 + 3 * easeOut(seg(t, 0, pa));
        ceuBase(s, vel);
        ceu.add(formiga);
        formiga.visible = true;
        formiga.position.set(0, 0.6 + 0.08 * Math.sin(s.T * 2), 0);
        formiga.rotation.set(0.3, -Math.PI / 2 + 0.3, -0.25 + 0.1 * Math.sin(s.T * 1.5));
        formiga.scale.setScalar(2.4);
        formiga.atualizar(s.T, { abre: 1, expr: 'feliz', gy: 0.3 });
        peso.position.set(0.1, 0.75, 0.2);
        peso.rotation.set(Math.PI, 0, 0);
        peso.comprimento(1.5);
        const kar = smooth(seg(t, s.cue('ar') - 0.2, pa));
        ar.position.set(0.1, 1.3, 0.2);
        ar.rotation.set(0, 0, 0);
        ar.comprimento(1.1 * kar);
        E.cam(0.3, 0.7, 6.0, 0, 0.7, 0, 36);
        E.rotulo(V(0.1, -0.9, 0.2), 'PESO', { k: seg(t, 0.4, 0.7), dx: 200, dy: 0, bg: '#ff8fa3' });
        E.rotulo(V(0.1, 1.3 + 1.1 * kar, 0.2), 'AR', { k: seg(t, s.cue('ar'), s.cue('ar') + 0.3), dx: 200, dy: 0, bg: '#9fd4ff' });
        E.desenhar((ctx) => {
          if (t > pa) textoContorno(ctx, 'EQUILÍBRIO = VELOCIDADE MÁXIMA', W / 2, 330, { size: 52, scale: back(seg(t, pa, pa + 0.25)), cor: '#ffe135' });
        });
      },

      humano(s) {
        const { t } = s;
        ceuBase(s, 9);
        ceu.add(cara.root);
        gato.visible = false;
        formiga.visible = false;
        cara.update(s.T, { ...POSES.queda, y: -0.3 + 0.1 * Math.sin(s.T * 2), rz: 0.06 * Math.sin(s.T * 1.3), cheeks: 0.3 * Math.abs(wob(s.T * 25)) }, { expr: 'assustado', boca: 0.6 + 0.3 * Math.abs(wob(s.T * 18)) });
        E.cam(0.2, -0.6, 5.2, 0, 0.9, 0, 38);
        E.tremer(0.35);
        const v = s.cue('v');
        E.desenhar((ctx) => grafico(ctx, [['HUMANO', 200, '#ff5c5c', v - 0.3]], t));
      },

      gato(s) {
        const { t } = s;
        ceuBase(s, 5);
        ceu.add(gato);
        cara.root.visible = false;
        formiga.visible = false;
        gato.visible = true;
        gato.position.set(0, 0.2 + 0.1 * Math.sin(s.T * 2), 0);
        gato.rotation.set(-0.15, 0.25 * Math.sin(s.T * 0.8), 0.08 * Math.sin(s.T * 1.6));
        gato.scale.setScalar(1.6);
        gato.atualizar(s.T, 1);
        E.cam(0.2, 1.2, 4.8, 0, 0.55, 0, 38);
        E.tremer(0.2);
        const v = s.cue('v');
        E.desenhar((ctx) => grafico(ctx, [['HUMANO', 200, '#ff5c5c', -9], ['GATO', 100, '#ff9f43', v - 0.3]], t));
      },

      formiga(s) {
        const { t } = s;
        ceuBase(s, 0.5);
        ceu.add(formiga);
        formiga.visible = true;
        formiga.position.set(0, 0.6 + 0.1 * Math.sin(s.T * 1.5), 0);
        formiga.rotation.set(0.2, -Math.PI / 2 + 0.35 + 0.2 * Math.sin(s.T * 0.7), -0.2 + 0.15 * Math.sin(s.T));
        formiga.scale.setScalar(2.6);
        formiga.atualizar(s.T, { abre: 1, expr: 'feliz', gy: 0.2 });
        E.cam(0.3, 0.9, 5.4, 0, 0.75, 0, 36);
        const v = s.cue('v');
        const an = s.cue('andando');
        E.desenhar((ctx) => {
          grafico(ctx, [['HUMANO', 200, '#ff5c5c', -9], ['GATO', 100, '#ff9f43', -9], ['FORMIGA', 6, '#5cff72', v - 0.3]], t);
          if (t > an - 0.1) textoContorno(ctx, '≈ UMA CAMINHADA RÁPIDA', W / 2, 640, { size: 56, scale: back(seg(t, an - 0.1, an + 0.15)), cor: '#ffffff' });
        });
      },

      porque(s) {
        const { t } = s;
        ceuBase(s, 2);
        ceu.add(formiga, cara.root);
        formiga.visible = true;
        formiga.position.set(-0.95, 1.3, 0.3);
        formiga.rotation.set(0.2, -Math.PI / 2 + 0.3, -0.2);
        formiga.scale.setScalar(1.6);
        formiga.atualizar(s.T, { abre: 1, expr: 'feliz' });
        cara.update(s.T, { ...POSES.queda, s: 0.75, x: 0.85, y: -0.6, rz: 0.06 * Math.sin(s.T * 1.3) }, { expr: 'assustado', boca: 0.5 });
        const ka = smooth(seg(t, s.cue('area') - 0.2, s.cue('area') + 0.4));
        peso.position.set(-0.95, 1.2, 0.4); peso.rotation.set(Math.PI, 0, 0); peso.comprimento(0.7);
        ar.position.set(-0.95, 1.9, 0.4); ar.rotation.set(0, 0, 0); ar.comprimento(0.7 * ka);
        peso2.position.set(0.85, -0.2, 0.4); peso2.rotation.set(Math.PI, 0, 0); peso2.comprimento(1.6);
        ar2.position.set(0.85, 1.4, 0.4); ar2.rotation.set(0, 0, 0); ar2.comprimento(0.45 * ka);
        E.cam(0, 0.8, 7.2, 0, 0.8, 0, 36);
        E.rotulo(V(-0.95, 2.0 + 0.7 * ka, 0.4), 'MUITO AR', { k: ka, dx: 170, dy: 30, bg: '#9fd4ff' });
        E.rotulo(V(0.85, -1.9, 0.4), 'MUITO PESO', { k: ka, dx: 0, dy: 150, bg: '#ff8fa3' });
        E.desenhar((ctx) => {
          const k = back(seg(t, 0.3, 0.6));
          if (k > 0.01) textoContorno(ctx, 'ÁREA ÷ PESO', W / 2, 330, { size: 96, scale: k, cor: '#ffe135' });
        });
      },

      final(s) {
        const { t } = s;
        E.show(calcada);
        calcada.add(formiga);
        E.fundo(0x8fd0ff, 0xe8f4ff, { chao: false, near: 12, far: 40 });
        E.sombra(0, 1, 4);
        const dg = s.cue('degrau');
        const pulo = seg(t, dg - 0.15, dg + 0.35);
        const zAnda = lerp(-0.2, 1.48, smooth(seg(t, 0, dg - 0.15)));
        const z = pulo > 0 ? lerp(1.48, 1.95, pulo) : zAnda;
        const y = pulo > 0 ? lerp(0.15, -0.15, pulo) + Math.sin(Math.PI * pulo) * 0.35 : 0.15;
        formiga.visible = true;
        formiga.position.set(0.1, y, z);
        formiga.rotation.set(0, -Math.PI / 2 + 0.25, 0);
        formiga.scale.setScalar(1.1);
        formiga.atualizar(s.T, { andar: t < dg - 0.15 || t > dg + 0.4 ? 1 : 0, abre: pulo > 0 && pulo < 1 ? 0.6 : 0, expr: 'feliz', gx: 0.5 });
        E.cam(2.4, 1.4, 5.2, 0.0, 0.2, 1.3, 36);
        const cta = seg(t, s.dur - 1.5, s.dur - 1.2);
        E.desenhar((ctx) => {
          if (t > dg) textoContorno(ctx, 'TIPO UM DEGRAU 😎', W / 2, 520, { size: 70, scale: back(seg(t, dg, dg + 0.25)), cor: '#ffe135' });
          if (cta > 0) pilula(ctx, 'SIGA PRA MAIS CURIOSIDADES!', W / 2, 330, back(cta));
        });
      },
    },
  };
}
