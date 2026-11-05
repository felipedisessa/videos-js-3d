// Peças de espaço: Terra com continentes, camadas internas, Lua, halos, atmosfera, astronauta e buraco negro.
import { THREE, mat, mesh, rng, brilho } from '../engine.js';
import { Boneco } from '../bonequinho.js';
import { RoundedBoxGeometry } from '../props.js';

// contornos simplificados dos continentes (lon, lat)
export const TERRAS = [
  [[-81, -5], [-80, 1], [-77, 8], [-72, 12], [-62, 11], [-52, 5], [-50, 0], [-44, -2], [-35, -5], [-35, -9], [-39, -15], [-41, -22], [-48, -26], [-53, -34], [-58, -38], [-65, -41], [-68, -50], [-72, -53], [-75, -50], [-73, -40], [-72, -30], [-71, -18], [-76, -14]],
  [[-168, 66], [-162, 70], [-140, 70], [-125, 70], [-100, 72], [-80, 73], [-65, 62], [-56, 52], [-66, 45], [-70, 42], [-76, 35], [-81, 31], [-80, 25], [-84, 30], [-90, 29], [-97, 26], [-97, 22], [-92, 18], [-87, 21], [-88, 16], [-83, 10], [-79, 9], [-82, 8], [-86, 12], [-92, 15], [-105, 20], [-110, 24], [-115, 30], [-118, 34], [-124, 40], [-124, 48], [-133, 56], [-150, 60], [-158, 57], [-165, 60]],
  [[-55, 60], [-43, 60], [-20, 70], [-20, 80], [-40, 83], [-65, 80], [-70, 77]],
  [[-10, 36], [-9, 43], [-2, 44], [-5, 48], [0, 50], [5, 53], [8, 57], [5, 62], [12, 66], [20, 70], [30, 70], [40, 67], [45, 68], [60, 70], [70, 73], [80, 73], [100, 77], [110, 74], [130, 72], [140, 72], [160, 70], [180, 68], [180, 65], [170, 60], [162, 56], [156, 51], [142, 47], [140, 53], [135, 44], [129, 35], [127, 40], [121, 40], [122, 31], [120, 25], [110, 21], [108, 16], [109, 12], [105, 9], [100, 13], [100, 7], [103, 1], [98, 8], [95, 16], [92, 22], [88, 22], [80, 15], [78, 8], [73, 17], [72, 21], [67, 25], [57, 25], [56, 27], [50, 30], [48, 29], [52, 24], [56, 24], [59, 22], [52, 16], [44, 12], [42, 16], [35, 28], [34, 31], [36, 36], [27, 37], [26, 40], [23, 36], [20, 40], [16, 38], [12, 44], [8, 44], [3, 43], [-2, 37], [-5, 36]],
  [[-17, 21], [-17, 15], [-12, 8], [-8, 4], [0, 5], [9, 4], [10, 0], [13, -8], [12, -17], [15, -27], [18, -34], [25, -34], [32, -28], [35, -24], [40, -15], [40, -10], [39, -5], [43, 0], [51, 11], [44, 11], [38, 18], [33, 28], [32, 31], [25, 32], [20, 31], [11, 33], [10, 37], [3, 37], [-6, 36], [-10, 30], [-13, 27]],
  [[44, -25], [47, -25], [50, -15], [49, -12], [44, -17]],
  [[114, -22], [114, -34], [118, -35], [125, -33], [131, -31], [138, -35], [141, -38], [147, -39], [150, -37], [153, -32], [153, -25], [146, -19], [142, -11], [136, -12], [136, -15], [131, -12], [126, -14], [122, -18]],
  [[95, 5], [98, 4], [104, -2], [106, -6], [101, -3], [96, 3]],
  [[105, -6], [114, -7], [114, -8.5], [106, -7.5]],
  [[109, 2], [111, -3], [116, -4], [119, 1], [117, 7], [113, 4]],
  [[131, -1], [141, -3], [150, -10], [143, -9], [138, -8], [132, -4]],
  [[120, 18], [122, 18], [126, 7], [122, 7], [120, 14]],
  [[130, 31], [135, 34], [141, 36], [142, 40], [141, 45], [144, 43], [140, 41], [135, 35], [131, 34]],
  [[120.2, 22], [121.9, 25.2], [121.2, 22]],
  [[-5, 50], [2, 51], [0, 53], [-3, 58], [-6, 57], [-5, 54], [-3, 54]],
  [[-24, 65], [-14, 64], [-14, 66], [-22, 66.5]],
  [[172, -35], [178, -38], [174, -41], [168, -46], [172, -43], [174, -39]],
  [[-85, 22], [-74, 20], [-77, 20], [-82, 23]],
];

