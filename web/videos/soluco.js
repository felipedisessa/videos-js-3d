// Vídeo 6: Por que a gente soluça?
import {
  THREE, W, mat, mesh, group, brilho, seg, smooth, easeOut, back, pulse, lerp, textoContorno, explosao,
} from '../engine.js';
import { Boneco, POSES, misturar } from '../bonequinho.js';
import { trofeu, confete, particulas, RoundedBoxGeometry } from '../props.js';
import { pilula } from './chiclete.js';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

export function criar(E) {
  const guri = new Boneco({ camisa: 0xa855f7, estilo: 'curto', cabelo: 0x5a3a22, calca: 0x334155, fase: 0.4 });
  const vovo = new Boneco({ camisa: 0x8b5e3c, estilo: 'careca', cabelo: 0xf2f2f2, bigode: true, calca: 0x3f3f46, pele: 0xf3c29d, oculos: true, fase: 0.8 });

  const hicK = (t, cs) => cs.reduce((a, c) => Math.max(a, pulse(t, c - 0.02, 0.28)), 0);
  const hicTxt = (ctx, pos, t, cs, o = {}) => {
    for (const c of cs) {
      if (t < c || t > c + 0.6) continue;
      const [x, y] = E.projetar(pos);
      textoContorno(ctx, 'HIC!', x + (o.dx ?? 210), y + (o.dy ?? -120), { size: o.size ?? 120, scale: back(seg(t, c, c + 0.15)), rot: -0.15, cor: '#ffe135' });
    }
  };

  // ---------- sala ----------
  const sala = E.set();
  [[-2.0, 3.6, -4, 0x22d3ee], [2.2, 2.7, -5, 0xf472b6], [-1.5, 1.0, -6, 0xfacc15], [1.9, 4.8, -7, 0x4ade80]].forEach(([x, y, z, c], i) => {
    const m = mesh(i % 2 ? new THREE.TorusGeometry(0.35, 0.13, 16, 32) : new THREE.IcosahedronGeometry(0.4, 0), mat(c, { roughness: 0.35, clearcoat: 0.7 }), { pos: [x, y, z], parent: sala, sombra: false });
    m.userData.y0 = y;
    m.userData.i = i;
  });
  const enfeites = sala.children.slice();
  const anim = (T) => enfeites.forEach((m) => { const i = m.userData.i; m.rotation.set(T * 0.4 + i, T * 0.6 + i * 2, 0); m.position.y = m.userData.y0 + Math.sin(T * 1.3 + i) * 0.15; });
  const lata = group(guri.braco[1].mao, [0, -0.12, 0.05]);
  mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.3, 24), mat(0xe11d48, { metalness: 0.6, roughness: 0.25 }), { parent: lata });
  mesh(new THREE.CylinderGeometry(0.092, 0.092, 0.08, 24), mat(0xffffff, { roughness: 0.4 }), { parent: lata });
  const lanche = group(guri.braco[0].mao, [0, -0.1, 0.1]);
  [[0xf4a261, 0.06, 0.06], [0x6b3e26, 0.035, 0.0], [0x7cb342, 0.02, -0.035], [0xf4a261, 0.05, -0.07]].forEach(([c, h, y]) => mesh(new THREE.CylinderGeometry(0.15, 0.15, h, 24), mat(c, { roughness: 0.7 }), { pos: [0, y, 0], parent: lanche }));
  lanche.rotation.x = Math.PI / 2;
  const fantasma = group(sala);
  mesh(new THREE.SphereGeometry(0.45, 32, 20), mat(0xffffff, { roughness: 0.3, transparent: true, opacity: 0.92 }), { pos: [0, 0.4, 0], parent: fantasma });
  mesh(new THREE.ConeGeometry(0.45, 0.8, 32, 1, true), mat(0xffffff, { roughness: 0.3, transparent: true, opacity: 0.92, side: THREE.DoubleSide }), { pos: [0, -0.15, 0], rot: [Math.PI, 0, 0], parent: fantasma });
  for (const sx of [1, -1]) mesh(new THREE.SphereGeometry(0.07, 12, 8), mat(0x111111), { pos: [sx * 0.15, 0.5, 0.4], scale: [1, 1.4, 0.6], parent: fantasma });
  mesh(new THREE.SphereGeometry(0.09, 12, 8), mat(0x111111), { pos: [0, 0.28, 0.42], scale: [1, 1.3, 0.5], parent: fantasma });

  // ---------- raio-X do tronco ----------
  const raiox = E.set();
  const pele = mesh(new THREE.CapsuleGeometry(1.25, 1.8, 12, 32), new THREE.MeshPhysicalMaterial({ color: 0x9fd4ff, transparent: true, opacity: 0.12, roughness: 0.2, clearcoat: 1, depthWrite: false, emissive: 0x1a4a7a, emissiveIntensity: 0.4 }), { scale: [1, 1, 0.65], parent: raiox, sombra: false });
  void pele;
  const osso = mat(0xf6efe0, { roughness: 0.5, emissive: 0x8fc2ff, emissiveIntensity: 0.15 });
  for (let i = 0; i < 6; i++) mesh(new THREE.TorusGeometry(1.0 - i * 0.03, 0.035, 8, 40, Math.PI * 1.25), osso, { pos: [0, 1.05 - i * 0.28, -0.05], rot: [Math.PI / 2 + 0.25, 0, -Math.PI * 0.125 + Math.PI], scale: [1, 0.6, 1], parent: raiox });
  mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 10), osso, { pos: [0, 0.4, -0.55], parent: raiox });
  const pulmoes = [1, -1].map((sx) => mesh(new THREE.SphereGeometry(0.55, 32, 24), mat(0xff8fab, { roughness: 0.55, sheen: 0.5, emissive: 0x7a1030, emissiveIntensity: 0.15 }), { pos: [sx * 0.48, 0.55, 0], scale: [0.85, 1.35, 0.7], parent: raiox }));
  mesh(new THREE.CylinderGeometry(0.11, 0.11, 1.5, 16), mat(0xffc2d1, { roughness: 0.4 }), { pos: [0, 1.95, 0], parent: raiox });
  const domo = mesh(new THREE.SphereGeometry(1.05, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.42), mat(0xe2445f, { roughness: 0.5, clearcoat: 0.3, side: THREE.DoubleSide, emissive: 0xff2040, emissiveIntensity: 0 }), { pos: [0, -0.75, 0], scale: [1, 0.8, 0.62], parent: raiox });
  const arIn = particulas(26, brilho(0xbfe6ff, 2.5), 8);
  raiox.add(arIn);

  // ---------- garganta ----------
  const garganta = E.set();
  mesh(new THREE.CylinderGeometry(1.0, 1.0, 9, 40, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xff8fab, roughness: 0.4, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }), { parent: garganta, sombra: false });
  for (let i = 0; i < 6; i++) mesh(new THREE.TorusGeometry(1.0, 0.06, 8, 40), mat(0xffd1dc, { roughness: 0.5 }), { pos: [0, -3.2 + i * 0.35, 0], rot: [Math.PI / 2, 0, 0], parent: garganta });
  const cordas = [1, -1].map((sx) => {
    const piv = group(garganta, [sx * 0.95, 0.4, 0]);
    mesh(new RoundedBoxGeometry(0.95, 0.16, 1.2, 3, 0.07), mat(0xf9a8bd, { roughness: 0.4, clearcoat: 0.6 }), { pos: [-sx * 0.47, 0, 0], parent: piv });
    return { piv, sx };
  });
  const arG = Array.from({ length: 30 }, () => mesh(new THREE.SphereGeometry(0.07, 12, 8), brilho(0xbfe6ff, 2.5), { parent: garganta, sombra: false }));

  // ---------- recorde ----------
  const recordeSet = E.set();
  const taca = trofeu();
  recordeSet.add(taca);
  const conf = confete(160, 21);
  recordeSet.add(conf);
  mesh(new RoundedBoxGeometry(1.6, 1.1, 0.08, 3, 0.04), mat(0x7a5230, { roughness: 0.5 }), { pos: [-1.6, 3.4, -2.6], parent: recordeSet });
  mesh(new RoundedBoxGeometry(1.35, 0.88, 0.05, 2, 0.02), mat(0xfff8e1), { pos: [-1.6, 3.4, -2.55], parent: recordeSet });

  return {
    beats: {
      gancho(s) {
        const { t } = s;
        E.show(sala);
        sala.add(guri.root);
        lata.visible = lanche.visible = fantasma.visible = false;
        E.fundo(0x67e8f9, 0xfef3c7);
        anim(s.T);
        const cs = [s.cue('hic1'), s.cue('hic2')];
        const h = hicK(t, cs);
        guri.update(s.T, { ...misturar('idle', 'maoNaBarriga', smooth(seg(t, cs[0], cs[0] + 0.3))), y: 0.28 * h, squash: -0.08 * h, headX: -0.2 * h, ry: 0.15, lLeg: 0.25 * h, rLeg: 0.25 * h }, { expr: t < cs[0] ? 'neutro' : h > 0.2 ? 'surpreso' : 'confuso', pupila: h > 0.2 ? 0.7 : 1 });
        E.cam(0.5, 2.0, lerp(4.8, 4.3, smooth(s.p)), 0, 1.75, 0, 36);
        E.tremer(h * 0.3);
        const cab = guri.cabecaMundo(V(), 0.7);
        E.desenhar((ctx) => hicTxt(ctx, cab, t, cs));
      },

      diafragma(s) {
        const { t } = s;
        E.show(raiox);
        E.fundo(0x123a6b, 0x020812, { chao: false });
        E.key.intensity = 1.6;
        E.rim.color.set(0x6fb6ff);
        E.rim.intensity = 3;
        E.gtao.enabled = false;
        const resp = 0.5 - 0.5 * Math.cos(t * 2.2);
        domo.position.y = -0.75 - 0.22 * resp;
        domo.scale.set(1, 0.8 - 0.25 * resp, 0.62);
        domo.material.emissiveIntensity = 0.5 * pulse(t, s.cue('diafragma'), 0.8) + 0.25 * smooth(seg(t, s.cue('cupula'), s.cue('cupula') + 0.3));
        pulmoes.forEach((p) => p.scale.set(0.85 + 0.08 * resp, 1.35 + 0.1 * resp, 0.7));
        arIn.visible = true;
        arIn.update(s.T, { x: 0, y: 1.3, z: 0, w: 0.12, d: 0.12, h: 1.5, r: 0.07, vel: 0.6 * (Math.sin(t * 2.2) > 0 ? 1 : 0.1) });
        arIn.rotation.set(Math.PI, 0, 0);
        arIn.position.set(0, 4.0, 0);
        E.cam(0.9, 1.1, lerp(7.6, 7.0, smooth(s.p)), 0, 0.35, 0, 36);
        E.rotulo(V(0.5, 1.1, 0.3), 'PULMÕES', { k: seg(t, s.cue('pulmoes'), s.cue('pulmoes') + 0.3), dx: 120, dy: -230, bg: '#ff8fab' });
        E.rotulo(V(0, -0.5, 0.5), 'DIAFRAGMA', { k: seg(t, s.cue('diafragma'), s.cue('diafragma') + 0.3), dx: 0, dy: 330, bg: '#ff6b81' });
      },

      espasmo(s) {
        const { t } = s;
        E.show(raiox);
        E.fundo(0x123a6b, 0x020812, { chao: false });
        E.key.intensity = 1.6;
        E.rim.color.set(0x6fb6ff);
        E.rim.intensity = 3;
        E.gtao.enabled = false;
        const c = s.cue('contrai');
        const tranco = t < c ? 0 : t < c + 0.08 ? (t - c) / 0.08 : Math.max(0, 1 - (t - c - 0.08) / 1.5);
        domo.position.y = -0.75 - 0.45 * tranco + 0.03 * Math.sin(t * 40) * (t > c && t < c + 0.4 ? 1 : 0);
        domo.scale.set(1.04, 0.8 - 0.45 * tranco, 0.62);
        domo.material.emissiveIntensity = 1.2 * pulse(t, c, 0.6);
        pulmoes.forEach((p) => p.scale.set(0.85 + 0.15 * tranco, 1.35 + 0.18 * tranco, 0.7));
        arIn.visible = t > s.cue('ar') - 0.3;
        arIn.rotation.set(Math.PI, 0, 0);
        arIn.position.set(0, 4.0, 0);
        arIn.update(s.T, { x: 0, y: 1.3, z: 0, w: 0.15, d: 0.15, h: 1.5, r: 0.09, vel: 2.4 });
        E.tremer(pulse(t, c, 0.35) * 1.2);
        E.cam(0.9, 1.1, 7.0, 0, 0.35, 0, 36);
        E.desenhar((ctx) => {
          if (t > c && t < c + 0.7) {
            const [x, y] = E.projetar(V(0, -0.9, 0.5));
            explosao(ctx, x, y + 40, 'TRANCO!', back(seg(t, c, c + 0.15)), { r: 190, size: 76, cor: '#ff6b81', corTexto: '#fff' });
          }
        });
      },

      cordas(s) {
        const { t } = s;
        E.show(garganta);
        E.fundo(0x5a1024, 0x1c050c, { chao: false });
        E.rim.color.set(0xff7b9c);
        E.rim.intensity = 2.5;
        E.gtao.enabled = false;
        const fe = s.cue('fecham');
        const ba = s.cue('barulho') + 0.35;
        const fecha = easeOut(seg(t, fe - 0.1, fe + 0.12)) * (1 - smooth(seg(t, ba + 0.5, ba + 1.0)));
        cordas.forEach(({ piv, sx }) => (piv.rotation.z = sx * lerp(0.75, 0.0, fecha)));
        arG.forEach((b, i) => {
          const f = (i / arG.length + t * 0.9) % 1;
          let y = 3.2 - f * 6.4;
          if (fecha > 0.8 && y < 0.65) y = 0.65 + (i % 6) * 0.12;
          b.position.set(Math.sin(i * 2.3) * 0.45, y, Math.cos(i * 1.7) * 0.45);
        });
        E.cam(0.3, 3.0, 3.6, 0, 0.3, 0, 40);
        E.tremer(pulse(t, fe, 0.3) * 0.5 + pulse(t, ba, 0.4) * 1.0);
        E.rotulo(V(-0.6, 0.45, 0.4), 'CORDAS VOCAIS', { k: seg(t, 1.0, 1.3), dx: 180, dy: -330, bg: '#f9a8bd' });
        E.desenhar((ctx) => {
          if (t > ba && t < ba + 0.8) {
            const [x, y] = E.projetar(V(0, 0.4, 0));
            explosao(ctx, x, y - 120, 'HIC!', back(seg(t, ba, ba + 0.15)), { r: 210, size: 120 });
          }
        });
      },

      causas(s) {
        const { t } = s;
        E.show(sala);
        sala.add(guri.root);
        E.fundo(0xfda4af, 0xfff1f2);
        anim(s.T);
        const rf = s.cue('refri');
        const su = s.cue('susto');
        const fim = s.falaFim;
        const come = t < rf - 0.2;
        lanche.visible = come;
        lata.visible = t >= rf - 0.2 && t < su;
        fantasma.visible = t > su - 0.15;
        const kf = back(seg(t, su - 0.15, su + 0.1));
        fantasma.position.set(1.0, 1.6 + 0.1 * Math.sin(t * 4), -0.6);
        fantasma.scale.setScalar(Math.max(0.001, kf));
        const h = hicK(t, [fim]);
        const pulo = pulse(t, su, 0.35);
        const pose = come ? { lArmFwd: 1.0, lArmOut: 0.05, lElbow: 2.2, lArmTwist: -0.4 } : t < su ? { rArmFwd: 1.0, rArmOut: 0.05, rElbow: 2.3, rArmTwist: 0.4, headX: -0.25 } : POSES.maosRosto;
        guri.update(s.T, { ...pose, y: 0.35 * pulo + 0.25 * h, squash: -0.08 * h, ry: -0.2 }, {
          expr: come ? 'mastigando' : t < su ? 'sorriso' : 'assustado', boca: come ? 0.12 + 0.2 * Math.abs(Math.sin(t * 11)) : undefined, fechado: !come && t < su,
        });
        E.cam(0.3, 2.0, 5.0, 0.2, 1.8, 0, 36);
        E.tremer(pulo * 0.6 + h * 0.3);
        const cab = guri.cabecaMundo(V(), 0.7);
        E.desenhar((ctx) => {
          hicTxt(ctx, cab, t, [fim]);
          const itens = [['COMER RÁPIDO', 0.2], ['REFRIGERANTE', rf], ['SUSTO', su]];
          itens.forEach(([txt, t0], i) => { if (t > t0) textoContorno(ctx, txt, W / 2, 230 + i * 90, { size: 62, scale: back(seg(t, t0, t0 + 0.2)), cor: i === 2 ? '#ffe135' : '#ffffff' }); });
        });
      },

      recorde(s) {
        const { t } = s;
        E.show(recordeSet);
        recordeSet.add(vovo.root);
        E.fundo(0xfde68a, 0xfff7ed);
        const an = s.cue('anos');
        const mi = s.cue('milhoes');
        const re = s.cue('recorde');
        const cs = [0.6, 1.6, 2.6, 3.6, 4.7, 5.7, 6.7, 7.6].filter((c) => c < re);
        const h = hicK(t, cs);
        const festa = smooth(seg(t, re, re + 0.3));
        vovo.update(s.T, { ...misturar('idle', 'comemorar', festa), x: -0.45, y: 0.18 * h, squash: -0.06 * h, headX: -0.15 * h, ry: 0.25, bob: 0.08 * Math.abs(Math.sin(t * 8)) * festa }, { expr: festa > 0.5 ? 'feliz' : h > 0.2 ? 'surpreso' : 'desconfiado' });
        taca.visible = t > re - 0.2;
        taca.position.set(0.9, 0, 0.4);
        taca.scale.setScalar(Math.max(0.001, 0.8 * back(seg(t, re - 0.2, re + 0.2))));
        taca.rotation.y = -0.4 + (t > re ? (t - re) * 2 : 0);
        conf.update(t - re, V(0.2, 2.8, 0.4));
        E.cam(0.4, 2.1, lerp(6.6, 6.0, smooth(s.p)), 0.2, 1.8, 0, 36);
        const ano = Math.round(lerp(1922, 1990, smooth(seg(t, an - 1.2, an + 0.3))));
        const cab = vovo.cabecaMundo(V(), 0.7);
        E.desenhar((ctx) => {
          hicTxt(ctx, cab, t, cs, { size: 80, dx: 170, dy: -60 });
          const k = back(seg(t, an - 1.3, an - 1.0));
          if (k > 0.01) textoContorno(ctx, `1922 → ${ano}`, W / 2, 240, { size: 96, scale: k, cor: ano >= 1990 ? '#ffe135' : '#ffffff' });
          if (t > an + 0.2) textoContorno(ctx, '68 ANOS SOLUÇANDO', W / 2, 350, { size: 66, scale: back(seg(t, an + 0.2, an + 0.45)), cor: '#ffffff' });
          if (t > mi - 0.2) {
            const n = Math.round(430 * smooth(seg(t, mi - 0.2, mi + 0.8)));
            textoContorno(ctx, `≈ ${n} MILHÕES DE HICs`, W / 2, 450, { size: 60, scale: back(seg(t, mi - 0.2, mi + 0.05)), cor: '#ff8fab' });
          }
        });
        E.rotulo(V(0.9, 1.9, 0.4), 'RECORDE MUNDIAL', { k: seg(t, re, re + 0.3), dx: 0, dy: -200, bg: '#ffc531' });
      },

      final(s) {
        const { t } = s;
        E.show(sala);
        sala.add(guri.root);
        lata.visible = lanche.visible = fantasma.visible = false;
        E.fundo(0x86efac, 0xf0fdf4);
        anim(s.T);
        const hc = s.cue('hic');
        const h = hicK(t, [hc]);
        const alivio = smooth(seg(t, 0.3, 0.8));
        guri.update(s.T, { ...misturar('idle', 'bracosAbertos', alivio * (1 - smooth(seg(t, hc - 0.1, hc + 0.1)))), y: 0.16 * h, squash: -0.08 * h, headX: -0.2 * h, ry: 0.1 }, { expr: t < hc ? 'aliviado' : 'surpreso', pupila: t > hc ? 0.7 : 1 });
        E.cam(0.4, 2.0, lerp(4.8, 4.3, smooth(s.p)), 0, 1.75, 0, 36);
        E.tremer(h * 0.3);
        const cab = guri.cabecaMundo(V(), 0.7);
        const cta = seg(t, s.dur - 1.5, s.dur - 1.2);
        E.desenhar((ctx) => {
          hicTxt(ctx, cab, t, [hc]);
          if (cta > 0) pilula(ctx, 'SIGA PRA MAIS CURIOSIDADES!', W / 2, 330, back(cta));
        });
      },
    },
  };
}
