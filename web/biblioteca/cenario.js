// Cenário: flores, alimentos, prédios, casas, carro, árvore, nuvem, seta 3D e textura de rocha.
import { THREE, mat, mesh, group, rng } from '../engine.js';
import { RoundedBoxGeometry } from '../props.js';

export function flor(cor, R) {
  const g = new THREE.Group();
  const h = 0.6 + R() * 0.5;
  mesh(new THREE.CylinderGeometry(0.025, 0.03, h, 8), mat(0x3fae5a, { roughness: 0.8 }), { pos: [0, h / 2, 0], parent: g });
  const topo = group(g, [0, h, 0]);
  mesh(new THREE.SphereGeometry(0.09, 16, 12), mat(0xffb703, { roughness: 0.6 }), { scale: [1, 0.6, 1], parent: topo });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    mesh(new THREE.SphereGeometry(0.11, 14, 10), mat(cor, { roughness: 0.5, clearcoat: 0.3 }), { pos: [Math.cos(a) * 0.14, 0, Math.sin(a) * 0.14], scale: [1, 0.25, 0.6], rot: [0, -a, 0], parent: topo });
  }
  topo.rotation.x = -0.35;
  g.topo = topo;
  return g;
}

export function alimento(tipo) {
  const g = new THREE.Group();
  if (tipo === 'maca') {
    mesh(new THREE.SphereGeometry(0.28, 32, 24), mat(0xe63946, { roughness: 0.25, clearcoat: 0.9 }), { pos: [0, 0.27, 0], scale: [1, 0.92, 1], parent: g });
    mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.12, 6), mat(0x6b3e26), { pos: [0, 0.56, 0], parent: g });
    mesh(new THREE.SphereGeometry(0.07, 10, 8), mat(0x3fae5a), { pos: [0.07, 0.58, 0], scale: [1.4, 0.3, 0.7], parent: g });
  } else if (tipo === 'melancia') {
    mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.14, 32, 1, false, 0, Math.PI), mat(0xff4d6d, { roughness: 0.5 }), { pos: [0, 0.4, 0], rot: [Math.PI / 2, 0, Math.PI / 2], parent: g });
    mesh(new THREE.TorusGeometry(0.4, 0.05, 8, 32, Math.PI), mat(0x2d6a4f, { roughness: 0.5 }), { pos: [0, 0.4, 0], rot: [0, 0, Math.PI], parent: g });
    for (let i = 0; i < 5; i++) mesh(new THREE.SphereGeometry(0.025, 6, 6), mat(0x111111), { pos: [-0.2 + i * 0.1, 0.25 + (i % 2) * 0.05, 0.075], parent: g });
  } else if (tipo === 'amendoa') {
    for (let i = 0; i < 3; i++) mesh(new THREE.SphereGeometry(0.12, 16, 12), mat(0xb5835a, { roughness: 0.7 }), { pos: [-0.15 + i * 0.15, 0.08, (i % 2) * 0.08], scale: [1.4, 0.55, 0.8], rot: [0, i, 0], parent: g });
  } else if (tipo === 'cafe') {
    mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.34, 28), mat(0xffffff, { roughness: 0.2, clearcoat: 1 }), { pos: [0, 0.17, 0], parent: g });
    mesh(new THREE.CircleGeometry(0.18, 24), mat(0x5a3218, { roughness: 0.2 }), { pos: [0, 0.32, 0], rot: [-Math.PI / 2, 0, 0], parent: g });
    mesh(new THREE.TorusGeometry(0.08, 0.025, 8, 16), mat(0xffffff, { roughness: 0.2 }), { pos: [0.22, 0.18, 0], parent: g });
  } else if (tipo === 'arroz') {
    mesh(new THREE.SphereGeometry(0.3, 28, 14, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat(0x3b82f6, { roughness: 0.3, side: THREE.DoubleSide }), { pos: [0, 0.3, 0], parent: g });
    mesh(new THREE.SphereGeometry(0.27, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xfaf7ef, { roughness: 0.9 }), { pos: [0, 0.27, 0], scale: [1, 0.45, 1], parent: g });
  } else if (tipo === 'pao') {
    mesh(new THREE.CapsuleGeometry(0.17, 0.38, 8, 16), mat(0xd4a25c, { roughness: 0.6 }), { pos: [0, 0.17, 0], rot: [0, 0, Math.PI / 2], scale: [1, 1, 0.9], parent: g });
  } else if (tipo === 'milho') {
    mesh(new THREE.CapsuleGeometry(0.1, 0.32, 8, 16), mat(0xffd23f, { roughness: 0.5 }), { pos: [0, 0.12, 0], rot: [0, 0, Math.PI / 2], parent: g });
    for (const s of [1, -1]) mesh(new THREE.SphereGeometry(0.13, 12, 8), mat(0x5fa84a, { roughness: 0.7 }), { pos: [-0.22, 0.12, s * 0.05], scale: [1.6, 0.4, 0.6], rot: [0, s * 0.4, 0], parent: g });
  }
  return g;
}