export function texturaTerra(terra = '#4caf50', borda = '#3f9a45') {
  const c = document.createElement('canvas');
  c.width = 2048;
  c.height = 1024;
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, 1024);
  g.addColorStop(0, '#1d4f9c'); g.addColorStop(0.5, '#2a7fd6'); g.addColorStop(1, '#1d4f9c');
  x.fillStyle = g;
  x.fillRect(0, 0, 2048, 1024);
  const px = ([lon, lat]) => [((lon + 180) / 360) * 2048, ((90 - lat) / 180) * 1024];
  x.lineJoin = 'round';
  for (const [cor, larg] of [['#7fd0ff', 26], [terra, 0]]) {
    for (const poly of TERRAS) {
      x.beginPath();
      poly.forEach((p, i) => (i ? x.lineTo(...px(p)) : x.moveTo(...px(p))));
      x.closePath();
      if (larg) { x.strokeStyle = cor; x.globalAlpha = 0.35; x.lineWidth = larg; x.stroke(); x.globalAlpha = 1; }
      else { x.fillStyle = cor; x.fill(); x.strokeStyle = borda; x.lineWidth = 6; x.stroke(); }
    }
  }
  const R = rng(42);
  for (let i = 0; i < 9000; i++) {
    const [px_, py_] = [R() * 2048, R() * 1024];
    const d = x.getImageData(px_ | 0, py_ | 0, 1, 1).data;
    if (d[1] > 150 && d[2] < 120) {
      x.fillStyle = R() < 0.5 ? 'rgba(40,110,40,0.5)' : 'rgba(170,190,90,0.45)';
      x.beginPath(); x.arc(px_, py_, 4 + R() * 10, 0, Math.PI * 2); x.fill();
    }
  }
  x.fillStyle = '#f4fbff';
  x.fillRect(0, 1024 - 70, 2048, 70);
  x.fillRect(0, 0, 2048, 28);
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace;
  tx.anisotropy = 8;
  return tx;
}

export function texturaCamadas() {
  const c = document.createElement('canvas');
  c.width = c.height = 1024;
  const x = c.getContext('2d');
  const R = 512;
  const camadas = [[1.0, '#6b4a2b'], [0.965, '#c2410c'], [0.85, '#e0561b'], [0.55, '#ffa31a'], [0.19, '#fff3b0']];
  for (const [r, cor] of camadas) {
    const g = x.createRadialGradient(R, R, 0, R, R, r * R);
    g.addColorStop(0, cor);
    g.addColorStop(1, cor);
    x.fillStyle = g;
    x.beginPath(); x.arc(R, R, r * R, 0, Math.PI * 2); x.fill();
  }
  const brilhoNucleo = x.createRadialGradient(R, R, 0, R, R, 0.6 * R);
  brilhoNucleo.addColorStop(0, 'rgba(255,255,220,0.9)');
  brilhoNucleo.addColorStop(1, 'rgba(255,200,80,0)');
  x.fillStyle = brilhoNucleo;
  x.beginPath(); x.arc(R, R, 0.6 * R, 0, Math.PI * 2); x.fill();
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace;
  return tx;
}

