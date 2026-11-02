// Bonequinho estilo "vinil": cabeça grande, corpo de feijão, rosto expressivo e esqueleto simples.
import { THREE, mat, mesh, group, lerp } from './engine.js';

const Z = new THREE.Vector3(0, 0, 1);
const dir = (x, y, z) => new THREE.Vector3(x, y, z).normalize();

// coloca um objeto na superfície de uma esfera, com o +z local apontando para fora
function naEsfera(obj, centro, raio, d, lift = 0) {
  obj.position.copy(centro).addScaledVector(d, raio + lift);
  obj.quaternion.setFromUnitVectors(Z, d);
  return obj;
}

export function criarOlho(tam = 0.125, corPupila = 0x1b1b1b) {
  const g = new THREE.Group();
  const lid = new THREE.Group();
  g.add(lid);
  const branco = mesh(new THREE.SphereGeometry(tam, 24, 16), mat(0xffffff, { roughness: 0.15, clearcoat: 1 }), { scale: [0.88, 1.12, 0.42], parent: lid });
  const pupila = group(lid, [0, 0, tam * 0.3]);
  mesh(new THREE.SphereGeometry(tam * 0.56, 20, 14), mat(corPupila, { roughness: 0.1, clearcoat: 1 }), { scale: [1, 1.1, 0.45], parent: pupila });
  mesh(new THREE.SphereGeometry(tam * 0.17, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }), { pos: [tam * 0.2, tam * 0.28, tam * 0.24], parent: pupila, sombra: false });
  // olho fechado feliz (arco)
  const arco = mesh(new THREE.TorusGeometry(tam * 0.62, tam * 0.16, 8, 20, Math.PI), mat(0x2a1a14), { pos: [0, -tam * 0.2, tam * 0.2], parent: g });
  arco.visible = false;
  return { g, lid, branco, pupila, arco, tam };
}

const DEF = {
  x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 1, squash: 0, bob: 0, respira: 1, cheeks: 0,
  spineX: 0, spineY: 0, spineZ: 0, headX: 0, headY: 0, headZ: 0,
  lArmOut: 0.14, lArmFwd: 0, lArmTwist: 0, lElbow: 0.2,
  rArmOut: 0.14, rArmFwd: 0, rArmTwist: 0, rElbow: 0.2,
  lLeg: 0, lKnee: 0, lLegOut: 0.02, rLeg: 0, rKnee: 0, rLegOut: 0.02,
};

