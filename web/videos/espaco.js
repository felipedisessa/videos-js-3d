// Vídeo 7: O que acontece se você gritar no espaço?
import {
  THREE, W, mat, mesh, group, brilho, seg, smooth, easeOut, back, pulse, lerp, textoContorno, explosao,
} from '../engine.js';
import { Boneco, misturar } from '../bonequinho.js';
import { estrelas, xis, RoundedBoxGeometry } from '../props.js';
import { pilula } from './chiclete.js';
import { texturaTerra } from './buraco.js';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

function astronauta(o) {
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

export function criar(E) {
  const a1 = astronauta({ cabelo: 0x3a2417, estilo: 'curto', fase: 0.2 });
  const a2 = astronauta({ cabelo: 0x111111, estilo: 'coque', pele: 0xc68b5e, fase: 0.7 });

  // ---------- órbita ----------
  const orbita = E.set();
  orbita.add(estrelas(2000, 150, 3));
  const terra = mesh(new THREE.SphereGeometry(7, 96, 64), new THREE.MeshStandardMaterial({ map: texturaTerra(), roughness: 0.85 }), { pos: [0, -9.5, -6], parent: orbita, sombra: false });
  const atm = new THREE.Mesh(new THREE.SphereGeometry(7.5, 64, 48), new THREE.ShaderMaterial({
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 2.5); gl_FragColor = vec4(vec3(0.35,0.65,1.0) * f * 1.6, f); }',
    side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  atm.position.copy(terra.position);
  orbita.add(atm);
  const aneis = Array.from({ length: 4 }, () => mesh(new THREE.TorusGeometry(1, 0.03, 8, 48), brilho(0x9fd4ff, 2.5, { transparent: true }), { parent: orbita, sombra: false }));
  const ondasRadio = Array.from({ length: 5 }, () => mesh(new THREE.TorusGeometry(0.4, 0.03, 8, 32, Math.PI * 0.6), brilho(0x5cff72, 3, { transparent: true }), { parent: orbita, sombra: false }));
  function orbitaBase(s) {
    E.show(orbita);
    E.fundo(0x0a1230, 0x01030a, { chao: false, near: 300, far: 600 });
    E.hemi.intensity = 0.4;
    E.key.position.set(-6, 5, 6);
    E.key.intensity = 2.8;
    E.rim.color.set(0x7fb8ff);
    E.rim.intensity = 2;
    E.scene.environmentIntensity = 0.35;
    E.gtao.enabled = false;
    terra.rotation.set(1.1, s.T * 0.02, 0.3);
    aneis.forEach((a) => (a.visible = false));
    ondasRadio.forEach((a) => (a.visible = false));
  }
  // ondas que nascem na boca e morrem no vidro do capacete
  function ondasNoCapacete(b, t, ativo) {
    const centro = b.cabecaMundo(V(), 0.48);
    const q = b.head.getWorldQuaternion(new THREE.Quaternion());
    aneis.forEach((a, i) => {
      const f = (t * 1.8 + i / aneis.length) % 1;
      a.visible = ativo;
      a.position.copy(centro).add(V(0, -0.1, 0.25).applyQuaternion(q));
      a.quaternion.copy(q);
      a.scale.setScalar(0.12 + f * 0.55);
      a.material.opacity = 1 - f;
    });
  }

  // ---------- diagrama do som ----------
  const diagrama = E.set();
  const caixa = group(diagrama, [-1.45, 1.6, 0]);
  mesh(new RoundedBoxGeometry(0.8, 1.2, 0.7, 3, 0.08), mat(0x1f2937, { roughness: 0.4 }), { parent: caixa });
  const cone = mesh(new THREE.CylinderGeometry(0.32, 0.12, 0.2, 32, 1, true), mat(0x4b5563, { side: THREE.DoubleSide }), { pos: [0.42, 0.1, 0], rot: [0, 0, -Math.PI / 2], parent: caixa });
  const ouvinte = new Boneco({ camisa: 0xf97316, estilo: 'curto', cabelo: 0x3a2417, fase: 0.5 });
  diagrama.add(ouvinte.root);
  const NX = 7;
  const NY = 10;
  const parts = [];
  for (let i = 0; i < NX; i++) for (let j = 0; j < NY; j++) {
    const p = mesh(new THREE.SphereGeometry(0.07, 12, 8), mat(0x60a5fa, { roughness: 0.3, clearcoat: 0.7 }), { parent: diagrama, sombra: false });
    p.userData = { x0: -0.85 + i * 0.28, y0: 0.25 + j * 0.3, i };
    parts.push(p);
  }
  const xOuvido = xis();
  diagrama.add(xOuvido);

  const notas = (ctx, pos, t, k) => {
    if (k <= 0) return;
    const [x, y] = E.projetar(pos);
    for (let i = 0; i < 3; i++) {
      const f = (t * 0.8 + i / 3) % 1;
      ctx.save();
      ctx.globalAlpha = (1 - f) * k;
      textoContorno(ctx, i % 2 ? '♪' : '♫', x - 60 - f * 40 + i * 20, y - 80 - f * 140, { size: 80, cor: '#ffe135', contorno: 0.15 });
      ctx.restore();
    }
  };

  return {
    beats: {
      gancho(s) {
        const { t } = s;
        orbitaBase(s);
        orbita.add(a1.root);
        a2.root.visible = false;
        const g = s.cue('grito');
        const grita = smooth(seg(t, g - 0.15, g + 0.1));
        a1.update(s.T, { ...misturar('idle', 'bracosAbertos', grita), y: 0.1 * Math.sin(s.T * 0.9), rz: 0.08 * Math.sin(s.T * 0.6), rx: 0.05, ry: 0.2, headX: -0.15 * grita, lLeg: 0.2, rLeg: -0.15, lKnee: 0.4, rKnee: 0.2 }, {
          expr: t < g ? 'sorriso' : 'assustado', boca: t > g ? 0.95 : undefined,
        });
        ondasNoCapacete(a1, t, t > g);
        E.cam(0.6, 2.0, lerp(5.0, 4.4, smooth(s.p)), 0, 1.65, 0, 36);
        E.tremer(0.3 * grita);
        const cab = a1.cabecaMundo(V(), 0.5);
        E.desenhar((ctx) => {
          if (t < g) return;
          const [x, y] = E.projetar(cab);
          textoContorno(ctx, 'AAAAAH!', W / 2 + 0 * x + 0 * y, 300, { size: 120, scale: back(seg(t, g, g + 0.15)), cor: '#ffffff', rot: -0.05 });
          if (t > g + 0.45) textoContorno(ctx, '(SILÊNCIO TOTAL)', W / 2, 1480, { size: 60, scale: back(seg(t, g + 0.45, g + 0.65)), cor: '#9fd4ff' });
        });
      },

      ninguem(s) {
        const { t } = s;
        orbitaBase(s);
        orbita.add(a1.root, a2.root);
        const la = s.cue('lado');
        a1.update(s.T, { ...misturar('bracosAbertos', 'bracosAbertos', 1), x: -0.75, y: 0.1 * Math.sin(s.T * 0.9), rz: 0.1, ry: 0.4, headX: -0.15 }, { expr: 'assustado', boca: 0.95 });
        const ombro = pulse(t, la, 0.8);
        a2.update(s.T, { ...misturar({ lArmFwd: 0.9, lElbow: 1.4, rArmFwd: 0.9, rElbow: 1.4, lArmOut: -0.1, rArmOut: -0.1 }, { lArmOut: 1.3, lElbow: 1.6, rArmOut: 1.3, rElbow: 1.6, lArmTwist: -1, rArmTwist: -1 }, ombro), x: 0.85, z: -0.3, y: -0.1 + 0.1 * Math.sin(s.T * 0.8 + 1), rz: -0.08, ry: -0.35, headY: -0.3 * ombro }, {
          expr: t < la ? 'sorriso' : 'confuso', gx: -0.6 * ombro,
        });
        ondasNoCapacete(a1, t, true);
        E.cam(0.2, 2.1, 7.0, 0.05, 1.6, 0, 36);
        const cab2 = a2.cabecaMundo(V(), 1.25);
        E.desenhar((ctx) => {
          const [x, y] = E.projetar(cab2);
          if (t < la) textoContorno(ctx, 'zzz...', x + 40, y - 30, { size: 70, cor: '#ffffff' });
          else textoContorno(ctx, '?', x + 20, y - 40, { size: 130, scale: back(seg(t, la, la + 0.2)), cor: '#ffffff' });
        });
      },

      som(s) {
        const { t } = s;
        E.show(diagrama);
        E.fundo(0x7dd3fc, 0xe0f2fe, { chaoCor: 0xbae6fd });
        const kAr = 1;
        parts.forEach((p) => {
          const { x0, y0 } = p.userData;
          p.visible = true;
          p.scale.setScalar(kAr);
          p.position.set(x0 + 0.1 * Math.sin(x0 * 5 - t * 9), y0, 0);
        });
        cone.scale.set(1, 1 + 0.25 * Math.sin(t * 40), 1);
        xOuvido.visible = false;
        ouvinte.update(s.T, { x: 1.45, s: 0.8, ry: -1.1, lArmOut: 0.4, lElbow: 2.2, lArmFwd: 0.4 }, { expr: 'feliz' });
        E.cam(0, 2.0, 9.6, 0, 1.45, 0, 36);
        E.rotulo(V(0, 2.4, 0), 'AR', { k: seg(t, s.cue('ar') - 0.1, s.cue('ar') + 0.2), dx: 0, dy: -170, bg: '#ffffff' });
        E.rotulo(V(-0.6, 1.3, 0), 'VIBRAÇÃO', { k: seg(t, s.cue('vibracao'), s.cue('vibracao') + 0.3), dx: 0, dy: 330, bg: '#fde68a' });
        const ouv = ouvinte.cabecaMundo(V(), 0.6);
        E.desenhar((ctx) => notas(ctx, ouv, t, seg(t, 0.8, 1.2)));
      },

      vacuo(s) {
        const { t } = s;
        E.show(diagrama);
        const va = s.cue('vazio');
        const ch = s.cue('chega');
        const escuro = smooth(seg(t, va - 0.3, va + 0.4));
        E.fundo(new THREE.Color(0x7dd3fc).lerp(new THREE.Color(0x050a1a), escuro).getHex(), new THREE.Color(0xe0f2fe).lerp(new THREE.Color(0x0a1230), escuro).getHex(), { chaoCor: new THREE.Color(0xbae6fd).lerp(new THREE.Color(0x1e293b), escuro).getHex() });
        parts.forEach((p) => {
          const { x0, y0, i } = p.userData;
          const k = 1 - smooth(seg(t, va - 0.2 + i * 0.05, va + 0.3 + i * 0.05));
          p.visible = k > 0.01;
          p.scale.setScalar(Math.max(0.001, k));
          p.position.set(x0 + 0.1 * Math.sin(x0 * 5 - t * 9) * k, y0, 0);
        });
        cone.scale.set(1, 1 + 0.25 * Math.sin(t * 40), 1);
        xOuvido.visible = t > ch;
        xOuvido.position.copy(ouvinte.cabecaMundo(V(), 0.5)).add(V(-0.7, 0.3, 0.6));
        xOuvido.scale.setScalar(Math.max(0.001, 0.4 * back(seg(t, ch, ch + 0.2))));
        ouvinte.update(s.T, { x: 1.45, s: 0.8, ry: -1.1, lArmOut: 0.4, lElbow: 2.2, lArmFwd: 0.4 }, { expr: t < va + 0.5 ? 'feliz' : 'confuso' });
        E.cam(0, 2.0, 9.6, 0, 1.45, 0, 36);
        E.rotulo(V(0, 1.4, 0), 'VÁCUO', { k: seg(t, va + 0.5, va + 0.8), dx: 0, dy: -330, bg: '#a5b4fc' });
        const ouv = ouvinte.cabecaMundo(V(), 0.6);
        E.desenhar((ctx) => notas(ctx, ouv, t, 1 - seg(t, va, va + 0.5)));
      },

      capacete(s) {
        const { t } = s;
        orbitaBase(s);
        orbita.add(a1.root);
        a2.root.visible = false;
        const gr = s.cue('grito');
        a1.update(s.T, { y: 0.05 * Math.sin(s.T * 0.9), ry: 0.25, rz: 0.05 }, { expr: t < gr ? 'neutro' : 'assustado', boca: t > gr ? 0.9 : undefined });
        ondasNoCapacete(a1, t, t > gr);
        E.cam(0.5, 2.1, lerp(3.2, 2.7, smooth(s.p)), 0, 1.9, 0, 36);
        const kc = seg(t, s.cue('capacete'), s.cue('capacete') + 0.3);
        E.rotulo(a1.cabecaMundo(V(), 1.15), 'AR AQUI DENTRO', { k: kc, dx: 0, dy: -170, bg: '#9fd4ff' });
        E.desenhar((ctx) => { if (t > gr) textoContorno(ctx, '🔊 SÓ VOCÊ OUVE', W / 2, 330, { size: 64, scale: back(seg(t, gr + 0.2, gr + 0.4)), cor: '#ffe135' }); });
      },

      radio(s) {
        const { t } = s;
        orbitaBase(s);
        orbita.add(a1.root, a2.root);
        const rd = s.cue('radio');
        a1.update(s.T, { x: -0.85, y: 0.08 * Math.sin(s.T * 0.9), ry: 0.6, rz: 0.06, rArmFwd: 0.9, rElbow: 1.9, rArmTwist: 0.4 }, { expr: 'sorriso', boca: t > rd ? 0.15 + 0.3 * Math.abs(Math.sin(t * 10)) : undefined });
        a2.update(s.T, { x: 0.9, z: -0.2, y: -0.05 + 0.08 * Math.sin(s.T * 0.8 + 1), ry: -0.6, rz: -0.06 }, { expr: t > rd + 0.6 ? 'feliz' : 'neutro' });
        const ini = a1.antena.getWorldPosition(V());
        const fim = a2.antena.getWorldPosition(V());
        ondasRadio.forEach((o, i) => {
          const f = (t * 0.9 + i / ondasRadio.length) % 1;
          o.visible = t > rd;
          o.position.lerpVectors(ini, fim, f);
          o.rotation.set(0, 0, -Math.PI * 0.3);
          o.scale.setScalar(0.6 + f * 0.8);
          o.material.opacity = Math.sin(Math.PI * f);
        });
        a1.antena.material.emissiveIntensity = a2.antena.material.emissiveIntensity = 2 + 2 * Math.sin(t * 12);
        E.cam(0.2, 2.2, 7.4, 0.05, 1.7, 0, 36);
        E.rotulo(V(0, 2.8, 0), 'ONDAS DE RÁDIO', { k: seg(t, s.cue('ondas'), s.cue('ondas') + 0.3), dx: 0, dy: -190, bg: '#5cff72' });
      },

      encostar(s) {
        const { t } = s;
        orbitaBase(s);
        orbita.add(a1.root, a2.root);
        const en = s.cue('encostam') + 0.3;
        const junta = smooth(seg(t, 0, en));
        a1.update(s.T, { x: lerp(-0.95, -0.66, junta), ry: 0.9, rz: lerp(0.06, 0.12, junta), headZ: -0.15 * junta, lArmOut: 0.9, lElbow: 1.2 }, { expr: 'sorriso', boca: t > en ? 0.15 + 0.3 * Math.abs(Math.sin(t * 10)) : undefined });
        a2.update(s.T, { x: lerp(0.95, 0.66, junta), ry: -0.9, rz: lerp(-0.06, -0.12, junta), headZ: 0.15 * junta, rArmOut: 0.9, rElbow: 1.2 }, { expr: t > en + 0.4 ? 'feliz' : 'sorriso' });
        const ponto = a1.cabecaMundo(V(), 0.5).add(a2.cabecaMundo(V(), 0.5)).multiplyScalar(0.5);
        aneis.forEach((a, i) => {
          const f = (t * 1.5 + i / aneis.length) % 1;
          a.visible = t > en;
          a.position.copy(ponto);
          a.rotation.set(0, 0, 0);
          a.scale.setScalar(0.1 + f * 0.4);
          a.material.opacity = 1 - f;
        });
        E.cam(0.1, 2.1, lerp(5.2, 4.6, smooth(s.p)), 0, 1.8, 0, 36);
        E.rotulo(ponto, 'VIDRO COM VIDRO', { k: seg(t, s.cue('vidro') - 0.2, s.cue('vidro') + 0.1), dx: 0, dy: -380, bg: '#cfe8ff' });
        E.tremer(pulse(t, en, 0.2) * 0.4);
      },

      final(s) {
        const { t } = s;
        orbitaBase(s);
        orbita.add(a1.root);
        a2.root.visible = false;
        const g = s.cue('grito');
        const grita = smooth(seg(t, g - 0.15, g + 0.1));
        a1.update(s.T, { ...misturar('idle', 'bracosAbertos', grita), y: 0.1 * Math.sin(s.T * 0.9), rz: 0.08 * Math.sin(s.T * 0.6), ry: 0.2, headX: -0.15 * grita, lLeg: 0.2, rLeg: -0.15, lKnee: 0.4, rKnee: 0.2 }, { expr: t < g ? 'sorriso' : 'assustado', boca: t > g ? 0.95 : undefined });
        ondasNoCapacete(a1, t, t > g);
        E.cam(0.6, 2.4, lerp(5.0, 7.0, smooth(s.p)), 0, 1.4, 0, 36);
        const cta = seg(t, s.dur - 1.5, s.dur - 1.2);
        if (cta > 0) E.desenhar((ctx) => pilula(ctx, 'SIGA PRA MAIS CURIOSIDADES!', W / 2, 330, back(cta)));
      },
    },
  };
}