export function texturaLua() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const x = c.getContext('2d');
  x.fillStyle = '#c4c4c4';
  x.fillRect(0, 0, 1024, 512);
  const R = rng(99);
  for (let i = 0; i < 9; i++) {
    x.fillStyle = 'rgba(110,110,118,0.55)';
    x.beginPath(); x.ellipse(R() * 1024, 120 + R() * 280, 60 + R() * 110, 40 + R() * 70, R() * 3, 0, Math.PI * 2); x.fill();
  }
  for (let i = 0; i < 260; i++) {
    const px = R() * 1024;
    const py = R() * 512;
    const r = 3 + Math.pow(R(), 3) * 40;
    x.fillStyle = 'rgba(80,80,88,0.45)';
    x.beginPath(); x.arc(px, py, r, 0, Math.PI * 2); x.fill();
    x.strokeStyle = 'rgba(235,235,240,0.5)';
    x.lineWidth = Math.max(1, r * 0.18);
    x.beginPath(); x.arc(px - r * 0.12, py - r * 0.12, r, Math.PI * 0.9, Math.PI * 1.8); x.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function halo(cor = '255,250,220', tam = 6) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, `rgba(${cor},0.9)`);
  g.addColorStop(0.25, `rgba(${cor},0.35)`);
  g.addColorStop(1, `rgba(${cor},0)`);
  x.fillStyle = g;
  x.fillRect(0, 0, 256, 256);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true }));
  s.scale.setScalar(tam);
  return s;
}

export const ATMOS = {
  vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
  fragmentShader: 'varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 2.5); gl_FragColor = vec4(vec3(0.35,0.65,1.0) * f * 1.6, f); }',
  side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
};

export function astronauta(o) {
  const b = new Boneco({ camisa: 0xf1f5f9, calca: 0xe2e8f0, sapato: 0x94a3b8, mangaLonga: true, ...o });
  const vidro = new THREE.MeshPhysicalMaterial({ color: 0xcfe8ff, roughness: 0.03, clearcoat: 1, transparent: true, opacity: 0.2, depthWrite: false });
  mesh(new THREE.SphereGeometry(0.74, 48, 32), vidro, { pos: [0, 0.48, 0.02], parent: b.head, sombra: false });
  mesh(new THREE.TorusGeometry(0.42, 0.08, 12, 32), mat(0x94a3b8, { metalness: 0.6, roughness: 0.3 }), { pos: [0, 0.7, 0], rot: [Math.PI / 2, 0, 0], parent: b.spine });
  const mochila = mesh(new RoundedBoxGeometry(0.62, 0.7, 0.3, 3, 0.08), mat(0xe2e8f0, { roughness: 0.5 }), { pos: [0, 0.38, -0.36], parent: b.spine });
  void mochila;
  mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 6), mat(0x64748b), { pos: [0.22, 0.95, -0.4], parent: b.spine });
  b.antena = mesh(new THREE.SphereGeometry(0.04, 10, 8), brilho(0xff4d4d, 3), { pos: [0.22, 1.2, -0.4], parent: b.spine, sombra: false });
  mesh(new RoundedBoxGeometry(0.3, 0.2, 0.06, 2, 0.02), mat(0x3b82f6), { pos: [0, 0.42, 0.27], parent: b.spine });
  return b;
}

