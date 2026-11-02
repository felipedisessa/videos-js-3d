// Vídeo 4: E se a Lua sumisse?
import {
  THREE, W, mat, mesh, group, brilho, rng, seg, smooth, easeIn, back, elastic, pulse, lerp, textoContorno, explosao,
} from '../engine.js';
import { Boneco, misturar, criarOlho } from '../bonequinho.js';
import { estrelas, particulas } from '../props.js';
import { pilula } from './chiclete.js';
import { texturaTerra } from './buraco.js';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const Z = V(0, 0, 1);

function texturaLua() {
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

function halo(cor = '255,250,220', tam = 6) {
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

const ATMOS = {
  vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
  fragmentShader: 'varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 2.5); gl_FragColor = vec4(vec3(0.35,0.65,1.0) * f * 1.6, f); }',
  side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
};

function barra(ctx, rotulo, frac, cor, y, k = 1) {
  if (k <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, k * 1.5);
  const x0 = 140;
  const larg = 800;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.beginPath(); ctx.roundRect(x0, y, larg, 70, 35); ctx.fill();
  ctx.fillStyle = cor;
  ctx.beginPath(); ctx.roundRect(x0, y, Math.max(70, larg * frac), 70, 35); ctx.fill();
  ctx.lineWidth = 8; ctx.strokeStyle = '#111';
  ctx.beginPath(); ctx.roundRect(x0, y, larg, 70, 35); ctx.stroke();
  ctx.restore();
  textoContorno(ctx, rotulo, W / 2, y - 48, { size: 54, cor: '#fff' });
  textoContorno(ctx, `${Math.round(frac * 100)}%`, x0 + Math.max(70, larg * frac) - 70, y + 36, { size: 46, cor: '#fff', contorno: 0.18 });
}

export function criar(E) {
  const menina = new Boneco({ camisa: 0x38bdf8, estilo: 'longo', cabelo: 0x2b1a12, calca: 0x6d28d9, fase: 0.3 });
  const luaTx = texturaLua();
  const luaMat = new THREE.MeshStandardMaterial({ map: luaTx, emissive: 0xffffff, emissiveMap: luaTx, emissiveIntensity: 0.55, roughness: 1, fog: false });

  // ---------- noite ----------
  const noite = E.set();
  const R = rng(12);
  for (let i = 0; i < 60; i++) {
    const a = R() * Math.PI * 2;
    const r = 1.2 + R() * 8;
    mesh(new THREE.ConeGeometry(0.05 + R() * 0.05, 0.22 + R() * 0.2, 5), mat(0x2f6b3a, { roughness: 0.9 }), { pos: [Math.cos(a) * r, 0.1, Math.sin(a) * r - 1], parent: noite });
  }
  mesh(new THREE.SphereGeometry(9, 48, 24), mat(0x24563a, { roughness: 0.95 }), { pos: [-8, -6.5, -16], parent: noite, sombra: false });
  mesh(new THREE.SphereGeometry(11, 48, 24), mat(0x1d4a32, { roughness: 0.95 }), { pos: [9, -8, -22], parent: noite, sombra: false });
  const ceuNoite = estrelas(1600, 120, 4);
  noite.add(ceuNoite);
  const LUA_POS = V(-4.6, 18.5, -24);
  const luaNoite = mesh(new THREE.SphereGeometry(2.4, 64, 40), luaMat, { pos: LUA_POS.toArray(), parent: noite, sombra: false });
  const haloNoite = halo('220,230,255', 16);
  haloNoite.position.copy(LUA_POS);
  noite.add(haloNoite);
  const lanterna = group(menina.braco[1].mao, [0, -0.08, 0.04]);
  mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.3, 16), mat(0x333842, { roughness: 0.4, metalness: 0.5 }), { pos: [0, -0.1, 0], parent: lanterna });
  mesh(new THREE.CircleGeometry(0.075, 16), brilho(0xfff2b0, 3), { pos: [0, -0.26, 0], rot: [Math.PI / 2, 0, 0], parent: lanterna, sombra: false });
  const feixe = mesh(new THREE.ConeGeometry(1.1, 4.5, 32, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff2b0, transparent: true, opacity: 0.14, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), { pos: [0, -0.27 - 2.25, 0], parent: lanterna, sombra: false });
  const spot = new THREE.SpotLight(0xfff2b0, 0, 14, 0.42, 0.5, 1.2);
  spot.position.set(0, -0.26, 0);
  lanterna.add(spot);
  const alvoSpot = new THREE.Object3D();
  alvoSpot.position.set(0, -5, 0);
  lanterna.add(alvoSpot);
  spot.target = alvoSpot;

  function noiteBase(s, luz) {
    E.show(noite);
    noite.add(menina.root);
    E.fundo(0x0b1440, 0x2a4a8a, { chaoCor: 0x1c4429, near: 10, far: 40, neblina: 0x1a2c5a });
    E.key.color.set(0xbcd0ff);
    E.key.intensity = lerp(0.12, 1.5, luz);
    E.key.position.set(-3, 9, -6);
    E.hemi.intensity = lerp(0.1, 0.45, luz);
    E.hemi.color.set(0x8fa8ff);
    E.rim.color.set(0x9fb8ff);
    E.rim.intensity = lerp(0.3, 1.6, luz);
    E.fill.intensity = lerp(0.05, 0.3, luz);
    E.scene.environmentIntensity = lerp(0.06, 0.3, luz);
    ceuNoite.rotation.y = s.T * 0.003;
    E.gtao.enabled = false;
  }
  function lanternaLigada(k) {
    lanterna.visible = k > 0;
    feixe.material.opacity = 0.14 * k;
    spot.intensity = 25 * k;
  }

  // ---------- espaço ----------
  const espaco = E.set();
  espaco.add(estrelas(2000, 150, 8));
  const terraG = group(espaco, [0, -1.7, 0]);
  const terraEixo = group(terraG);
  const terra = mesh(new THREE.SphereGeometry(1.5, 96, 64), new THREE.MeshPhysicalMaterial({ map: texturaTerra(), roughness: 0.55, clearcoat: 0.4 }), { parent: terraEixo, sombra: false });
  const atmos = new THREE.Mesh(new THREE.SphereGeometry(1.68, 64, 48), new THREE.ShaderMaterial(ATMOS));
  terraG.add(atmos);
  const bojo = mesh(new THREE.SphereGeometry(1.53, 64, 48), new THREE.MeshPhysicalMaterial({ color: 0x6fd3ff, roughness: 0.1, clearcoat: 1, transparent: true, opacity: 0.5, depthWrite: false, emissive: 0x1f6fbf, emissiveIntensity: 0.4 }), { parent: terraG, sombra: false });
  const eixo = group(terraEixo);
  mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.1, 12), mat(0xff3b4d, { roughness: 0.3, emissive: 0xff3b4d, emissiveIntensity: 0.3 }), { pos: [0, 1.6, 0], parent: eixo });
  mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.1, 12), mat(0xffffff, { roughness: 0.3 }), { pos: [0, -1.6, 0], parent: eixo });
  const luaEsp = mesh(new THREE.SphereGeometry(0.42, 48, 32), luaMat, { parent: espaco, sombra: false });
  const sol = mesh(new THREE.SphereGeometry(1.3, 48, 32), brilho(0xffd34d, 2.2, { fog: false }), { pos: [-1.6, 3.1, -4], parent: espaco, sombra: false });
  const haloSol = halo('255,210,90', 6);
  haloSol.position.copy(sol.position);
  espaco.add(haloSol);
  function espacoBase(s) {
    E.show(espaco);
    E.fundo(0x0a1230, 0x01030a, { chao: false, near: 300, far: 600 });
    E.hemi.intensity = 0.25;
    E.key.position.set(-6, 4, 6);
    E.key.intensity = 3.0;
    E.rim.intensity = 0.5;
    E.fill.intensity = 0.15;
    E.scene.environmentIntensity = 0.25;
    E.gtao.enabled = false;
    terra.rotation.y = s.T * 0.12;
  }

  // ---------- praia ----------
  const praia = E.set();
  const aguaGeo = new THREE.PlaneGeometry(60, 40, 120, 80);
  const aguaBase = Float32Array.from(aguaGeo.attributes.position.array);
  const agua = mesh(aguaGeo, new THREE.MeshPhysicalMaterial({ color: 0x22a6d9, roughness: 0.1, clearcoat: 0.8, transparent: true, opacity: 0.92 }), { rot: [-Math.PI / 2, 0, 0], parent: praia, sombra: false });
  const espuma = mesh(new THREE.CapsuleGeometry(0.08, 60, 4, 8), mat(0xffffff, { roughness: 0.5 }), { rot: [0, 0, Math.PI / 2], parent: praia, sombra: false });
  const caranguejo = group(praia);
  const corC = mat(0xff5a3c, { roughness: 0.35, clearcoat: 0.6 });
  mesh(new THREE.SphereGeometry(0.36, 32, 20), corC, { pos: [0, 0.32, 0], scale: [1.3, 0.62, 1], parent: caranguejo });
  const olhosC = [1, -1].map((sx) => {
    mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.28, 8), corC, { pos: [sx * 0.14, 0.58, 0.18], parent: caranguejo });
    const ol = criarOlho(0.09);
    ol.g.position.set(sx * 0.14, 0.76, 0.2);
    caranguejo.add(ol.g);
    return ol;
  });
  const bocaC = mesh(new THREE.TorusGeometry(0.06, 0.015, 8, 16, Math.PI), mat(0x3a0f0f), { pos: [0, 0.34, 0.37], parent: caranguejo });
  const garras = [1, -1].map((sx) => {
    const g = group(caranguejo, [sx * 0.42, 0.32, 0.2]);
    mesh(new THREE.CapsuleGeometry(0.05, 0.22, 4, 8), corC, { rot: [0, 0, sx * 1.0], pos: [sx * 0.08, 0.06, 0], parent: g });
    const pinca = group(g, [sx * 0.2, 0.22, 0]);
    mesh(new THREE.SphereGeometry(0.13, 16, 12), corC, { scale: [1, 1.2, 0.8], parent: pinca });
    mesh(new THREE.ConeGeometry(0.05, 0.18, 8), corC, { pos: [sx * 0.05, 0.17, 0], rot: [0, 0, -sx * 0.4], parent: pinca });
    return g;
  });
  for (const sx of [1, -1]) for (let i = 0; i < 3; i++) mesh(new THREE.CapsuleGeometry(0.03, 0.26, 4, 6), corC, { pos: [sx * 0.42, 0.14, -0.12 + i * 0.13], rot: [0, 0, sx * 0.9], parent: caranguejo });
  const coqueiro = group(praia, [-2.4, 0, -2.5]);
  for (let i = 0; i < 5; i++) mesh(new THREE.CylinderGeometry(0.12 - i * 0.012, 0.14 - i * 0.012, 0.75, 10), mat(0x8b5a2b, { roughness: 0.8 }), { pos: [i * 0.1, 0.37 + i * 0.72, 0], rot: [0, 0, -0.12], parent: coqueiro });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    mesh(new THREE.SphereGeometry(0.75, 12, 8), mat(0x2e8b3c, { roughness: 0.8 }), { pos: [0.5 + Math.cos(a) * 0.65, 3.6, Math.sin(a) * 0.65], scale: [1.2, 0.16, 0.42], rot: [0, -a, -0.35], parent: coqueiro });
  }
  const estrelaMar = (() => {
    const s = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
      const r = i % 2 ? 0.1 : 0.25;
      i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    return mesh(new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 }), mat(0xff9f1c, { roughness: 0.5 }), { rot: [-Math.PI / 2, 0, 0.4], pos: [1.1, 0.04, 0.6], parent: praia });
  })();
  void estrelaMar;
  const onda = (x, z, T) => 0.05 * Math.sin(0.8 * x + 1.4 * T) + 0.04 * Math.sin(1.1 * z - 1.2 * T);

  // ---------- recife ----------
  const recife = E.set();
  const coralRosa = group(recife, [-1.2, 0, -0.6]);
  const rosa = mat(0xff6fa3, { roughness: 0.5, clearcoat: 0.3 });
  const galho = (pai, nivel, comp) => {
    mesh(new THREE.CylinderGeometry(0.05 * comp, 0.08 * comp, comp, 10), rosa, { pos: [0, comp / 2, 0], parent: pai });
    if (nivel === 0) { mesh(new THREE.SphereGeometry(0.07, 12, 8), rosa, { pos: [0, comp, 0], parent: pai }); return; }
    for (const a of [-0.6, 0.15, 0.7]) {
      const g = group(pai, [0, comp, 0]);
      g.rotation.set(a * 0.5, a * 2, a);
      galho(g, nivel - 1, comp * 0.68);
    }
  };
  galho(coralRosa, 3, 0.85);
  const cerebro = group(recife, [0.55, 0.0, 0.5]);
  const geoC = new THREE.SphereGeometry(0.62, 64, 48);
  const pc = geoC.attributes.position;
  const vv = V();
  for (let i = 0; i < pc.count; i++) {
    vv.fromBufferAttribute(pc, i);
    vv.multiplyScalar(1 + 0.04 * Math.sin(vv.x * 26 + Math.sin(vv.y * 14) * 2) * Math.cos(vv.z * 20));
    pc.setXYZ(i, vv.x, vv.y, vv.z);
  }
  geoC.computeVertexNormals();
  mesh(geoC, mat(0xc6e05a, { roughness: 0.6 }), { pos: [0, 0.42, 0], scale: [1, 0.78, 1], parent: cerebro });
  const olhosCor = [1, -1].map((sx) => {
    const ol = criarOlho(0.11);
    const d = V(sx * 0.3, 0.35, 0.9).normalize();
    ol.g.position.copy(d).multiplyScalar(0.6).add(V(0, 0.42, 0));
    ol.g.quaternion.setFromUnitVectors(Z, d);
    cerebro.add(ol.g);
    return ol;
  });
  const bocaCor = mesh(new THREE.TorusGeometry(0.08, 0.02, 8, 16, Math.PI), mat(0x2f3a10), { pos: [0, 0.38, 0.6], parent: cerebro });
  const tubos = group(recife, [1.7, 0, -1.3]);
  [[0, 0, 0.9], [0.25, 0.1, 0.65], [-0.22, 0.15, 0.55], [0.1, -0.25, 0.75], [-0.1, 0.3, 0.45]].forEach(([x, z, h]) => mesh(new THREE.CylinderGeometry(0.1, 0.08, h, 16, 1, true), mat(0x9b5cff, { roughness: 0.5, side: THREE.DoubleSide }), { pos: [x, h / 2, z], parent: tubos }));
  mesh(new THREE.SphereGeometry(0.9, 32, 16), mat(0xff9f1c, { roughness: 0.6 }), { pos: [-2.0, 1.0, -2.2], scale: [1, 1.2, 0.08], rot: [0, 0.4, 0], parent: recife });
  const algas = [-2.6, -0.3, 2.4, 0.9].map((x, i) => {
    const pts = Array.from({ length: 6 }, (_, k) => V(Math.sin(k * 1.3 + i) * 0.12, k * 0.35, 0));
    const a = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.05, 8), mat(0x3fae5a, { roughness: 0.7 }), { pos: [x, 0, -1.5 - i * 0.3], parent: recife });
    return a;
  });
  const peixes = [0xffd23f, 0x5cc8ff, 0xff8fab].map((c) => {
    const g = group(recife);
    mesh(new THREE.SphereGeometry(0.14, 16, 12), mat(c, { roughness: 0.4, clearcoat: 0.6 }), { scale: [1.5, 1, 0.6], parent: g });
    mesh(new THREE.ConeGeometry(0.1, 0.18, 3), mat(c), { pos: [-0.26, 0, 0], rot: [0, 0, Math.PI / 2], parent: g });
    return g;
  });
  const raios = [-1.5, 0.3, 1.8].map((x, i) => mesh(new THREE.ConeGeometry(0.5, 12, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xcff6ff, transparent: true, opacity: 0.02, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }), { pos: [x, 6, -2 - i], rot: [0, 0, 0.15 - i * 0.1], parent: recife, sombra: false }));
  const luaRecife = mesh(new THREE.SphereGeometry(0.5, 48, 32), luaMat, { pos: [0.6, 4.4, -6], parent: recife, sombra: false });
  const haloRecife = halo('220,240,255', 4);
  haloRecife.position.copy(luaRecife.position);
  recife.add(haloRecife);
  const ovas = particulas(70, brilho(0xffb3d1, 1.6), 33);
  recife.add(ovas);

  return {
    beats: {
      gancho(s) {
        const { t } = s;
        const so = s.cue('some');
        noiteBase(s, 1);
        lanternaLigada(0);
        const k = 1 - easeIn(seg(t, so, so + 0.18));
        luaNoite.visible = k > 0.001;
        luaNoite.scale.setScalar(Math.max(0.001, k * (1 + 0.15 * pulse(t, so - 0.1, 0.12))));
        haloNoite.visible = luaNoite.visible;
        haloNoite.scale.setScalar(16 * k + 30 * pulse(t, so, 0.25));
        const susto = smooth(seg(t, so + 0.05, so + 0.35));
        menina.update(s.T, { ...misturar('idle', 'maosRosto', susto), ry: -0.25, headX: -0.4 + 0.1 * susto, headY: -0.1 }, { expr: t < so ? 'sorriso' : 'assustado', gy: 0.8, gx: -0.3 });
        E.cam(1.3, 0.45, 4.6, -0.5, 2.55, -2, 40);
        E.tremer(pulse(t, so, 0.4) * 0.6);
        E.desenhar((ctx) => {
          if (t < so || t > so + 0.6) return;
          const [x, y] = E.projetar(LUA_POS);
          explosao(ctx, x, y, 'POOF!', back(seg(t, so, so + 0.15)), { r: 200, size: 100, cor: '#e8eeff', corTexto: '#3b4cca' });
        });
      },

      noite(s) {
        const { t } = s;
        const es = s.cue('escuras');
        noiteBase(s, 0.35 * (1 - smooth(seg(t, es - 0.2, es + 0.3))));
        luaNoite.visible = haloNoite.visible = false;
        const liga = smooth(seg(t, 0.5, 0.8));
        lanternaLigada(liga * (Math.floor(t * 20) % 7 === 0 && t < 1.2 ? 0.3 : 1));
        const varre = Math.sin(t * 1.6);
        menina.update(s.T, { ...misturar('idle', { rArmFwd: 1.35, rArmOut: 0.15, rElbow: 0.1, lArmOut: 0.3, lElbow: 0.6, lArmFwd: 0.3 }, liga), ry: 0.25 + 0.45 * varre * liga, headY: 0.2 * varre * liga, headX: 0.05 }, { expr: t < es ? 'desconfiado' : 'assustado', gx: 0.5 * varre });
        if (t > es) E.tint = `rgba(5,8,30,${0.25 * smooth(seg(t, es, es + 0.4))})`;
        E.cam(0.4, 1.9, lerp(5.6, 5.0, smooth(s.p)), 0.1, 1.55, -0.5, 36);
      },

      mares(s) {
        const { t } = s;
        espacoBase(s);
        sol.visible = haloSol.visible = false;
        eixo.visible = false;
        terraEixo.rotation.set(0, 0, 0);
        const pu = s.cue('puxa');
        const a = Math.PI / 2 - 0.35 + t * 0.06;
        luaEsp.visible = true;
        luaEsp.scale.setScalar(1);
        luaEsp.position.set(Math.cos(a) * 4.0, -1.7 + Math.sin(a) * 4.0, 0);
        const k = smooth(seg(t, pu - 0.2, pu + 0.6));
        bojo.visible = true;
        bojo.rotation.set(0, 0, a);
        bojo.scale.set(1 + 0.3 * k + 0.03 * Math.sin(t * 6) * k, 1, 1);
        E.cam(0.6, 0.6, lerp(12.5, 11.6, smooth(s.p)), 0.1, -0.55, 0, 36);
        E.rotulo(luaEsp.position, 'LUA', { k: seg(t, 0.4, 0.7), dx: 170, dy: -60, bg: '#e8eeff' });
        const tip = V(Math.cos(a) * 1.75, -1.7 + Math.sin(a) * 1.75, 0);
        E.rotulo(tip, 'MARÉ ALTA', { k: seg(t, s.cue('mares') - 0.1, s.cue('mares') + 0.2), dx: -230, dy: -40, bg: '#5cc8ff' });
      },

      fracas(s) {
        const { t } = s;
        espacoBase(s);
        eixo.visible = false;
        terraEixo.rotation.set(0, 0, 0);
        const so = s.cue('sol');
        const te = s.cue('terco');
        const some = easeIn(seg(t, 0.1, 0.35));
        const a0 = Math.PI / 2 - 0.35 + 6 * 0.06;
        luaEsp.visible = some < 1;
        luaEsp.position.set(Math.cos(a0) * 4.0, -1.7 + Math.sin(a0) * 4.0, 0);
        luaEsp.scale.setScalar(Math.max(0.001, 1 - some));
        const ks = back(seg(t, so - 0.3, so + 0.1));
        sol.visible = haloSol.visible = t > so - 0.3;
        sol.scale.setScalar(Math.max(0.001, ks));
        haloSol.scale.setScalar(6 * Math.max(0.001, ks) * (1 + 0.04 * Math.sin(t * 5)));
        const ang = Math.atan2(sol.position.y + 1.7, sol.position.x);
        const forca = lerp(1, 0.33, smooth(seg(t, te - 0.3, te + 0.5)));
        bojo.visible = true;
        bojo.rotation.set(0, 0, t > so ? ang : a0);
        bojo.scale.set(1 + 0.3 * (t < 0.35 ? 1 : t < so ? 0.3 : forca), 1, 1);
        E.cam(0.6, 0.6, 11.6, 0.1, -0.55, 0, 36);
        E.rotulo(sol.position, 'SOL', { k: seg(t, so, so + 0.3), dx: 170, dy: 60, bg: '#ffd34d' });
        const kb = seg(t, so + 0.4, so + 0.7);
        E.desenhar((ctx) => {
          if (t > 0.1 && t < 0.6) {
            const [x, y] = E.projetar(luaEsp.position);
            explosao(ctx, x, y, 'POOF!', back(seg(t, 0.1, 0.25)), { r: 150, size: 80, cor: '#e8eeff', corTexto: '#3b4cca' });
          }
          barra(ctx, 'FORÇA DAS MARÉS', forca, forca < 0.6 ? '#ff5c5c' : '#5cc8ff', 470, kb);
        });
      },

      praia(s) {
        const { t } = s;
        E.show(praia);
        E.fundo(0x3aa0ff, 0xbfe6ff, { chaoCor: 0xf2d38b, near: 18, far: 60, neblina: 0xbfe6ff });
        E.sombra(0, 0, 5);
        const sobe = s.cue('sobe');
        const sof = s.cue('sofrer');
        const congela = smooth(seg(t, sof - 0.6, sof));
        const mare = Math.sin(t * 2.0) * (1 - congela) + -1 * congela;
        const p = aguaGeo.attributes.position;
        for (let i = 0; i < p.count; i++) p.setZ(i, onda(aguaBase[i * 3], aguaBase[i * 3 + 1], s.T));
        p.needsUpdate = true;
        aguaGeo.computeVertexNormals();
        const frente = -1.6 + 0.9 * mare;
        agua.position.set(0, 0.16, frente - 20);
        espuma.position.set(0, 0.17, frente);
        const triste = smooth(seg(t, sof - 0.1, sof + 0.3));
        caranguejo.position.set(0.1, 0.1 * Math.abs(Math.sin(t * 6)) * (1 - triste), 0.4);
        caranguejo.rotation.set(0, -0.25 + 0.15 * Math.sin(t * 3) * (1 - triste), 0);
        garras.forEach((g, i) => (g.rotation.z = (i ? -1 : 1) * (0.5 * Math.sin(t * 8 + i) * (1 - triste) - 0.4 * triste)));
        olhosC.forEach((ol) => { ol.lid.scale.set(1, lerp(1, 0.6, triste), 1); ol.pupila.position.y = -0.04 * triste; });
        bocaC.rotation.z = triste > 0.5 ? 0 : Math.PI;
        bocaC.position.y = triste > 0.5 ? 0.31 : 0.36;
        E.cam(1.1, 1.35, lerp(4.3, 3.8, smooth(s.p)), 0, 0.55, -0.6, 36);
        E.rotulo(V(-0.6, 0.1, frente), 'SOBE E DESCE', { k: seg(t, sobe - 0.1, sobe + 0.2) * (1 - seg(t, sof - 0.3, sof)), dx: -40, dy: -330, bg: '#5cc8ff' });
      },

      corais(s) {
        const { t } = s;
        E.show(recife);
        E.fundo(0x1aa0c8, 0x063a5c, { chaoCor: 0xd9c48f, near: 5, far: 20, neblina: 0x0b5d85 });
        E.key.color.set(0xcff6ff);
        E.rim.color.set(0x5cc8ff);
        E.hemi.color.set(0x8fe3ff);
        const ch = s.cue('cheia');
        const pe = s.cue('perdidos');
        const luaK = 1 - smooth(seg(t, pe - 0.5, pe));
        luaRecife.visible = haloRecife.visible = luaK > 0.01;
        luaRecife.scale.setScalar(Math.max(0.001, luaK * (1 + 0.15 * pulse(t, ch, 0.4))));
        haloRecife.scale.setScalar(4 * luaK * (1 + 0.4 * pulse(t, ch, 0.5)));
        raios.forEach((r, i) => { r.rotation.z = 0.15 - i * 0.1 + 0.05 * Math.sin(s.T * 0.7 + i); r.material.opacity = 0.02 * (0.4 + 0.6 * luaK); });
        algas.forEach((a, i) => (a.rotation.z = 0.12 * Math.sin(s.T * 1.2 + i)));
        peixes.forEach((f, i) => {
          const a = s.T * (0.5 + i * 0.15) + i * 2;
          f.position.set(Math.cos(a) * (1.6 + i * 0.3), 1.3 + i * 0.35 + 0.1 * Math.sin(s.T * 2 + i), -0.8 + Math.sin(a) * 0.9);
          f.rotation.set(0, -a - Math.PI / 2, 0);
        });
        ovas.visible = t > 1.4 && t < pe + 0.4;
        ovas.update(s.T, { x: -0.3, y: 0.4, z: -0.4, w: 3, d: 1.5, h: 3.2, r: 0.07, vel: 0.25 * (t < pe ? 1 : 0.2) });
        const confuso = smooth(seg(t, pe - 0.1, pe + 0.3));
        olhosCor.forEach((ol, i) => { ol.pupila.position.x = confuso ? (i ? -0.03 : 0.03) * Math.sin(t * 5) : 0; ol.lid.scale.set(1, 1, 1); ol.pupila.position.y = 0.03 * (1 - confuso); });
        bocaCor.rotation.z = confuso > 0.5 ? 0 : Math.PI;
        E.cam(0.5, 2.0, lerp(7.0, 6.3, smooth(s.p)), 0, 1.6, -1, 36);
        E.rotulo(luaRecife.position, 'LUA CHEIA', { k: seg(t, ch - 0.1, ch + 0.2) * luaK, dx: 0, dy: 170, bg: '#e8eeff' });
        E.desenhar((ctx) => {
          if (confuso <= 0) return;
          for (const [p, dx] of [[V(0.55, 1.3, 0.5), 0], [V(-1.2, 2.4, -0.6), 0], [V(1.7, 1.2, -1.3), 0]]) {
            const [x, y] = E.projetar(p);
            textoContorno(ctx, '?', x + dx, y - 60, { size: 110, scale: back(confuso), cor: '#ffffff' });
          }
        });
      },

      eixo(s) {
        const { t } = s;
        espacoBase(s);
        sol.visible = haloSol.visible = false;
        luaEsp.visible = false;
        bojo.visible = false;
        eixo.visible = true;
        const fi = s.cue('firme');
        const ba = s.cue('balancar');
        const caos = smooth(seg(t, ba - 0.2, ba + 1.2));
        const tilt = 0.41 + caos * (0.35 * Math.sin(t * 2.6) + 0.2 * Math.sin(t * 4.3 + 1));
        const prec = t * (0.3 + 1.6 * caos);
        terraEixo.rotation.set(0, 0, 0);
        terraEixo.quaternion.setFromEuler(new THREE.Euler(0, prec, tilt, 'YXZ'));
        E.cam(0.4, 0.2, lerp(11.5, 10.6, smooth(s.p)), 0.0, -2.2, 0, 36);
        const topo = V(0, 2.7, 0).applyQuaternion(terraEixo.quaternion).add(V(0, -1.7, 0));
        E.rotulo(topo, 'EIXO', { k: seg(t, 0.4, 0.7), dx: 170, dy: -60, bg: '#ff8fa3' });
        E.tremer(0.25 * caos);
        const kp = seg(t, s.beat.words.find((w) => w.txt.toLowerCase().startsWith('bagun')).s, s.beat.words.find((w) => w.txt.toLowerCase().startsWith('bagun')).s + 0.3);
        E.desenhar((ctx) => {
          if (t > fi && t < ba) textoContorno(ctx, 'ESTÁVEL ✓', W / 2, 330, { size: 90, scale: back(seg(t, fi, fi + 0.25)), cor: '#5cff72' });
          if (kp > 0) pilula(ctx, 'ESTAÇÕES BAGUNÇADAS', W / 2, 330, back(kp));
        });
      },

      final(s) {
        const { t } = s;
        const pe = s.cue('pedra');
        const volta = elastic(seg(t, pe, pe + 0.8));
        noiteBase(s, lerp(0.3, 1, smooth(seg(t, pe, pe + 0.4))));
        lanternaLigada(1 - smooth(seg(t, pe, pe + 0.3)));
        luaNoite.visible = haloNoite.visible = t > pe;
        luaNoite.scale.setScalar(Math.max(0.001, volta));
        haloNoite.scale.setScalar(16 * Math.max(0.001, volta));
        const festa = smooth(seg(t, pe + 0.2, pe + 0.6));
        menina.update(s.T, { ...misturar({ rArmFwd: 1.35, rArmOut: 0.15, rElbow: 0.1 }, 'comemorar', festa), ry: -0.25, headX: -0.35 * festa, bob: 0.1 * Math.abs(Math.sin(t * 8)) * festa }, { expr: t < pe ? 'desconfiado' : 'feliz', gy: 0.8 * festa, gx: -0.3 * festa });
        E.cam(1.3, 0.45, 4.6, -0.5, 2.55, -2, 40);
        const cta = seg(t, s.dur - 1.5, s.dur - 1.2);
        if (cta > 0) E.desenhar((ctx) => pilula(ctx, 'SIGA PRA MAIS CURIOSIDADES!', W / 2, 330, back(cta)));
      },
    },
  };
}
