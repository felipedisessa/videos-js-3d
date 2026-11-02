// Vídeo 3: E se você pulasse num buraco que atravessa a Terra?
import {
  THREE, W, mat, mesh, group, brilho, rng, seg, smooth, easeOut, easeIn, easeInOut, back, elastic, pulse, wob, lerp, textoContorno,
} from '../engine.js';
import { Boneco, POSES, misturar } from '../bonequinho.js';
import { relogio, estrelas, particulas, RoundedBoxGeometry } from '../props.js';
import { pilula } from './chiclete.js';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

// contornos simplificados dos continentes (lon, lat)
const TERRAS = [
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

function texturaCamadas() {
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

function texturaRocha() {
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

export function criar(E) {
  const visual = { camisa: 0xffb020, estilo: 'curto', cabelo: 0x2b1a12, calca: 0x3f6212, fase: 0.7 };
  const exp = new Boneco(visual);
  const mini = new Boneco(visual);

  // ---------- campo com o buraco ----------
  const campo = E.set();
  const forma = new THREE.Shape();
  forma.moveTo(-40, -40); forma.lineTo(40, -40); forma.lineTo(40, 40); forma.lineTo(-40, 40); forma.closePath();
  const furo = new THREE.Path();
  furo.absarc(0, 0, 0.95, 0, Math.PI * 2, true);
  forma.holes.push(furo);
  mesh(new THREE.ShapeGeometry(forma, 64), mat(0x6cc24a, { roughness: 0.95, clearcoat: 0 }), { rot: [-Math.PI / 2, 0, 0], parent: campo, sombra: false });
  const poco = new THREE.CylinderGeometry(0.95, 0.95, 12, 48, 24, true);
  const cores = [];
  const pp = poco.attributes.position;
  for (let i = 0; i < pp.count; i++) {
    const k = THREE.MathUtils.clamp((pp.getY(i) + 6) / 12, 0, 1);
    const c = new THREE.Color(0x000000).lerp(new THREE.Color(0x6b4426), Math.pow(k, 6));
    cores.push(c.r, c.g, c.b);
  }
  poco.setAttribute('color', new THREE.Float32BufferAttribute(cores, 3));
  mesh(poco, new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.BackSide, roughness: 1 }), { pos: [0, -6, 0], parent: campo, sombra: false });
  mesh(new THREE.TorusGeometry(0.98, 0.1, 12, 56), mat(0x7a4a2a, { roughness: 0.9 }), { rot: [-Math.PI / 2, 0, 0], pos: [0, 0.02, 0], scale: [1, 1, 0.6], parent: campo });
  const Rc = rng(77);
  for (let i = 0; i < 70; i++) {
    const a = Rc() * Math.PI * 2;
    const r = 1.4 + Rc() * 9;
    const tufo = mesh(new THREE.ConeGeometry(0.06 + Rc() * 0.05, 0.25 + Rc() * 0.2, 5), mat(0x4e9a35, { roughness: 0.9 }), { pos: [Math.cos(a) * r, 0.1, Math.sin(a) * r], rot: [Rc() * 0.4, 0, Rc() * 0.4], parent: campo });
    void tufo;
  }
  for (let i = 0; i < 10; i++) {
    const a = Rc() * Math.PI * 2;
    const r = 1.3 + Rc() * 4;
    mesh(new THREE.DodecahedronGeometry(0.1 + Rc() * 0.15, 0), mat(0x9ca3af, { roughness: 0.8 }), { pos: [Math.cos(a) * r, 0.05, Math.sin(a) * r], rot: [Rc(), Rc(), Rc()], parent: campo });
  }
  const placa = group(campo, [-1.9, 0, -1.1]);
  placa.rotation.y = 0.5;
  mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.4, 12), mat(0x8b5a2b, { roughness: 0.8 }), { pos: [0, 0.7, 0], parent: placa });
  mesh(new RoundedBoxGeometry(1.1, 0.42, 0.08, 2, 0.03), mat(0xffd23f, { roughness: 0.6 }), { pos: [0, 1.25, 0.06], parent: placa });
  const perigo = E.texto3d('PERIGO', { size: 0.16, depth: 0.03, cor: 0x1a1a1a, lado: 0x000000, emissivo: 0, bevel: 0.008 });
  perigo.position.set(0, 1.25, 0.12);
  placa.add(perigo);

  // ---------- espaço: Terra em corte ----------
  const espaco = E.set();
  const RT = 1.6;
  const cortes = [new THREE.Plane(V(-1, 0, 0), 0), new THREE.Plane(V(0, 0, -1), 0)];
  const terra = group(espaco);
  const dirLatLon = (lat, lon) => {
    const phi = ((lon + 180) / 360) * Math.PI * 2;
    const la = THREE.MathUtils.degToRad(lat);
    return V(-Math.cos(phi) * Math.cos(la), Math.sin(la), Math.sin(phi) * Math.cos(la));
  };
  const q = new THREE.Quaternion().setFromUnitVectors(dirLatLon(-23.55, -46.63), V(0, 1, 0));
  const qy = new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), 2.3);
  terra.quaternion.copy(qy.multiply(q));
  mesh(new THREE.SphereGeometry(RT, 96, 64), new THREE.MeshPhysicalMaterial({ map: texturaTerra(), roughness: 0.55, clearcoat: 0.4, clippingPlanes: cortes, clipIntersection: true }), { parent: terra, sombra: false });
  const nuvensTx = (() => {
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 512;
    const x = c.getContext('2d');
    const R = rng(5);
    for (let i = 0; i < 260; i++) {
      x.fillStyle = `rgba(255,255,255,${0.25 + R() * 0.4})`;
      x.beginPath(); x.ellipse(R() * 1024, 60 + R() * 392, 10 + R() * 40, 4 + R() * 12, 0, 0, Math.PI * 2); x.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const nuvens = mesh(new THREE.SphereGeometry(RT * 1.012, 64, 48), new THREE.MeshStandardMaterial({ map: nuvensTx, transparent: true, depthWrite: false, clippingPlanes: cortes, clipIntersection: true, roughness: 1 }), { parent: terra, sombra: false });
  const capaM = new THREE.MeshStandardMaterial({ map: texturaCamadas(), emissive: 0xffffff, emissiveIntensity: 0.55, roughness: 0.8, side: THREE.DoubleSide });
  capaM.emissiveMap = capaM.map;
  mesh(new THREE.CircleGeometry(RT, 96, -Math.PI / 2, Math.PI), capaM, { rot: [0, -Math.PI / 2, 0], parent: espaco, sombra: false });
  mesh(new THREE.CircleGeometry(RT, 96, -Math.PI / 2, Math.PI), capaM, { parent: espaco, sombra: false });
  mesh(new THREE.CylinderGeometry(0.018, 0.018, RT * 2, 12), new THREE.MeshBasicMaterial({ color: 0x111111 }), { parent: espaco, sombra: false });
  const atmos = new THREE.Mesh(new THREE.SphereGeometry(RT * 1.12, 64, 48), new THREE.ShaderMaterial({
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 2.5); gl_FragColor = vec4(vec3(0.35,0.65,1.0) * f * 1.6, f); }',
    side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  espaco.add(atmos);
  const ceu = estrelas(2200, 150);
  espaco.add(ceu);
  espaco.add(mini.root);
  const rastro = Array.from({ length: 8 }, (_, i) => mesh(new THREE.SphereGeometry(0.035 * (1 - i / 10), 10, 8), brilho(0xffe066, 3 - i * 0.3), { parent: espaco, sombra: false }));
  const SOL = V(6, 3, 5);

  function posMini(y, T, pose = 'queda') {
    mini.update(T, { ...POSES[pose], s: 0.13, y: y - 0.16, ry: 0.8, rz: 0.15 * Math.sin(T * 3) }, { expr: 'assustado' });
  }
  function espacoBase(s) {
    E.show(espaco);
    E.fundo(0x0a1230, 0x01030a, { chao: false, near: 300, far: 600 });
    E.hemi.intensity = 0.25;
    E.key.position.copy(SOL);
    E.key.intensity = 3.2;
    E.rim.intensity = 0.6;
    E.fill.intensity = 0.15;
    E.scene.environmentIntensity = 0.25;
    E.gtao.enabled = false;
    E.bloom.strength = 0.55;
    E.bloom.threshold = 0.95;
    E.bloom.radius = 0.6;
    nuvens.rotation.y = s.T * 0.03;
    ceu.rotation.y = s.T * 0.004;
  }
  function rastroEm(yFn, T, dt = 0.05) {
    rastro.forEach((r, i) => r.position.set(0, yFn(T - (i + 1) * dt), 0));
  }

  // ---------- túnel (queda) ----------
  const tunelSet = E.set();
  const rochaTx = texturaRocha();
  const tunelM = new THREE.MeshStandardMaterial({ map: rochaTx, emissiveMap: rochaTx, emissive: 0xff5a00, emissiveIntensity: 0, roughness: 0.9, side: THREE.BackSide });
  mesh(new THREE.CylinderGeometry(5, 5, 80, 64, 1, true), tunelM, { parent: tunelSet, sombra: false });
  const nLinhas = 46;
  const linhas = new THREE.InstancedMesh(new THREE.BoxGeometry(0.02, 1, 0.02), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 }), nLinhas);
  tunelSet.add(linhas);
  const dadosLinhas = (() => { const R = rng(31); return Array.from({ length: nLinhas }, () => ({ a: R() * Math.PI * 2, r: 2.4 + R() * 2.3, f: R(), l: 1.5 + R() * 3.5, v: 0.8 + R() * 0.6 })); })();
  const brasas = particulas(70, brilho(0xffa020, 4), 13);
  tunelSet.add(brasas);
  const gotasSuor = Array.from({ length: 4 }, () => mesh(new THREE.SphereGeometry(0.05, 12, 8), mat(0x7fd3ff, { roughness: 0.05, clearcoat: 1 }), { parent: tunelSet, sombra: false }));
  const o3 = new THREE.Object3D();
  function tunelBase(s, vel, calor) {
    E.show(tunelSet);
    tunelSet.add(exp.root);
    E.fundo(0x000000, 0x000000, { chao: false, near: 6, far: 30, neblina: calor > 0.3 ? 0x3a1000 : 0x0b0603 });
    E.hemi.intensity = 0.5;
    E.key.intensity = 2.2;
    E.key.color.set(calor > 0 ? new THREE.Color(0xfff1de).lerp(new THREE.Color(0xff8a3d), calor) : 0xfff1de);
    E.rim.color.set(calor > 0 ? 0xff6a00 : 0xffd9a8);
    E.rim.intensity = 2 + 3 * calor;
    E.rim.position.set(0, -6, -3);
    E.gtao.enabled = false;
    rochaTx.offset.y = (s.T * vel) % 1;
    tunelM.emissiveIntensity = 1.6 * calor;
    tunelM.color.set(new THREE.Color(0xffffff).lerp(new THREE.Color(0xffc080), calor));
    dadosLinhas.forEach((d, i) => {
      const y = ((d.f + s.T * d.v * vel * 0.9) % 1) * 30 - 15;
      o3.position.set(Math.cos(d.a) * d.r, y, Math.sin(d.a) * d.r);
      o3.scale.set(1, d.l, 1);
      o3.updateMatrix();
      linhas.setMatrixAt(i, o3.matrix);
    });
    linhas.instanceMatrix.needsUpdate = true;
    brasas.visible = calor > 0.05;
    brasas.update(s.T, { x: 0, y: -8, z: -1, w: 9, d: 7, h: 16, r: 0.06, vel: 0.9 });
    if (calor > 0.05) { E.bloom.strength = 0.9 * calor; E.bloom.threshold = 0.9; }
  }

  // ---------- relógio no espaço ----------
  const relSet = E.set();
  const rel = relogio(0x2f7bff);
  rel.scale.setScalar(0.62);
  relSet.add(rel);
  const minTxt = E.texto3d('38 MIN', { size: 0.26, cor: 0xffd23f });
  relSet.add(minTxt);

  // ---------- oceano ----------
  const oceanoSet = E.set();
  const aguaGeo = new THREE.PlaneGeometry(70, 70, 150, 150);
  const aguaBase = Float32Array.from(aguaGeo.attributes.position.array);
  const agua = mesh(aguaGeo, new THREE.MeshPhysicalMaterial({ color: 0x1f8fd6, roughness: 0.12, clearcoat: 0.8, clearcoatRoughness: 0.1, metalness: 0.05 }), { rot: [-Math.PI / 2, 0, 0], parent: oceanoSet, sombra: false });
  agua.receiveShadow = true;
  const onda = (x, z, T) => 0.1 * Math.sin(0.55 * x + 1.3 * T) + 0.07 * Math.sin(0.8 * z - 1.1 * T + 1) + 0.04 * Math.sin(1.6 * (x + z) + 2.2 * T);
  function animarAgua(T) {
    const p = aguaGeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = aguaBase[i * 3];
      const y = aguaBase[i * 3 + 1];
      p.setZ(i, onda(x, -y, T));
    }
    p.needsUpdate = true;
    aguaGeo.computeVertexNormals();
  }
  const espuma = mesh(new THREE.TorusGeometry(0.62, 0.09, 10, 40), mat(0xffffff, { roughness: 0.4, transparent: true, opacity: 0.85 }), { rot: [-Math.PI / 2, 0, 0], parent: oceanoSet, sombra: false });
  const ilha = group(oceanoSet, [-5.5, -0.2, -26]);
  mesh(new THREE.CylinderGeometry(3.2, 3.8, 0.6, 32), mat(0xf2d38b, { roughness: 0.9 }), { parent: ilha });
  mesh(new THREE.ConeGeometry(2.4, 2.6, 24), mat(0x3f9a45, { roughness: 0.9 }), { pos: [-0.6, 1.4, -0.6], parent: ilha });
  for (const [px, pz, h] of [[1.4, 0.8, 2.6], [2.1, -0.2, 2.1]]) {
    const pal = group(ilha, [px, 0.3, pz]);
    mesh(new THREE.CylinderGeometry(0.08, 0.13, h, 8), mat(0x8b5a2b), { pos: [0, h / 2, 0], rot: [0, 0, 0.15], parent: pal });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      mesh(new THREE.SphereGeometry(0.5, 12, 8), mat(0x2e8b3c, { roughness: 0.8 }), { pos: [Math.cos(a) * 0.45 - 0.2, h + 0.05, Math.sin(a) * 0.45], scale: [1.2, 0.18, 0.45], rot: [0, -a, -0.3], parent: pal });
    }
  }
  const nGotas = 70;
  const respingo = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), mat(0xdff4ff, { roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.9 }), nGotas);
  oceanoSet.add(respingo);
  const dadosGotas = (() => { const R = rng(17); return Array.from({ length: nGotas }, () => { const a = R() * Math.PI * 2; const r = 0.6 + R() * 1.6; return { v: V(Math.cos(a) * r, 2.5 + R() * 3.5, Math.sin(a) * r), s: 0.04 + R() * 0.07 }; }); })();
  function animarRespingo(tt) {
    respingo.visible = tt > 0 && tt < 1.3;
    dadosGotas.forEach((d, i) => {
      o3.position.set(d.v.x * tt, d.v.y * tt - 4.9 * tt * tt, d.v.z * tt);
      o3.scale.setScalar(Math.max(0.001, d.s * (1 - tt / 1.3)));
      o3.updateMatrix();
      respingo.setMatrixAt(i, o3.matrix);
    });
    respingo.instanceMatrix.needsUpdate = true;
  }
  const bolhas = particulas(16, mat(0xe8f8ff, { roughness: 0.05, clearcoat: 1 }), 23);
  oceanoSet.add(bolhas);
  function oceanoBase(s) {
    E.show(oceanoSet);
    oceanoSet.add(exp.root);
    E.fundo(0x3aa0ff, 0xcdeeff, { chao: false, near: 20, far: 70, neblina: 0xcdeeff });
    E.sombra(0, 0, 5);
    E.gtao.enabled = false;
    animarAgua(s.T);
  }

  return {
    beats: {
      gancho(s) {
        const { t } = s;
        E.show(campo);
        campo.add(exp.root);
        E.fundo(0x5ab8ff, 0xd8f1ff, { chao: false, near: 15, far: 45 });
        E.sombra(-0.5, 0, 5);
        const pula = s.cue('pula');
        const espia = smooth(seg(t, 0.3, 1.1));
        const k = seg(t, pula, pula + 0.75);
        const nojump = t < pula;
        const agacha = pulse(t, pula - 0.3, 0.35);
        let pose = misturar('idle', { spineX: 0.45, headX: 0.35, lArmFwd: 0.3, rArmFwd: 0.3, lArmOut: 0.5, rArmOut: 0.5 }, espia * (1 - smooth(seg(t, pula - 0.5, pula - 0.25))));
        if (!nojump) pose = misturar(POSES.mergulho, POSES.mergulho, 1);
        const x = nojump ? -1.35 : lerp(-1.35, 0, easeOut(k));
        const y = nojump ? -0.12 * agacha : 5.91 * k - 10.91 * k * k;
        exp.update(s.T, { ...pose, x, y, ry: 1.0, rx: nojump ? 0 : lerp(0, 2.7, easeInOut(k)), squash: 0.12 * agacha, lKnee: 0.5 * agacha, rKnee: 0.5 * agacha, lLeg: 0.3 * agacha, rLeg: 0.3 * agacha }, {
          expr: t < 1.2 ? 'surpreso' : nojump ? 'assustado' : 'assustado', gy: -0.6 * espia,
        });
        exp.root.visible = y > -4.5;
        const desce = smooth(seg(t, pula, pula + 0.8));
        E.cam(lerp(1.2, 0.5, desce), lerp(3.1, 4.2, desce), lerp(7.9, 3.4, desce), lerp(-0.85, 0, desce), lerp(1.0, -1.2, desce), 0, 36);
      },

      queda(s) {
        const { t } = s;
        espacoBase(s);
        const fase = (tt) => lerp(0, Math.PI / 2 * 0.86, easeIn(seg(tt, 0.35, s.dur)));
        const yAt = (tt) => RT * Math.cos(fase(tt));
        posMini(yAt(t), s.T);
        rastroEm((tt) => yAt(tt - s.T + t), s.T, 0.06);
        rastro.forEach((r) => (r.visible = t > 0.45));
        const d = lerp(13.5, 12.0, smooth(s.p));
        E.cam(d * 0.66, d * 0.36, d * 0.66, 0, -1.25, 0, 36);
        E.rotulo(V(0, RT, 0), 'BRASIL', { k: seg(t, 0.2, 0.5), dx: -150, dy: -150, bg: '#5cff72' });
        E.rotulo(V(0.05, yAt(t), 0.05), 'VOCÊ', { k: seg(t, 0.8, 1.1), dx: 210, dy: -40, bg: '#ffd23f', linha: true });
        E.rotulo(V(0, 0, 0), 'NÚCLEO', { k: seg(t, 2.2, 2.5), dx: -200, dy: 160, bg: '#ffa31a' });
      },

      velocidade(s) {
        const { t } = s;
        const vel = 0.6 + 2.4 * smooth(seg(t, 0, s.cue('vel')));
        tunelBase(s, vel, 0);
        gotasSuor.forEach((g) => (g.visible = false));
        exp.update(s.T, { ...POSES.queda, y: 0.2 * Math.sin(s.T * 2), rz: 0.08 * Math.sin(s.T * 1.3), lArmOut: 2.0 + 0.1 * wob(s.T * 9), rArmOut: 2.0 + 0.1 * wob(s.T * 9 + 2), cheeks: 0.25 * Math.abs(wob(s.T * 25)) }, {
          expr: t < s.cue('vel') ? 'surpreso' : 'assustado', boca: 0.6 + 0.3 * Math.abs(wob(s.T * 18)),
        });
        E.tremer(0.25 * vel / 3 + pulse(t, s.cue('vel'), 0.4));
        E.cam(0.3, -1.0, 4.3, 0, 1.25, 0, 38);
        const v0 = s.cue('vel');
        E.desenhar((ctx) => {
          const k = back(seg(t, v0, v0 + 0.25));
          if (k <= 0) return;
          const kmh = Math.round(28000 * smooth(seg(t, v0, v0 + 0.8)) / 100) * 100;
          textoContorno(ctx, `${kmh.toLocaleString('pt-BR')} KM/H`, W / 2, 330, { size: 128, scale: k, cor: '#ffe135', rot: -0.04 });
          textoContorno(ctx, '23X A VELOCIDADE DO SOM', W / 2, 450, { size: 52, scale: k * seg(t, v0 + 0.6, v0 + 0.9), cor: '#ffffff' });
        });
      },

      calor(s) {
        const { t } = s;
        const g0 = s.cue('graus');
        const so = s.cue('sol');
        const calor = smooth(seg(t, 0, 1.6));
        tunelBase(s, 2.6, calor);
        if (calor > 0.2) E.tint = `rgba(255,80,0,${0.12 * calor})`;
        exp.update(s.T, { ...POSES.queda, y: 0.2 * Math.sin(s.T * 2), rz: 0.08 * Math.sin(s.T * 1.3), cheeks: 0.15 * Math.abs(wob(s.T * 25)) }, { expr: 'calor', blush: 1 });
        const cab = exp.cabecaMundo(V(), 0.6);
        gotasSuor.forEach((g, i) => {
          const f = ((s.T * 1.4 + i * 0.27) % 1);
          const lado = i % 2 ? 1 : -1;
          g.visible = calor > 0.3;
          g.position.copy(cab).add(V(lado * (0.55 + f * 1.2), 0.3 + f * 1.2 - f * f * 0.5, 0.1));
          g.scale.set(1, 1.4, 1);
        });
        E.tremer(0.3);
        E.cam(0.3, -1.0, 4.3, 0, 1.25, 0, 38);
        E.desenhar((ctx) => {
          const k = back(seg(t, g0, g0 + 0.25));
          if (k > 0) {
            const graus = Math.round(5000 * smooth(seg(t, g0, g0 + 0.7)) / 100) * 100;
            textoContorno(ctx, `+${graus.toLocaleString('pt-BR')} °C`, W / 2, 330, { size: 140, scale: k, cor: '#ff7a1a', rot: -0.03 });
          }
          const ks = back(seg(t, so - 0.2, so + 0.1));
          if (t > so - 0.2) sol(ctx, W / 2 - 120, 560, 95 * ks, s.T, ks);
        });
      },

      freio(s) {
        const { t } = s;
        espacoBase(s);
        const pa = s.cue('parar');
        const fase = (tt) => (Math.PI / 2) * easeOut(seg(tt, 0, pa + 0.2));
        const yAt = (tt) => -RT * Math.sin(fase(tt));
        posMini(yAt(t), s.T, t > pa ? 'comemorar' : 'queda');
        rastroEm((tt) => yAt(tt - s.T + t), s.T, 0.06);
        rastro.forEach((r) => (r.visible = t < pa));
        const d = lerp(13.0, 12.2, smooth(s.p));
        E.cam(d * 0.68, -d * 0.12, d * 0.68, 0, -1.1, 0, 36);
        E.rotulo(V(0, 0, 0), 'CENTRO', { k: seg(t, 0.1, 0.4) * (1 - seg(t, 1.6, 1.9)), dx: -200, dy: -160, bg: '#ffa31a' });
        E.rotulo(V(0, -RT, 0), 'OUTRO LADO', { k: seg(t, pa - 0.2, pa + 0.1), dx: -170, dy: 170, bg: '#5cd3ff' });
      },

      tempo(s) {
        const { t } = s;
        espacoBase(s);
        E.show(relSet);
        mini.root.visible = false;
        rastro.forEach((r) => (r.visible = false));
        const m = s.cue('min');
        rel.position.set(2.6, 1.0, 2.6);
        rel.rotation.set(0.05, Math.PI / 4 + 0.1 * Math.sin(t * 2), 0.05 * Math.sin(t * 20) * (t < m ? 1 : 0.2));
        rel.ponteiros(t * 10, t * 0.8);
        rel.scale.setScalar(Math.max(0.001, 0.42 * back(seg(t, 0, 0.35))));
        minTxt.visible = t > m;
        minTxt.scale.setScalar(Math.max(0.001, elastic(seg(t, m, m + 0.7))));
        minTxt.position.set(2.6, 1.78, 2.6);
        minTxt.rotation.set(0.05, Math.PI / 4, 0);
        E.cam(7.6, 1.6, 7.6, 2.3, 0.45, 2.3, 36);
      },

      pacifico(s) {
        const { t } = s;
        oceanoBase(s);
        const sa = s.cue('sai');
        const tw = s.cue('taiwan');
        const sobe = easeOut(seg(t, sa - 0.1, sa + 0.35));
        const boia = -0.95 + 0.06 * Math.sin(s.T * 2.2);
        const y = t < sa - 0.1 ? -3.5 : lerp(-3.0, boia, sobe) + 0.5 * pulse(t, sa, 0.5);
        const aponta = smooth(seg(t, tw - 0.4, tw - 0.1));
        exp.update(s.T, {
          ...misturar({ ...POSES.nadando, lArmFwd: 0.4 + 0.25 * Math.sin(s.T * 5), rArmFwd: 0.4 + 0.25 * Math.sin(s.T * 5 + 2) }, { ...POSES.nadando, rArmFwd: 1.45, rArmOut: 0.7, rElbow: 0.05 }, aponta),
          y, ry: lerp(0.2, -0.5, aponta), headY: lerp(0.4 * Math.sin(t * 1.8), -0.4, aponta),
        }, { expr: t < sa + 0.6 ? 'surpreso' : 'confuso', gx: aponta ? -0.7 : 0.6 * Math.sin(t * 1.8) });
        espuma.visible = t > sa;
        espuma.position.set(0, onda(0, 0, s.T) + 0.02, 0);
        espuma.scale.setScalar(1 + 0.08 * Math.sin(s.T * 3) + 1.5 * pulse(t, sa, 0.5));
        animarRespingo(t - sa);
        bolhas.visible = t < sa;
        bolhas.update(s.T, { x: 0, y: -0.2, z: 0, w: 1, d: 1, h: 0.3, r: 0.08, vel: 1.4 });
        E.cam(0.6, 1.6, lerp(6.4, 5.8, smooth(s.p)), -0.4, 0.75, 0, 36);
        E.rotulo(V(-5.5, 1.6, -26), '← TAIWAN', { k: seg(t, tw - 0.1, tw + 0.2), dx: 60, dy: -160, bg: '#ff8fa3', linha: false });
        const kp = seg(t, 0.8, 1.1);
        if (kp > 0) E.desenhar((ctx) => pilula(ctx, 'OCEANO PACÍFICO', W / 2, 330, back(kp)));
      },

      cai(s) {
        const { t } = s;
        oceanoBase(s);
        const c = s.cue('cai');
        const afunda = easeIn(seg(t, c - 0.1, c + 0.35));
        const boia = -0.95 + 0.06 * Math.sin(s.T * 2.2);
        exp.update(s.T, {
          ...misturar({ ...POSES.nadando, lArmFwd: 0.4 + 0.25 * Math.sin(s.T * 5), rArmFwd: 0.4 + 0.25 * Math.sin(s.T * 5 + 2) }, 'mergulho', smooth(seg(t, c - 0.2, c))),
          y: lerp(boia, -4.5, afunda), ry: 0.2,
        }, { expr: t < c - 0.3 ? 'confuso' : 'assustado', gy: t < c - 0.3 ? 0 : 0.6 });
        espuma.visible = true;
        espuma.position.set(0, onda(0, 0, s.T) + 0.02, 0);
        espuma.scale.setScalar(1 + 0.08 * Math.sin(s.T * 3) + 1.2 * pulse(t, c + 0.1, 0.6));
        animarRespingo(t - c - 0.08);
        bolhas.visible = t > c + 0.3;
        bolhas.update(s.T, { x: 0, y: -0.2, z: 0, w: 1, d: 1, h: 0.3, r: 0.08, vel: 1.4 });
        E.cam(0.4, 1.7, lerp(5.6, 5.0, smooth(s.p)), -0.1, 0.65, 0, 36);
        const cab = exp.cabecaMundo(V(), 1.25);
        E.desenhar((ctx) => {
          if (t > c - 0.1) return;
          const [x, y] = E.projetar(cab);
          textoContorno(ctx, '?', x + 10, y - 40, { size: 150, scale: back(seg(t, 0.4, 0.6)), cor: '#ffffff' });
        });
      },

      final(s) {
        const { t } = s;
        espacoBase(s);
        const w = (Math.PI * 2) / 1.9;
        const yAt = (tt) => RT * Math.cos(w * tt);
        posMini(yAt(t), s.T);
        rastroEm((tt) => yAt(tt - s.T + t), s.T, 0.04);
        rastro.forEach((r) => (r.visible = true));
        const d = lerp(13.5, 12.5, smooth(s.p));
        const ang = Math.PI / 4 + 0.25 * Math.sin(t * 0.4);
        E.cam(Math.sin(ang) * d, d * 0.18, Math.cos(ang) * d, 0, -1.2, 0, 36);
        const se = s.cue('sempre');
        const cta = seg(t, s.dur - 1.5, s.dur - 1.2);
        E.desenhar((ctx) => {
          const k = back(seg(t, se, se + 0.3));
          if (k > 0) textoContorno(ctx, '∞', W / 2, 1480, { size: 320, scale: k, cor: '#ffe135' });
          if (cta > 0) pilula(ctx, 'SIGA PRA MAIS CURIOSIDADES!', W / 2, 330, back(cta));
        });
      },
    },
  };
}

function sol(ctx, x, y, r, T, k) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(T * 0.5);
  ctx.fillStyle = '#ffb703';
  for (let i = 0; i < 12; i++) {
    ctx.rotate(Math.PI / 6);
    ctx.beginPath();
    ctx.moveTo(r * 1.15, -r * 0.18);
    ctx.lineTo(r * 1.65, 0);
    ctx.lineTo(r * 1.15, r * 0.18);
    ctx.fill();
  }
  ctx.restore();
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, '#fff7c2');
  g.addColorStop(1, '#ff9f1c');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 10; ctx.strokeStyle = '#111'; ctx.stroke();
  textoContorno(ctx, '≈ SOL', x + 95 * 2.3, y, { size: 80, scale: k, cor: '#ffe135' });
}