export function texturaDisco() {
  const c = document.createElement('canvas');
  c.width = c.height = 1024;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(512, 512, 150, 512, 512, 512);
  g.addColorStop(0, 'rgba(255,255,240,1)');
  g.addColorStop(0.2, 'rgba(255,210,120,1)');
  g.addColorStop(0.5, 'rgba(255,120,30,0.9)');
  g.addColorStop(0.8, 'rgba(160,40,10,0.45)');
  g.addColorStop(1, 'rgba(80,10,0,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 1024, 1024);
  x.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 160; i++) {
    const r = 180 + Math.random() * 320;
    const a0 = Math.random() * Math.PI * 2;
    x.strokeStyle = `rgba(255,${150 + Math.random() * 100},80,${0.05 + Math.random() * 0.12})`;
    x.lineWidth = 2 + Math.random() * 6;
    x.beginPath(); x.arc(512, 512, r, a0, a0 + 0.4 + Math.random()); x.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function buracoNegro() {
  const g = new THREE.Group();
  const tx = texturaDisco();
  const discoM = new THREE.MeshBasicMaterial({ map: tx, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const disco = mesh(new THREE.RingGeometry(1.2, 3.6, 160, 1), discoM, { rot: [-Math.PI / 2 + 0.22, 0, 0], parent: g, sombra: false });
  const anelLente = mesh(new THREE.RingGeometry(1.02, 1.75, 128, 1), discoM, { parent: g, sombra: false });
  mesh(new THREE.SphereGeometry(1.0, 64, 48), new THREE.MeshBasicMaterial({ color: 0x000000, fog: false }), { parent: g, sombra: false });
  const brilhoBorda = halo('255,170,80', 5.2);
  g.add(brilhoBorda);
  g.atualizar = (T, camera) => {
    disco.rotation.z = T * 0.35;
    anelLente.quaternion.copy(camera.quaternion);
    anelLente.rotateZ(T * 0.2);
  };
  return g;
}

/** Brilho azul de atmosfera em volta de um planeta de raio `r`. */
export function atmosfera(r) {
  return new THREE.Mesh(new THREE.SphereGeometry(r, 64, 48), new THREE.ShaderMaterial(ATMOS));
}

// ---------- globo: posições por latitude/longitude ----------
const GRAU = Math.PI / 180;

/** Ponto na superfície de uma esfera de raio `r` (sem rotação), no mesmo mapeamento da texturaTerra. */
export function pontoLatLon(lat, lon, r = 1) {
  const phi = (lon + 180) * GRAU;
  const th = (90 - lat) * GRAU;
  return new THREE.Vector3(-r * Math.cos(phi) * Math.sin(th), r * Math.cos(th), r * Math.sin(phi) * Math.sin(th));
}

/** Gira um globo (esfera com texturaTerra) para que `lat`/`lon` fique virado para +z (a câmera). */
export function centrarGlobo(obj, lat, lon) {
  obj.rotation.set(lat * GRAU, -(lon + 90) * GRAU, 0, 'XYZ');
  return obj;
}

/**
 * Camada transparente para pôr sobre um globo: manchas suaves em lat/lon (graus).
 * manchas: [{ lat, lon, rx, ry, cor: '255,80,40', a }] (rx/ry = raios em graus).
 */
export function texturaManchas(manchas, w = 1024, h = 512) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const x = c.getContext('2d');
  for (const { lat, lon, rx, ry, cor, a = 1 } of manchas) {
    const cx = ((lon + 180) / 360) * w;
    const cy = ((90 - lat) / 180) * h;
    const r = (ry / 180) * h;
    x.save();
    x.translate(cx, cy);
    x.scale(((rx / 360) * w) / r, 1);
    const g = x.createRadialGradient(0, 0, 0, 0, 0, r);
    g.addColorStop(0, `rgba(${cor},${a})`);
    g.addColorStop(0.55, `rgba(${cor},${a * 0.6})`);
    g.addColorStop(1, `rgba(${cor},0)`);
    x.fillStyle = g;
    x.beginPath(); x.arc(0, 0, r, 0, Math.PI * 2); x.fill();
    x.restore();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------- satélite / telescópio espacial ----------
function texturaPainel() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = '#c9d2de';
  x.fillRect(0, 0, 256, 128);
  for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) {
    const g = x.createLinearGradient(0, j * 32, 0, j * 32 + 30);
    g.addColorStop(0, '#2b5fd9');
    g.addColorStop(1, '#13306f');
    x.fillStyle = g;
    x.fillRect(i * 32 + 2, j * 32 + 2, 28, 28);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * Satélite estilo telescópio espacial (corpo dourado, detector na frente, tubos e dois painéis solares).
 * sat.paineis[0|1] são grupos (dá para soltar/girar), sat.queimar(k) deixa tudo incandescente (0 = normal).
 */
export function satelite() {
  const g = new THREE.Group();
  const ouro = mat(0xe0a526, { metalness: 0.85, roughness: 0.32, clearcoat: 0.4 });
  const prata = mat(0xd9dde3, { metalness: 0.7, roughness: 0.28 });
  const branco = mat(0xf1f5f9, { roughness: 0.45 });
  const escuro = mat(0x2b2f36, { roughness: 0.55, metalness: 0.3 });
  const corpo = new THREE.Group();
  g.add(corpo);
  mesh(new RoundedBoxGeometry(0.9, 1.5, 0.9, 3, 0.06), ouro, { parent: corpo });
  mesh(new RoundedBoxGeometry(1.5, 1.05, 0.24, 2, 0.04), escuro, { pos: [0, 0.18, 0.56], parent: corpo });
  for (let i = 0; i < 5; i++) mesh(new THREE.BoxGeometry(1.42, 0.03, 0.05), prata, { pos: [0, -0.25 + i * 0.21, 0.7], parent: corpo });
  mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.75, 28), branco, { pos: [0.27, 0.12, -0.62], parent: corpo });
  mesh(new THREE.CylinderGeometry(0.13, 0.13, 1.55, 24), branco, { pos: [-0.3, 0.05, -0.6], parent: corpo });
  mesh(new THREE.CircleGeometry(0.17, 24), escuro, { pos: [0.27, 1.0, -0.62], rot: [-Math.PI / 2, 0, 0], parent: corpo });
  mesh(new THREE.SphereGeometry(0.22, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.4), prata, { pos: [0, -0.92, 0], rot: [Math.PI, 0, 0], parent: corpo });
  const painelM = new THREE.MeshPhysicalMaterial({ map: texturaPainel(), roughness: 0.25, metalness: 0.4, clearcoat: 1 });
  const paineis = [1, -1].map((sx) => {
    const p = new THREE.Group();
    p.position.set(sx * 0.45, 0.05, 0);
    g.add(p);
    mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.55, 8), prata, { pos: [sx * 0.27, 0, 0], rot: [0, 0, Math.PI / 2], parent: p });
    mesh(new THREE.BoxGeometry(1.9, 0.95, 0.04), [prata, prata, prata, prata, painelM, painelM], { pos: [sx * 1.5, 0, 0], parent: p });
    return p;
  });
  const mats = [ouro, prata, branco, escuro, painelM];
  g.corpo = corpo;
  g.paineis = paineis;
  g.queimar = (k) => {
    for (const m of mats) {
      m.emissive.set(0xff5a1a);
      m.emissiveIntensity = 1.6 * k;
    }
  };
  return g;
}

/**
 * Rastro de fogo de reentrada: cones aditivos + brilho + faíscas. O rastro sai do objeto na direção +z local;
 * use `rastro.lookAt(pontoAtras)` (em coordenadas do pai) e `rastro.atualizar(T, k)` (k = intensidade 0..1).
 */
export function rastroFogo({ comprimento = 6, raio = 0.9, faiscas = 50, seed = 7 } = {}) {
  const g = new THREE.Group();
  const add = (r, h, cor, op) => {
    const geo = new THREE.ConeGeometry(r, h, 28, 1, true);
    geo.rotateX(Math.PI / 2);
    geo.translate(0, 0, h / 2);
    const m = new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
    return mesh(geo, m, { parent: g, sombra: false, recebe: false });
  };
  const cones = [add(raio, comprimento, 0xff3d0a, 0.35), add(raio * 0.68, comprimento * 0.7, 0xff8a1a, 0.5), add(raio * 0.38, comprimento * 0.4, 0xfff0b0, 0.85)];
  const frente = halo('255,190,110', 3.2);
  g.add(frente);
  const R = rng(seed);
  const dados = Array.from({ length: faiscas }, () => ({ a: R() * Math.PI * 2, d: 0.2 + R() * 0.8, f: R(), v: 0.7 + R() * 0.8, r: 0.5 + R() * 0.5 }));
  const inst = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), brilho(0xffb347, 4, { fog: false }), faiscas);
  inst.frustumCulled = false;
  inst.castShadow = false;
  g.add(inst);
  const o = new THREE.Object3D();
  g.atualizar = (T, k = 1) => {
    g.visible = k > 0.01;
    cones.forEach((c, i) => {
      const f = 1 + 0.08 * Math.sin(T * 41 + i * 2.1) + 0.05 * Math.sin(T * 67 + i);
      c.scale.set(k * f, k * f, Math.max(0.01, k * (0.85 + 0.15 * Math.sin(T * 23 + i))));
    });
    frente.scale.setScalar(3.2 * raio * k * (1 + 0.08 * Math.sin(T * 37)));
    dados.forEach((p, i) => {
      const u = (p.f + T * 1.7 * p.v) % 1;
      const sp = raio * p.d * (0.3 + u);
      o.position.set(Math.cos(p.a) * sp, Math.sin(p.a) * sp, u * comprimento * 0.95);
      o.scale.setScalar(0.07 * raio * p.r * (1 - u) * k + 1e-4);
      o.updateMatrix();
      inst.setMatrixAt(i, o.matrix);
    });
    inst.instanceMatrix.needsUpdate = true;
  };
  g.atualizar(0, 1);
  return g;
}