export function texturaJanelas(cor = '#5b6b82', luz = 0.35, seed = 1) {
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

export function seta(cor) {
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

export function casa(cor, telhado) {
  const g = new THREE.Group();
  mesh(new RoundedBoxGeometry(1.0, 0.8, 0.9, 2, 0.04), mat(cor, { roughness: 0.6 }), { pos: [0, 0.4, 0], parent: g });
  mesh(new THREE.ConeGeometry(0.8, 0.55, 4), mat(telhado, { roughness: 0.6 }), { pos: [0, 1.07, 0], rot: [0, Math.PI / 4, 0], parent: g });
  mesh(new RoundedBoxGeometry(0.22, 0.38, 0.05, 2, 0.02), mat(0x7a4a2a), { pos: [0, 0.19, 0.46], parent: g });
  for (const x of [-0.3, 0.3]) mesh(new RoundedBoxGeometry(0.2, 0.2, 0.04, 2, 0.02), mat(0xbfe9ff, { roughness: 0.1, clearcoat: 1 }), { pos: [x, 0.5, 0.46], parent: g });
  return g;
}

export function carro(cor) {
  const g = new THREE.Group();
  mesh(new RoundedBoxGeometry(1.2, 0.35, 0.6, 3, 0.1), mat(cor, { roughness: 0.25, clearcoat: 1 }), { pos: [0, 0.32, 0], parent: g });
  mesh(new RoundedBoxGeometry(0.7, 0.3, 0.55, 3, 0.1), mat(0xbfe9ff, { roughness: 0.05, clearcoat: 1 }), { pos: [-0.05, 0.6, 0], parent: g });
  for (const [x, z] of [[-0.38, 0.3], [0.38, 0.3], [-0.38, -0.3], [0.38, -0.3]]) mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.1, 16), mat(0x1f2937, { roughness: 0.8 }), { pos: [x, 0.15, z], rot: [Math.PI / 2, 0, 0], parent: g });
  return g;
}

export function arvore(R) {
  const g = new THREE.Group();
  const tronco = group(g);
  mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.9, 10), mat(0x8b5a2b, { roughness: 0.8 }), { pos: [0, 0.45, 0], parent: tronco });
  mesh(new THREE.SphereGeometry(0.5 + R() * 0.15, 16, 12), mat(0x3fae5a, { roughness: 0.8 }), { pos: [0, 1.2, 0], parent: tronco });
  g.tronco = tronco;
  return g;
}

export function texturaRocha() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 1024;
  const x = c.getContext('2d');
  const R = rng(8);
  const cores = ['#5b3a24', '#7a4b2a', '#8c5a33', '#a0522d', '#6e4b3a', '#4a2f20', '#94653d'];
  let y = 0;
  while (y < 1024) {
    const h = 14 + R() * 60;
    x.fillStyle = cores[Math.floor(R() * cores.length)];
    x.fillRect(0, y, 512, h);
    y += h;
  }
  for (let i = 0; i < 2500; i++) {
    x.fillStyle = R() < 0.5 ? 'rgba(0,0,0,0.18)' : 'rgba(255,220,180,0.12)';
    x.beginPath(); x.arc(R() * 512, R() * 1024, 2 + R() * 9, 0, Math.PI * 2); x.fill();
  }
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace;
  tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
  tx.repeat.set(3, 5);
  return tx;
}