// Poses nomeadas (parciais; o resto vem de DEF)
export const POSES = {
  idle: {},
  cintura: { lArmOut: 0.75, lArmFwd: -0.15, lElbow: 1.9, lArmTwist: -0.6, rArmOut: 0.75, rArmFwd: -0.15, rElbow: 1.9, rArmTwist: -0.6 },
  bracosAbertos: { lArmOut: 1.25, lElbow: 0.35, rArmOut: 1.25, rElbow: 0.35 },
  comemorar: { lArmOut: 2.55, lElbow: 0.3, rArmOut: 2.55, rElbow: 0.3, headX: -0.15 },
  apontarFrente: { rArmFwd: 1.45, rArmOut: 0.1, rElbow: 0.05 },
  dedoBalanca: { rArmFwd: 0.9, rArmOut: 0.25, rElbow: 1.7, rArmTwist: 0.3, lArmOut: 0.7, lArmFwd: -0.15, lElbow: 1.9, lArmTwist: -0.6 },
  pensando: { rArmFwd: 0.75, rArmOut: -0.05, rElbow: 2.25, rArmTwist: 0.5, headZ: 0.12 },
  maosRosto: { lArmFwd: 0.8, lArmOut: 0.12, lElbow: 2.35, lArmTwist: -0.5, rArmFwd: 0.8, rArmOut: 0.12, rElbow: 2.35, rArmTwist: -0.5 },
  maosJuntas: { lArmFwd: 0.95, lArmOut: -0.42, lElbow: 1.15, rArmFwd: 0.95, rArmOut: -0.42, rElbow: 1.15 },
  maosEsticadas: { lArmFwd: 1.5, lArmOut: -0.28, lElbow: 0.05, rArmFwd: 1.5, rArmOut: -0.28, rElbow: 0.05, spineX: 0.06 },
  sentado: { y: 0, lLeg: 1.5, lKnee: 1.5, rLeg: 1.5, rKnee: 1.5, lLegOut: 0.12, rLegOut: 0.12 },
  queda: { lArmOut: 2.0, lElbow: 0.5, rArmOut: 2.0, rElbow: 0.5, lLeg: -0.35, lKnee: 0.8, rLeg: 0.25, rKnee: 0.6, lLegOut: 0.25, rLegOut: 0.25 },
  mergulho: { lArmOut: 2.9, lElbow: 0.05, rArmOut: 2.9, rElbow: 0.05, lLeg: -0.1, rLeg: -0.1 },
  encolhido: { lArmFwd: 0.9, lArmOut: -0.2, lElbow: 1.9, rArmFwd: 0.9, rArmOut: -0.2, rElbow: 1.9, spineX: 0.15, headX: 0.1, lKnee: 0.35, rKnee: 0.35, lLeg: 0.15, rLeg: 0.15 },
  nadando: { lArmOut: 1.15, lArmFwd: 0.4, lElbow: 0.6, rArmOut: 1.15, rArmFwd: 0.4, rElbow: 0.6 },
  maoNaBarriga: { lArmFwd: 0.55, lArmOut: -0.15, lElbow: 1.25, rArmFwd: 0.3, rArmOut: 0.2, rElbow: 0.3 },
  segurandoJornal: { lArmFwd: 1.15, lArmOut: -0.05, lElbow: 1.0, rArmFwd: 1.15, rArmOut: -0.05, rElbow: 1.0 },
};

export const misturar = (a, b, k) => {
  const pa = typeof a === 'string' ? POSES[a] : a;
  const pb = typeof b === 'string' ? POSES[b] : b;
  const out = {};
  for (const key of new Set([...Object.keys(pa), ...Object.keys(pb)])) {
    const va = pa[key] ?? DEF[key];
    const vb = pb[key] ?? DEF[key];
    out[key] = lerp(va, vb, k);
  }
  return out;
};

const EXPR = {
  neutro: { boca: 'smile', bocaS: 0.65 },
  sorriso: { boca: 'smile', bocaS: 1, brow: [0.02, -0.05] },
  feliz: { boca: 'grin', brow: [0.03, -0.1], blush: 1 },
  surpreso: { boca: 'o', brow: [0.07, -0.12], olho: [1.08, 1.15], pupila: 0.8 },
  assustado: { boca: 'open', abre: 0.85, brow: [0.08, -0.38], olho: [1.12, 1.2], pupila: 0.55 },
  triste: { boca: 'frown', brow: [0.02, -0.42], olho: [1, 0.92], pupila: 1.05 },
  bravo: { boca: 'frown', brow: [-0.035, 0.45], olho: [1, 0.78], pupila: 0.9 },
  aliviado: { boca: 'smile', bocaS: 1, fechado: true, brow: [0.03, -0.22], blush: 1 },
  dor: { boca: 'open', abre: 0.5, fechado: true, brow: [-0.01, -0.3] },
  confuso: { boca: 'flat', browL: [0.08, -0.22], browR: [-0.02, 0.22], pupila: 0.9 },
  desconfiado: { boca: 'flat', olho: [1, 0.5], brow: [-0.025, 0.2] },
  orgulhoso: { boca: 'smile', bocaS: 1.1, olho: [1, 0.55], brow: [0.05, -0.12], blush: 1 },
  mastigando: { boca: 'smile', bocaS: 0.8, blush: 0.6 },
  calor: { boca: 'open', abre: 0.55, brow: [0.02, -0.35], olho: [1, 0.75], pupila: 0.9, blush: 1 },
};

