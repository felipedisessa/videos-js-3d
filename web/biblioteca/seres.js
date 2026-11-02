// Bichos e criaturas com rostinho: abelha, bactéria, formiga e gato.
import { THREE, mat, mesh, group } from '../engine.js';
import { criarOlho } from '../bonequinho.js';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const Z = V(0, 0, 1);

export function criarAbelha() {
  const g = new THREE.Group();
  const amarelo = mat(0xffc93c, { roughness: 0.4, clearcoat: 0.6, sheen: 0.5 });
  const preto = mat(0x1f1a17, { roughness: 0.4, clearcoat: 0.5 });
  mesh(new THREE.SphereGeometry(0.3, 32, 24), amarelo, { scale: [1.25, 1, 1], parent: g });
  for (const x of [-0.1, 0.1]) mesh(new THREE.TorusGeometry(0.28, 0.045, 10, 32), preto, { pos: [x - 0.05, 0, 0], rot: [0, Math.PI / 2, 0], scale: [1, 0.97, 1], parent: g });
  mesh(new THREE.ConeGeometry(0.06, 0.16, 12), preto, { pos: [-0.42, 0, 0], rot: [0, 0, Math.PI / 2], parent: g });
  const olhos = [1, -1].map((sz) => {
    const ol = criarOlho(0.08);
    const d = V(0.75, 0.3, sz * 0.55).normalize();
    ol.g.position.copy(d).multiplyScalar(0.29).add(V(0.08, 0, 0));
    ol.g.quaternion.setFromUnitVectors(Z, d);
    g.add(ol.g);
    return ol;
  });
  mesh(new THREE.TorusGeometry(0.05, 0.012, 6, 12, Math.PI), preto, { pos: [0.37, -0.06, 0], rot: [0, Math.PI / 2, Math.PI], parent: g });
  for (const sz of [1, -1]) {
    const an = group(g, [0.25, 0.22, sz * 0.08]);
    an.rotation.set(sz * 0.4, 0, -0.5);
    mesh(new THREE.CapsuleGeometry(0.012, 0.14, 4, 6), preto, { pos: [0, 0.08, 0], parent: an });
    mesh(new THREE.SphereGeometry(0.03, 8, 6), preto, { pos: [0, 0.17, 0], parent: an });
  }
  const asas = [1, -1].map((sz) => {
    const a = group(g, [0, 0.22, sz * 0.08]);
    mesh(new THREE.SphereGeometry(0.22, 20, 12), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.5, depthWrite: false, clearcoat: 1 }), { pos: [0, 0.02, sz * 0.18], scale: [0.7, 0.08, 1], parent: a, sombra: false });
    return { a, sz };
  });
  g.atualizar = (T, rosto = 'feliz') => {
    asas.forEach(({ a, sz }) => (a.rotation.x = sz * (0.25 + 0.45 * Math.sin(T * 60))));
    olhos.forEach((ol) => { ol.lid.scale.set(1, rosto === 'triste' ? 0.6 : 1, 1); ol.pupila.position.y = rosto === 'triste' ? -0.02 : 0; });
  };
  return g;
}

export function bacteria(cor, redonda = false) {
  const g = new THREE.Group();
  const corpo = group(g);
  const m = mat(cor, { roughness: 0.35, clearcoat: 0.8, sheen: 0.5, transparent: true, opacity: 0.95 });
  if (redonda) mesh(new THREE.SphereGeometry(0.2, 24, 16), m, { parent: corpo });
  else mesh(new THREE.CapsuleGeometry(0.15, 0.3, 8, 16), m, { rot: [0, 0, Math.PI / 2], parent: corpo });
  for (const sx of [1, -1]) {
    const ol = criarOlho(0.06);
    ol.g.position.set(sx * 0.07, 0.04, 0.15);
    corpo.add(ol.g);
  }
  mesh(new THREE.TorusGeometry(0.04, 0.012, 6, 12, Math.PI), mat(0x1f1a17), { pos: [0, -0.04, 0.16], rot: [0, 0, Math.PI], parent: corpo });
  for (let i = 0; i < 3; i++) mesh(new THREE.CapsuleGeometry(0.012, 0.12, 4, 6), m, { pos: [-0.3 - i * 0.02, 0.03 * (i - 1), -0.02], rot: [0, 0, Math.PI / 2 + 0.4 * (i - 1)], parent: corpo });
  g.atualizar = (T, fase = 0) => {
    corpo.rotation.set(0.15 * Math.sin(T * 2 + fase), 0.3 * Math.sin(T * 1.3 + fase), 0.12 * Math.sin(T * 3 + fase));
    corpo.scale.set(1 + 0.05 * Math.sin(T * 6 + fase), 1 - 0.05 * Math.sin(T * 6 + fase), 1);
  };
  return g;
}

export function criarFormiga() {
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

export function criarGato() {
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
