// Vídeo 8: Por que o mar é salgado?
import {
  THREE, W, mat, mesh, group, brilho, rng, seg, smooth, easeOut, back, elastic, pulse, lerp, textoContorno,
} from '../engine.js';
import { Boneco, POSES, misturar } from '../bonequinho.js';
import { estrelas, particulas, RoundedBoxGeometry } from '../props.js';
import { pilula } from './chiclete.js';
import { texturaTerra } from './buraco.js';
import { predio, nuvem } from './formiga.js';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

export function criar(E) {
  const guria = new Boneco({ camisa: 0x14b8a6, estilo: 'coque', cabelo: 0x3a2417, calca: 0xf59e0b, fase: 0.45 });
  const R = rng(9);
  const o3 = new THREE.Object3D();

  // ---------- praia ----------
  const praia = E.set();
  const aguaGeo = new THREE.PlaneGeometry(60, 40, 120, 80);
  const aguaBase = Float32Array.from(aguaGeo.attributes.position.array);
  const agua = mesh(aguaGeo, new THREE.MeshPhysicalMaterial({ color: 0x1fa3d6, roughness: 0.1, clearcoat: 0.8 }), { rot: [-Math.PI / 2, 0, 0], pos: [0, 0.16, -21.5], parent: praia, sombra: false });
  void agua;
  mesh(new THREE.CapsuleGeometry(0.08, 60, 4, 8), mat(0xffffff, { roughness: 0.5 }), { rot: [0, 0, Math.PI / 2], pos: [0, 0.17, -1.5], parent: praia, sombra: false });
  const animAgua = (T) => {
    const p = aguaGeo.attributes.position;
    for (let i = 0; i < p.count; i++) p.setZ(i, 0.05 * Math.sin(0.8 * aguaBase[i * 3] + 1.4 * T) + 0.04 * Math.sin(1.1 * aguaBase[i * 3 + 1] - 1.2 * T));
    p.needsUpdate = true;
    aguaGeo.computeVertexNormals();
  };
  const saleiro = group(praia);
  mesh(new THREE.CylinderGeometry(0.42, 0.48, 1.3, 32), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.45, clearcoat: 1, depthWrite: false }), { pos: [0, 0.65, 0], parent: saleiro, sombra: false });
  mesh(new THREE.CylinderGeometry(0.4, 0.46, 0.9, 32), mat(0xffffff, { roughness: 0.9 }), { pos: [0, 0.48, 0], parent: saleiro });
  mesh(new THREE.SphereGeometry(0.43, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xcbd5e1, { metalness: 0.9, roughness: 0.2 }), { pos: [0, 1.3, 0], parent: saleiro });
  const graos = particulas(40, mat(0xffffff, { roughness: 0.4 }), 4);
  graos.rotation.x = Math.PI;
  praia.add(graos);

  // ---------- montanha / rio ----------
  const vale = E.set();
  [[-1.4, 2.6, -3, 1.8], [0.8, 3.4, -4.5, 2.2], [2.6, 2.2, -3.2, 1.5]].forEach(([x, h, z, r]) => {
    mesh(new THREE.ConeGeometry(r, h, 7), mat(0x8d7b6a, { roughness: 0.9, flatShading: true }), { pos: [x, h / 2, z], parent: vale });
    mesh(new THREE.ConeGeometry(r * 0.32, h * 0.32, 7), mat(0xffffff, { roughness: 0.6, flatShading: true }), { pos: [x, h * 0.84, z], parent: vale });
  });
  const ceuNuvem = nuvem(R);
  ceuNuvem.position.set(0.3, 4.6, -3);
  ceuNuvem.scale.setScalar(1.3);
  vale.add(ceuNuvem);
  const nGotas = 120;
  const chuva = new THREE.InstancedMesh(new THREE.BoxGeometry(0.015, 0.22, 0.015), new THREE.MeshBasicMaterial({ color: 0xa5d8ff, transparent: true, opacity: 0.8 }), nGotas);
  vale.add(chuva);
  const dChuva = Array.from({ length: nGotas }, () => ({ x: (R() - 0.5) * 5, z: -2 - R() * 3.5, f: R() }));
  const curvaRio = new THREE.CatmullRomCurve3([V(0.8, 0.9, -3.4), V(0.3, 0.05, -1.8), V(-0.6, 0.03, -0.4), V(0.4, 0.03, 1.0), V(0.0, 0.03, 2.6)]);
  mesh(new THREE.TubeGeometry(curvaRio, 120, 0.22, 12), mat(0x38bdf8, { roughness: 0.15, clearcoat: 1 }), { scale: [1, 0.15, 1], parent: vale, sombra: false });
  const mar = mesh(new THREE.PlaneGeometry(14, 4), mat(0x0ea5e9, { roughness: 0.15, clearcoat: 0.8 }), { rot: [-Math.PI / 2, 0, 0], pos: [0, 0.04, 4.2], parent: vale, sombra: false });
  void mar;
  const nMin = 40;
  const minerais = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.06, 0), mat(0xffffff, { roughness: 0.4 }), nMin);
  const coresMin = [0xfacc15, 0xf472b6, 0xa78bfa, 0xffffff, 0xfb923c];
  for (let i = 0; i < nMin; i++) minerais.setColorAt(i, new THREE.Color(coresMin[i % coresMin.length]));
  vale.add(minerais);
  const pedrinhas = Array.from({ length: 8 }, () => mesh(new THREE.DodecahedronGeometry(0.07, 0), mat(0x9ca3af, { roughness: 0.8 }), { parent: vale }));

  // ---------- fatia do mar ----------
  const fatia = E.set();
  mesh(new RoundedBoxGeometry(2.6, 2.2, 1.6, 3, 0.05), new THREE.MeshPhysicalMaterial({ color: 0x0ea5e9, roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.3, depthWrite: false }), { pos: [0, 1.1, 0], parent: fatia, sombra: false });
  const sol = mesh(new THREE.SphereGeometry(0.6, 32, 20), brilho(0xffd34d, 2.5), { pos: [-0.9, 3.9, -1], parent: fatia, sombra: false });
  const vapor = particulas(30, new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, roughness: 1 }), 12);
  fatia.add(vapor);
  const nSal = 90;
  const cristais = new THREE.InstancedMesh(new THREE.BoxGeometry(0.17, 0.17, 0.17), mat(0xffffff, { roughness: 0.3, clearcoat: 0.8, emissive: 0xffffff, emissiveIntensity: 0.25 }), nSal);
  cristais.frustumCulled = false;
  fatia.add(cristais);
  const dSal = Array.from({ length: nSal }, () => ({ x: (R() - 0.5) * 2.3, y: 0.08 + R() * 2.0, z: (R() - 0.5) * 1.3, r: R() * 3 }));

  // ---------- fundo do mar ----------
  const fundo = E.set();
  const chamines = [[-0.7, 1.6], [0.6, 2.2], [1.5, 1.2]].map(([x, h]) => {
    const g = group(fundo, [x, 0, -0.6]);
    for (let i = 0; i < 4; i++) mesh(new THREE.CylinderGeometry(0.22 - i * 0.03, 0.32 - i * 0.03, h / 4, 10), mat(0x3b2f2a, { roughness: 0.95, flatShading: true }), { pos: [0, h / 8 + (i * h) / 4, 0], parent: g });
    mesh(new THREE.TorusGeometry(0.18, 0.05, 8, 16), brilho(0xff6a00, 2.5), { pos: [0, h, 0], rot: [Math.PI / 2, 0, 0], parent: g, sombra: false });
    const fumo = particulas(30, mat(0x1a1a1a, { roughness: 1 }), 30 + Math.round(h * 10));
    fundo.add(fumo);
    return { g, h, x, fumo };
  });
  for (let i = 0; i < 9; i++) {
    const x = -1.4 + R() * 3;
    const z = 0.2 + R() * 0.8;
    const h = 0.3 + R() * 0.4;
    mesh(new THREE.CylinderGeometry(0.03, 0.03, h, 8), mat(0xf5f5f4), { pos: [x, h / 2, z], parent: fundo });
    mesh(new THREE.SphereGeometry(0.06, 10, 8), mat(0xef4444, { roughness: 0.5 }), { pos: [x, h, z], parent: fundo });
  }

  // ---------- planeta ----------
  const planeta = E.set();
  planeta.add(estrelas(2000, 150, 6));
  const terraG = group(planeta, [0, 0.4, 0]);
  mesh(new THREE.SphereGeometry(1.6, 96, 64), new THREE.MeshStandardMaterial({ map: texturaTerra(), roughness: 0.7 }), { parent: terraG, sombra: false });
  const terraSal = mesh(new THREE.SphereGeometry(1.605, 96, 64), new THREE.MeshStandardMaterial({ map: texturaTerra('#ffffff', '#e2e8f0'), roughness: 0.6, transparent: true, opacity: 0 }), { parent: terraG, sombra: false });

  // ---------- comparação ----------
  const comp = E.set();
  const torre = predio(1.4, 6, 1.4, '#7c8aa5', 44);
  torre.position.set(-0.95, 3, 0);
  comp.add(torre);
  const bloco = mesh(new RoundedBoxGeometry(1.5, 6, 1.5, 3, 0.06), mat(0xffffff, { roughness: 0.35, clearcoat: 0.8, sheen: 0.6 }), { parent: comp });
  const pessoa = new Boneco({ camisa: 0x14b8a6, estilo: 'coque', cabelo: 0x3a2417, calca: 0xf59e0b });
  comp.add(pessoa.root);

  return {
    beats: {
      gancho(s) {
        const { t } = s;
        E.show(praia);
        praia.add(guria.root);
        E.fundo(0x3aa0ff, 0xbfe6ff, { chaoCor: 0xf2d38b, near: 18, far: 60, neblina: 0xbfe6ff });
        animAgua(s.T);
        saleiro.visible = graos.visible = false;
        const pr = s.cue('prova');
        const prova = smooth(seg(t, pr - 0.6, pr - 0.2)) * (1 - smooth(seg(t, pr + 0.1, pr + 0.4)));
        const eca = smooth(seg(t, pr + 0.1, pr + 0.4));
        guria.update(s.T, { ...misturar(misturar('idle', { rArmFwd: 1.0, rArmOut: 0.05, rElbow: 2.3, rArmTwist: 0.4 }, prova), { lArmOut: 1.1, rArmOut: 1.1, lElbow: 0.5, rElbow: 0.5, spineX: -0.1 }, eca), z: -0.6, ry: 0.35, headX: -0.1 * eca }, {
          expr: t < pr ? 'sorriso' : 'bravo', boca: eca > 0.3 ? 0.7 : undefined, fechado: prova > 0.5,
        });
        E.cam(1.0, 1.9, lerp(5.0, 4.4, smooth(s.p)), 0, 1.65, -0.6, 36);
        E.tremer(pulse(t, pr + 0.3, 0.3) * 0.5);
        const cab = guria.cabecaMundo(V(), 0.7);
        E.desenhar((ctx) => {
          if (t < pr + 0.25) return;
          const [x, y] = E.projetar(cab);
          textoContorno(ctx, 'ECA! SALGADO!', x, y - 330, { size: 96, scale: back(seg(t, pr + 0.25, pr + 0.45)), cor: '#ffe135', rot: -0.05 });
        });
      },

      chuva(s) {
        const { t } = s;
        E.show(vale);
        E.fundo(0x7b8ba3, 0xd6dde6, { chaoCor: 0x6ba34a, near: 10, far: 40, neblina: 0xb8c4d2 });
        E.key.intensity = 1.6;
        dChuva.forEach((d, i) => {
          o3.position.set(d.x, 4.3 - ((d.f + s.T * 1.6) % 1) * 4.3, d.z);
          o3.updateMatrix();
          chuva.setMatrixAt(i, o3.matrix);
        });
        chuva.instanceMatrix.needsUpdate = true;
        chuva.visible = true;
        minerais.visible = false;
        const ro = s.cue('rochas');
        pedrinhas.forEach((p, i) => {
          const k = seg(t, ro - 0.2 + i * 0.12, ro + 1.2 + i * 0.12);
          p.visible = k > 0 && k < 1;
          const a = (i / pedrinhas.length) * 0.8 - 0.4;
          p.position.set(0.8 + Math.sin(a) * (0.4 + k * 1.6), 2.8 - k * 2.7, -4.5 + Math.cos(a) * (0.4 + k * 1.8));
          p.rotation.set(t * 6 + i, t * 4, 0);
        });
        E.cam(0.4, 2.6, lerp(8.2, 7.4, smooth(s.p)), 0.5, 1.8, -2.5, 36);
        E.rotulo(V(0.8, 2.2, -4.0), 'ROCHA', { k: seg(t, ro - 0.1, ro + 0.2), dx: 160, dy: -220, bg: '#e5e7eb' });
        E.rotulo(V(0.3, 3.2, -3), 'CHUVA ÁCIDA (FRACA)', { k: seg(t, s.cue('chuva') + 0.6, s.cue('chuva') + 0.9), dx: -40, dy: -260, bg: '#a5d8ff', size: 40 });
      },

      rio(s) {
        const { t } = s;
        E.show(vale);
        E.fundo(0x5ab8ff, 0xd8f1ff, { chaoCor: 0x6ba34a, near: 10, far: 40 });
        chuva.visible = false;
        pedrinhas.forEach((p) => (p.visible = false));
        minerais.visible = true;
        for (let i = 0; i < nMin; i++) {
          const u = (i / nMin + t * 0.12) % 1;
          o3.position.copy(curvaRio.getPointAt(u)).add(V(Math.sin(i * 7) * 0.08, 0.06, Math.cos(i * 5) * 0.08));
          o3.rotation.set(t * 3 + i, t * 2, 0);
          o3.scale.setScalar(1);
          o3.updateMatrix();
          minerais.setMatrixAt(i, o3.matrix);
        }
        minerais.instanceMatrix.needsUpdate = true;
        E.cam(1.6, 3.6, lerp(7.6, 6.8, smooth(s.p)), 0, 0.4, 0, 36);
        E.rotulo(curvaRio.getPointAt(0.55), 'MINERAIS', { k: seg(t, s.cue('minerais'), s.cue('minerais') + 0.3), dx: 180, dy: -200, bg: '#fde68a' });
        E.rotulo(V(-0.5, 0.05, 3.6), 'OCEANO', { k: seg(t, 1.6, 1.9), dx: -120, dy: 190, bg: '#7dd3fc' });
        E.desenhar((ctx) => { const b = s.cue('bilhoes'); if (t > b) textoContorno(ctx, 'HÁ BILHÕES DE ANOS', W / 2, 330, { size: 74, scale: back(seg(t, b, b + 0.25)), cor: '#ffe135' }); });
      },

      sol(s) {
        const { t } = s;
        E.show(fatia);
        E.fundo(0x3aa0ff, 0xbfe6ff, { chao: false });
        E.key.position.set(-3, 8, 4);
        const ev = s.cue('evapora');
        const sa = s.cue('sal');
        sol.scale.setScalar(1 + 0.05 * Math.sin(t * 4));
        vapor.visible = t > ev - 0.3;
        vapor.update(s.T, { x: 0, y: 2.3, z: 0, w: 2.2, d: 1.2, h: 2.2, r: 0.12, vel: 0.35 });
        const n = Math.floor(nSal * smooth(seg(t, sa - 0.2, s.dur)));
        dSal.forEach((d, i) => {
          o3.position.set(d.x, i < n ? lerp(d.y, 0.08 + (i % 9) * 0.05, smooth(seg(t, sa + i * 0.02, sa + 1 + i * 0.02))) : -50, d.z);
          o3.rotation.set(d.r, d.r * 2, 0);
          o3.scale.setScalar(1);
          o3.updateMatrix();
          cristais.setMatrixAt(i, o3.matrix);
        });
        cristais.instanceMatrix.needsUpdate = true;
        E.cam(0.6, 2.8, lerp(9.4, 8.6, smooth(s.p)), 0, 1.5, 0, 36);
        E.rotulo(V(0.6, 3.3, 0), 'VAPOR SEM SAL', { k: seg(t, ev + 0.3, ev + 0.6), dx: 140, dy: -170, bg: '#ffffff' });
        E.rotulo(V(-0.5, 0.3, 0.6), 'O SAL FICA', { k: seg(t, sa, sa + 0.3), dx: -60, dy: 330, bg: '#fde68a' });
      },

      fontes(s) {
        const { t } = s;
        E.show(fundo);
        E.fundo(0x0b3b5c, 0x020a14, { chaoCor: 0x2b2420, near: 4, far: 16, neblina: 0x041a2c });
        E.key.intensity = 1.2;
        E.key.color.set(0x9fd8ff);
        E.rim.color.set(0xff8a3d);
        E.rim.intensity = 2.5;
        chamines.forEach(({ h, x, fumo }) => fumo.update(s.T, { x, y: h, z: -0.6, w: 0.35, d: 0.35, h: 3.2, r: 0.18, vel: 0.35 }));
        E.cam(0.4, 1.7, lerp(6.4, 5.8, smooth(s.p)), 0.3, 1.9, -0.6, 36);
        E.rotulo(V(0.6, 2.2, -0.6), 'FONTE HIDROTERMAL', { k: seg(t, s.cue('fontes'), s.cue('fontes') + 0.3), dx: -40, dy: -300, bg: '#fb923c' });
      },

      camada(s) {
        const { t } = s;
        E.show(planeta);
        E.fundo(0x0a1230, 0x01030a, { chao: false, near: 300, far: 600 });
        E.hemi.intensity = 0.35;
        E.key.position.set(-5, 3, 6);
        E.key.intensity = 3;
        E.gtao.enabled = false;
        const es = s.cue('espalha');
        const me = s.cue('metros');
        terraG.rotation.set(0.35, -1.6 + t * 0.12, 0);
        terraSal.material.opacity = smooth(seg(t, es, es + 2.2));
        E.cam(0, 0.8, lerp(9.0, 8.0, smooth(s.p)), 0, -0.2, 0, 36);
        E.desenhar((ctx) => { if (t > me) textoContorno(ctx, '+150 METROS DE SAL', W / 2, 330, { size: 90, scale: back(seg(t, me, me + 0.25)), cor: '#ffffff' }); });
      },

      predio(s) {
        const { t } = s;
        E.show(comp);
        E.fundo(0x5ab8ff, 0xe0f2fe, { chaoCor: 0x9ca3af });
        E.sombra(0, 0, 6);
        const an = s.cue('andares');
        const cresce = easeOut(seg(t, 0, 0.9));
        bloco.scale.set(1, Math.max(0.001, cresce), 1);
        bloco.position.set(0.95, 3 * cresce, 0);
        pessoa.update(s.T, { s: 0.35, x: 0.1, z: 1.0, ry: 0.2, headX: -0.4 }, { expr: 'surpreso', gy: 0.8 });
        E.cam(0.6, 1.6, 12.5, 0, 3.0, 0, 38);
        E.rotulo(V(0.1, 0.9, 1.0), 'VOCÊ', { k: seg(t, 0.4, 0.7), dx: 0, dy: 170, bg: '#5cff72' });
        E.rotulo(V(0.95, 6.0, 0.75), 'SAL', { k: seg(t, 0.8, 1.1), dx: 120, dy: 40, bg: '#ffffff' });
        E.desenhar((ctx) => { if (t > an) textoContorno(ctx, '≈ 40 ANDARES', W / 2, 1480, { size: 90, scale: back(seg(t, an, an + 0.25)), cor: '#ffe135' }); });
      },

      final(s) {
        const { t } = s;
        E.show(praia);
        praia.add(guria.root);
        E.fundo(0x3aa0ff, 0xbfe6ff, { chaoCor: 0xf2d38b, near: 18, far: 60, neblina: 0xbfe6ff });
        animAgua(s.T);
        const tp = s.cue('tempera');
        const sacode = t > tp - 0.2 && t < tp + 1.0 ? Math.sin(t * 25) : 0;
        saleiro.visible = true;
        guria.update(s.T, { rArmFwd: 1.5, rArmOut: 0.55, rElbow: 0.5 - 0.25 * sacode, z: 0.2, x: 0.45, ry: 0.45 }, { expr: 'orgulhoso' });
        const mao = guria.maoMundo('r', V());
        saleiro.position.copy(mao).add(V(0.0, -0.1, 0.15));
        saleiro.rotation.set(Math.PI * 0.85, 0, -0.2);
        saleiro.scale.setScalar(0.4);
        graos.visible = t > tp - 0.2;
        graos.position.copy(saleiro.position).add(V(0, -0.3, 0.2));
        graos.update(s.T, { x: 0, y: 0, z: 0, w: 0.3, d: 0.3, h: 1.4, r: 0.03, vel: 1.5 });
        E.cam(0.8, 2.0, lerp(6.0, 5.4, smooth(s.p)), 0.15, 1.75, 0, 36);
        const cta = seg(t, s.dur - 1.5, s.dur - 1.2);
        if (cta > 0) E.desenhar((ctx) => pilula(ctx, 'SIGA PRA MAIS CURIOSIDADES!', W / 2, 330, back(cta)));
      },
    },
  };
}