export class Boneco {
  constructor(o = {}) {
    const c = (this.o = {
      pele: 0xffcfa8, camisa: 0x3d7cff, calca: 0x2b3142, sapato: 0xf4f4f4, cabelo: 0x3a2417,
      estilo: 'curto', oculos: false, bigode: false, mangaLonga: false, ...o,
    });
    this.fase = (o.fase ?? 0.37) * 10;
    const M = (this.m = {
      pele: mat(c.pele, { roughness: 0.55, clearcoat: 0.18, sheen: 0.25, sheenColor: 0xffffff }),
      camisa: mat(c.camisa, { roughness: 0.62, clearcoat: 0.1 }),
      calca: mat(c.calca, { roughness: 0.7, clearcoat: 0.05 }),
      sapato: mat(c.sapato, { roughness: 0.38, clearcoat: 0.5 }),
      cabelo: mat(c.cabelo, { roughness: 0.45, clearcoat: 0.35, side: THREE.DoubleSide }),
      linha: mat(0x2a1a14, { roughness: 0.6 }),
      boca: mat(0x4a1720, { roughness: 0.6 }),
      lingua: mat(0xff7486, { roughness: 0.5 }),
      dente: mat(0xffffff, { roughness: 0.2, clearcoat: 1 }),
    });

    this.root = new THREE.Group();
    this.root.rotation.order = 'YXZ';
    this.hips = group(this.root, [0, 0.68, 0]);
    mesh(new THREE.SphereGeometry(0.3, 32, 20), M.calca, { pos: [0, 0.02, 0], scale: [1, 0.62, 0.82], parent: this.hips });
    this.spine = group(this.hips, [0, 0.02, 0]);
    this.torso = mesh(new THREE.CapsuleGeometry(0.31, 0.32, 10, 24), M.camisa, { pos: [0, 0.34, 0], scale: [1, 1, 0.84], parent: this.spine });
    this.neck = group(this.spine, [0, 0.74, 0]);
    this.head = group(this.neck);

    const HC = (this.HC = new THREE.Vector3(0, 0.5, 0));
    const R = (this.R = 0.56);
    this.headMesh = mesh(new THREE.SphereGeometry(R, 48, 32), M.pele, { pos: [0, 0.5, 0], scale: [1, 0.95, 0.97], parent: this.head });
    for (const sx of [1, -1]) mesh(new THREE.SphereGeometry(0.12, 16, 12), M.pele, { pos: [sx * 0.54, 0.5, -0.02], scale: [0.5, 1, 0.8], parent: this.head });
    this.head.add(naEsfera(mesh(new THREE.SphereGeometry(0.055, 14, 10), M.pele), HC, R * 0.95, dir(0, -0.1, 1)));

    this.olhos = [1, -1].map((sx) => {
      const ol = criarOlho(0.125);
      this.head.add(naEsfera(ol.g, HC, R * 0.94, dir(sx * 0.34, 0.1, 0.94)));
      return ol;
    });
    this.brows = [1, -1].map((sx) => {
      const g = naEsfera(new THREE.Group(), HC, R * 0.95, dir(sx * 0.32, 0.37, 0.87), 0.01);
      const inner = group(g);
      mesh(new THREE.CapsuleGeometry(0.027, 0.12, 4, 8), M.linha, { rot: [0, 0, Math.PI / 2], parent: inner });
      this.head.add(g);
      return inner;
    });
    this.blush = [1, -1].map((sx) => {
      const b = new THREE.Mesh(new THREE.CircleGeometry(0.075, 20), new THREE.MeshBasicMaterial({ color: 0xff7d8f, transparent: true, opacity: 0.5, depthWrite: false }));
      this.head.add(naEsfera(b, HC, R * 0.95, dir(sx * 0.46, -0.12, 0.88), 0.012));
      return b;
    });

    // boca
    const bocaG = (this.bocaG = naEsfera(new THREE.Group(), HC, R * 0.95, dir(0, -0.27, 0.96), 0.008));
    this.head.add(bocaG);
    this.bocas = {
      smile: mesh(new THREE.TorusGeometry(0.105, 0.024, 8, 24, Math.PI), M.linha, { rot: [0, 0, Math.PI], pos: [0, 0.04, 0], parent: bocaG }),
      frown: mesh(new THREE.TorusGeometry(0.09, 0.024, 8, 24, Math.PI), M.linha, { pos: [0, -0.045, 0], parent: bocaG }),
      flat: mesh(new THREE.CapsuleGeometry(0.022, 0.12, 4, 8), M.linha, { rot: [0, 0, Math.PI / 2], parent: bocaG }),
      o: mesh(new THREE.SphereGeometry(0.075, 20, 14), M.boca, { scale: [0.85, 1.1, 0.35], parent: bocaG }),
      open: group(bocaG),
      grin: group(bocaG),
    };
    mesh(new THREE.SphereGeometry(0.12, 24, 16), M.boca, { scale: [1, 0.8, 0.35], parent: this.bocas.open });
    mesh(new THREE.SphereGeometry(0.07, 16, 12), M.lingua, { pos: [0, -0.05, 0.02], scale: [1.2, 0.6, 0.5], parent: this.bocas.open });
    const meiaLua = new THREE.CircleGeometry(0.14, 28, Math.PI, Math.PI);
    mesh(meiaLua, M.boca, { pos: [0, 0.035, 0.012], parent: this.bocas.grin });
    mesh(new THREE.CircleGeometry(0.06, 16, Math.PI, Math.PI), M.lingua, { pos: [0, -0.05, 0.016], scale: [1.3, 0.8, 1], parent: this.bocas.grin });
    mesh(new THREE.BoxGeometry(0.2, 0.03, 0.01), M.dente, { pos: [0, 0.02, 0.018], parent: this.bocas.grin });

    this.cabelo(c.estilo);
    if (c.oculos) this.criarOculos();
    if (c.bigode) {
      const bg = naEsfera(new THREE.Group(), HC, R * 0.95, dir(0, -0.17, 0.98), 0.02);
      for (const sx of [1, -1]) mesh(new THREE.CapsuleGeometry(0.04, 0.09, 4, 8), M.cabelo, { pos: [sx * 0.07, 0, 0], rot: [0, 0, sx * 1.25], parent: bg });
      this.head.add(bg);
    }

    // braços
    this.braco = [1, -1].map((sx) => {
      const sh = group(this.spine, [sx * 0.37, 0.55, 0]);
      mesh(new THREE.SphereGeometry(0.1, 16, 12), M.camisa, { parent: sh });
      mesh(new THREE.CapsuleGeometry(0.088, 0.2, 6, 14), c.mangaLonga ? M.camisa : M.camisa, { pos: [0, -0.15, 0], parent: sh });
      const el = group(sh, [0, -0.3, 0]);
      mesh(new THREE.CapsuleGeometry(0.078, 0.18, 6, 14), c.mangaLonga ? M.camisa : M.pele, { pos: [0, -0.13, 0], parent: el });
      const mao = group(el, [0, -0.31, 0]);
      mesh(new THREE.SphereGeometry(0.115, 20, 14), M.pele, { scale: [1, 0.95, 0.85], parent: mao });
      mesh(new THREE.SphereGeometry(0.048, 12, 10), M.pele, { pos: [-sx * 0.035, 0.04, 0.09], parent: mao });
      return { sh, el, mao };
    });
    // pernas
    this.perna = [1, -1].map((sx) => {
      const hp = group(this.hips, [sx * 0.15, -0.06, 0]);
      mesh(new THREE.CapsuleGeometry(0.115, 0.14, 6, 14), M.calca, { pos: [0, -0.12, 0], parent: hp });
      const kn = group(hp, [0, -0.27, 0]);
      mesh(new THREE.CapsuleGeometry(0.1, 0.12, 6, 14), M.pele, { pos: [0, -0.1, 0], parent: kn });
      mesh(new THREE.SphereGeometry(0.13, 20, 14), M.sapato, { pos: [0, -0.255, 0.05], scale: [1, 0.62, 1.45], parent: kn });
      return { hp, kn };
    });
  }

  cabelo(estilo) {
    const { HC, R } = this;
    const M = this.m;
    const capa = () => mesh(new THREE.SphereGeometry(R * 1.045, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.5), M.cabelo, { pos: [0, 0.5, 0], rot: [-0.3, 0, 0], scale: [1, 0.97, 1], parent: this.head });
    if (estilo === 'curto' || estilo === 'espetado' || estilo === 'coque' || estilo === 'longo') {
      capa();
      const franja = [[-0.42, 0.66, 0.5], [-0.16, 0.76, 0.58], [0.12, 0.77, 0.58], [0.38, 0.68, 0.52]];
      for (const [x, y, z] of franja) this.head.add(naEsfera(mesh(new THREE.SphereGeometry(0.15, 16, 12), M.cabelo, { scale: [1, 0.72, 0.6] }), HC, R * 0.93, dir(x, y, z)));
    }
    if (estilo === 'espetado') {
      const n = estilo === 'espetado' ? 7 : 2;
      for (let i = 0; i < n; i++) {
        const a = (i / Math.max(1, n - 1) - 0.5) * 1.6;
        const d = dir(Math.sin(a) * 0.5, 0.95, -0.15 + Math.cos(a) * 0.1);
        const cone = mesh(new THREE.ConeGeometry(0.1, 0.3, 10), M.cabelo);
        naEsfera(cone, HC, R * 0.98, d, 0.08);
        cone.rotateX(Math.PI / 2);
        this.head.add(cone);
      }
    }
    if (estilo === 'coque') {
      mesh(new THREE.SphereGeometry(0.24, 24, 16), M.cabelo, { pos: [0, 1.12, -0.22], parent: this.head });
      mesh(new THREE.TorusGeometry(0.14, 0.035, 8, 20), mat(0xff4f8b), { pos: [0, 0.98, -0.18], rot: [Math.PI / 2 + 0.4, 0, 0], parent: this.head });
    }
    if (estilo === 'longo') {
      mesh(new THREE.CapsuleGeometry(0.42, 0.35, 8, 20), M.cabelo, { pos: [0, 0.28, -0.25], scale: [1.18, 1, 0.6], parent: this.head });
    }
    if (estilo === 'careca') {
      for (const sx of [1, -1]) mesh(new THREE.SphereGeometry(0.18, 16, 12), M.cabelo, { pos: [sx * 0.5, 0.58, -0.14], scale: [0.62, 0.95, 1.1], parent: this.head });
      mesh(new THREE.SphereGeometry(0.3, 20, 14), M.cabelo, { pos: [0, 0.5, -0.44], scale: [1.4, 0.75, 0.55], parent: this.head });
    }
  }

  criarOculos() {
    const { HC, R } = this;
    const m = mat(0x1d1d24, { roughness: 0.3, clearcoat: 0.6 });
    const lente = new THREE.MeshPhysicalMaterial({ color: 0xbfe3ff, roughness: 0.05, transparent: true, opacity: 0.25, depthWrite: false });
    for (const sx of [1, -1]) {
      const g = naEsfera(new THREE.Group(), HC, R * 0.94, dir(sx * 0.34, 0.1, 0.94), 0.09);
      mesh(new THREE.TorusGeometry(0.15, 0.022, 8, 28), m, { parent: g });
      mesh(new THREE.CircleGeometry(0.15, 24), lente, { parent: g, sombra: false });
      this.head.add(g);
    }
    const ponte = naEsfera(new THREE.Group(), HC, R * 0.94, dir(0, 0.12, 1), 0.1);
    mesh(new THREE.CapsuleGeometry(0.018, 0.08, 4, 8), m, { rot: [0, 0, Math.PI / 2], parent: ponte });
    this.head.add(ponte);
  }

  // posição de uma mão em coordenadas do mundo
  maoMundo(lado = 'r', alvo = new THREE.Vector3()) {
    this.root.updateWorldMatrix(true, true);
    return this.braco[lado === 'l' ? 0 : 1].mao.getWorldPosition(alvo);
  }
  cabecaMundo(alvo = new THREE.Vector3(), dy = 0.5) {
    this.root.updateWorldMatrix(true, true);
    return this.head.localToWorld(alvo.set(0, dy, 0));
  }
  bocaMundo(alvo = new THREE.Vector3()) {
    this.root.updateWorldMatrix(true, true);
    return this.bocaG.getWorldPosition(alvo);
  }

  update(T, P = {}, F = {}) {
    const p = { ...DEF, ...(typeof P === 'string' ? POSES[P] : P) };
    const r = this.root;
    r.visible = true;
    r.position.set(p.x, p.y, p.z);
    r.rotation.set(p.rx, p.ry, p.rz);
    r.scale.set(p.s * (1 + p.squash * 0.5), p.s * (1 - p.squash), p.s * (1 + p.squash * 0.5));
    const resp = Math.sin(T * 2.6 + this.fase) * 0.014 * p.respira;
    this.hips.position.y = 0.68 + p.bob;
    this.spine.rotation.set(p.spineX + resp * 0.6, p.spineY, p.spineZ);
    this.torso.scale.set(1 - resp * 0.3, 1 + resp, 0.84);
    this.neck.rotation.set(p.headX - resp * 0.5, p.headY, p.headZ);
    this.head.scale.set(1 + p.cheeks * 0.12, 1 + p.cheeks * 0.02, 1 + p.cheeks * 0.1);
    const [L, Rb] = this.braco;
    L.sh.rotation.set(-p.lArmFwd, p.lArmTwist, p.lArmOut);
    L.el.rotation.set(-p.lElbow, 0, 0);
    Rb.sh.rotation.set(-p.rArmFwd, -p.rArmTwist, -p.rArmOut);
    Rb.el.rotation.set(-p.rElbow, 0, 0);
    const [PL, PR] = this.perna;
    PL.hp.rotation.set(-p.lLeg, 0, p.lLegOut);
    PL.kn.rotation.x = p.lKnee;
    PR.hp.rotation.set(-p.rLeg, 0, -p.rLegOut);
    PR.kn.rotation.x = p.rKnee;
    this.rosto(T, F);
  }

  rosto(T, F = {}) {
    const e = EXPR[F.expr ?? 'neutro'] ?? EXPR.neutro;
    const ph = (T + this.fase) % 3.4;
    const piscar = F.piscar === false ? 1 : 1 - Math.max(0, 1 - Math.abs(ph - 0.08) / 0.08);
    const olho = e.olho ?? [1, 1];
    const pup = (e.pupila ?? 1) * (F.pupila ?? 1);
    this.olhos.forEach((ol, i) => {
      const lado = i === 0 ? 'L' : 'R';
      const fechado = e.fechado || F.fechado || F.pisca === lado;
      ol.lid.visible = !fechado;
      ol.arco.visible = !!fechado;
      ol.lid.scale.set(olho[0], olho[1] * Math.max(0.08, piscar), 1);
      ol.pupila.scale.setScalar(pup);
      ol.pupila.position.x = (F.gx ?? 0) * 0.045;
      ol.pupila.position.y = (F.gy ?? 0) * 0.05;
    });
    this.brows.forEach((b, i) => {
      const br = (i === 0 ? e.browL : e.browR) ?? e.brow ?? [0, 0];
      b.position.y = br[0] + (F.browY ?? 0);
      b.rotation.z = (i === 0 ? 1 : -1) * br[1];
    });
    this.blush.forEach((b) => { b.material.opacity = 0.5 * (F.blush ?? e.blush ?? 0.35); });
    let forma = e.boca;
    let abre = e.abre ?? 1;
    if (F.boca !== undefined) {
      if (F.boca > 0.06) { forma = 'open'; abre = F.boca; } else if (forma === 'open' || forma === 'o') forma = 'smile';
    }
    for (const [k, m] of Object.entries(this.bocas)) m.visible = k === forma;
    const bm = this.bocas[forma];
    if (forma === 'open') bm.scale.set(0.85 + abre * 0.25, 0.25 + abre * 0.85, 1);
    else if (forma === 'smile') bm.scale.setScalar(e.bocaS ?? 1);
    else bm.scale.setScalar(1);
  }
}
