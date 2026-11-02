// Vídeo 2: O que acontece quando você estala os dedos?
import {
  THREE, W, mat, mesh, group, brilho, vidro, seg, smooth, easeOut, easeIn, back, elastic, pulse, lerp, textoContorno, explosao,
} from '../engine.js';
import { Boneco, POSES, misturar } from '../bonequinho.js';
import { xis, check, relogio, trofeu, confete, particulas, RoundedBoxGeometry } from '../props.js';
import { pilula } from './chiclete.js';

const V = () => new THREE.Vector3();

export function criar(E) {
  const cara = new Boneco({ camisa: 0x22c55e, estilo: 'espetado', cabelo: 0x241a16, calca: 0x1e3a8a, fase: 0.5 });
  const doutor = new Boneco({ camisa: 0xffffff, estilo: 'careca', cabelo: 0xeeeeee, oculos: true, bigode: true, calca: 0x6b7280, mangaLonga: true, pele: 0xf3c29d, fase: 0.2 });

  // ---------- estúdio ----------
  const estudio = E.set();
  const enfeites = [[-1.9, 3.6, -4, 0x7c5cff], [2.1, 2.8, -5, 0xff5c8a], [-1.4, 1.0, -6, 0x2dd4bf], [1.8, 4.8, -7, 0xffc94d]].map(([x, y, z, c], i) =>
    mesh(i % 2 ? new THREE.TorusGeometry(0.35, 0.13, 16, 32) : new THREE.OctahedronGeometry(0.42, 0), mat(c, { roughness: 0.35, clearcoat: 0.7 }), { pos: [x, y, z], parent: estudio, sombra: false }));
  enfeites.forEach((m) => (m.userData.y0 = m.position.y));
  const animEnfeites = (T) => enfeites.forEach((m, i) => { m.rotation.set(T * 0.4 + i, T * 0.6 + i * 2, 0); m.position.y = m.userData.y0 + Math.sin(T * 1.3 + i) * 0.15; });
  const alarme = relogio(0xff4d5a);
  alarme.scale.setScalar(0.5);
  estudio.add(alarme);
  const vinteTxt = E.texto3d('20 MIN', { size: 0.24, cor: 0xffd23f });
  const artriteTxt = E.texto3d('ARTRITE?', { size: 0.19, cor: 0xff3b4d });
  estudio.add(vinteTxt, artriteTxt);

  const crackEm = (ctx, pos, t, t0, txt = 'CRACK!', o = {}) => {
    if (t < t0 || t > t0 + 0.5) return;
    const [x, y] = E.projetar(pos);
    explosao(ctx, x + (o.dx ?? 0), y + (o.dy ?? -60), txt, back(seg(t, t0, t0 + 0.14)) * (o.esc ?? 1), { r: 165, size: 78, ...o });
  };

  // ---------- raio X do dedo ----------
  const raiox = E.set();
  const pele = mesh(new THREE.CapsuleGeometry(0.66, 4.4, 12, 32), new THREE.MeshPhysicalMaterial({ color: 0x9fd4ff, transparent: true, opacity: 0.13, roughness: 0.2, clearcoat: 1, depthWrite: false, emissive: 0x1a4a7a, emissiveIntensity: 0.4 }), { rot: [0, 0, Math.PI / 2], parent: raiox, sombra: false });
  const ossoM = mat(0xf6efe0, { roughness: 0.5, clearcoat: 0.3, emissive: 0x8fc2ff, emissiveIntensity: 0.18 });
  const cartM = mat(0xd8f0ff, { roughness: 0.15, clearcoat: 1, emissive: 0x6fb6ff, emissiveIntensity: 0.15 });
  const ossoA = group(raiox);
  mesh(new THREE.CylinderGeometry(0.2, 0.25, 1.9, 32), ossoM, { pos: [-1.25, 0, 0], rot: [0, 0, Math.PI / 2], parent: ossoA });
  mesh(new THREE.SphereGeometry(0.34, 32, 24), ossoM, { pos: [-0.42, 0, 0], scale: [0.85, 1, 1], parent: ossoA });
  mesh(new THREE.SphereGeometry(0.3, 32, 24), cartM, { pos: [-0.33, 0, 0], scale: [0.8, 0.95, 0.95], parent: ossoA });
  mesh(new THREE.SphereGeometry(0.3, 24, 16), ossoM, { pos: [-2.15, 0, 0], parent: ossoA });
  const ossoB = group(raiox);
  mesh(new THREE.CylinderGeometry(0.22, 0.18, 1.8, 32), ossoM, { pos: [1.25, 0, 0], rot: [0, 0, Math.PI / 2], parent: ossoB });
  mesh(new THREE.CylinderGeometry(0.36, 0.26, 0.4, 32), ossoM, { pos: [0.42, 0, 0], rot: [0, 0, Math.PI / 2], parent: ossoB });
  mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.06, 32), cartM, { pos: [0.21, 0, 0], rot: [0, 0, Math.PI / 2], parent: ossoB });
  const rachadura = group(ossoA, [-1.1, 0.05, 0.22]);
  [[0, 0, 0.6], [0.12, -0.08, -0.7], [0.24, 0.0, 0.6]].forEach(([x, y, r]) => mesh(new THREE.BoxGeometry(0.16, 0.025, 0.02), brilho(0xff2a2a, 3), { pos: [x, y, 0], rot: [0, 0, r], parent: rachadura }));
  const bolsa = mesh(new THREE.SphereGeometry(0.66, 40, 28), new THREE.MeshPhysicalMaterial({ color: 0xffe9a8, transparent: true, opacity: 0.25, roughness: 0.1, clearcoat: 1, depthWrite: false, side: THREE.DoubleSide }), { scale: [1.3, 1, 1], parent: raiox, sombra: false });
  const fluido = mesh(new THREE.SphereGeometry(0.5, 40, 28), new THREE.MeshPhysicalMaterial({ color: 0xffd84a, emissive: 0xffb300, emissiveIntensity: 0.35, transparent: true, opacity: 0.38, roughness: 0.1, depthWrite: false }), { scale: [1.15, 0.84, 0.84], parent: raiox, sombra: false });
  const bolhaGas = mesh(new THREE.SphereGeometry(0.24, 40, 28), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0, clearcoat: 1, transparent: true, opacity: 0.6, emissive: 0x9ad8ff, emissiveIntensity: 0.6 }), { parent: raiox, sombra: false });
  const flash = mesh(new THREE.SphereGeometry(0.5, 24, 16), brilho(0xffffff, 6, { transparent: true }), { parent: raiox, sombra: false });
  const onda = mesh(new THREE.TorusGeometry(1, 0.03, 8, 64), brilho(0xbfe6ff, 4, { transparent: true }), { parent: raiox, sombra: false });
  const xA = xis();
  const xB = xis();
  raiox.add(xA, xB);
  const faiscas = particulas(20, brilho(0xffe066, 3), 4);
  raiox.add(faiscas);

  // ---------- consultório ----------
  const consultorio = E.set();
  const quadro = mesh(new RoundedBoxGeometry(1.7, 1.15, 0.08, 3, 0.04), mat(0x7a5230, { roughness: 0.5 }), { pos: [-1.7, 3.7, -2.6], parent: consultorio });
  mesh(new RoundedBoxGeometry(1.45, 0.92, 0.05, 2, 0.02), mat(0xfff8e1), { pos: [0, 0, 0.05], parent: quadro });
  const pedestal = group(consultorio);
  mesh(new RoundedBoxGeometry(0.95, 0.9, 0.95, 4, 0.08), mat(0xffffff, { roughness: 0.3, clearcoat: 0.6 }), { pos: [0, 0.45, 0], parent: pedestal });
  mesh(new RoundedBoxGeometry(1.0, 0.08, 1.0, 2, 0.03), mat(0xffc531, { metalness: 1, roughness: 0.25 }), { pos: [0, 0.9, 0], parent: pedestal });
  const taca = trofeu();
  consultorio.add(taca);
  const checks = [check(), check()];
  consultorio.add(...checks);
  const anel = mesh(new THREE.TorusGeometry(0.24, 0.03, 10, 40), brilho(0x5cff72, 2.5), { parent: consultorio, sombra: false });
  const conf = confete(180, 7);
  consultorio.add(conf);

  return {
    beats: {
      gancho(s) {
        const { t } = s;
        E.show(estudio);
        estudio.add(cara.root);
        E.fundo(0x8b7bff, 0xffe0f0);
        animEnfeites(s.T);
        alarme.visible = vinteTxt.visible = artriteTxt.visible = false;
        const e1 = s.cue('estala');
        const c = s.cue('crack');
        const empurra = easeOut(seg(t, c - 0.08, c + 0.06));
        const volta = smooth(seg(t, c + 0.5, c + 0.9));
        const base = misturar('idle', 'maosJuntas', smooth(seg(t, 0.1, 0.6)));
        const pose = misturar(misturar(base, 'maosEsticadas', empurra), 'maosJuntas', volta * 0.5);
        cara.update(s.T, { ...pose, ry: 0.25, squash: 0.06 * pulse(t, c, 0.25) - 0.04 * pulse(t, e1, 0.2), headX: 0.06 * pulse(t, c, 0.3) }, {
          expr: t < c - 0.1 ? 'orgulhoso' : t < c + 0.35 ? 'dor' : 'aliviado',
        });
        E.tremer(pulse(t, c, 0.35) * 1.1 + pulse(t, e1, 0.15) * 0.3);
        E.cam(1.0, 2.0, lerp(4.9, 4.4, smooth(s.p)), 0.05, 1.62, 0, 36);
        const mao = cara.maoMundo('l', V()).add(cara.maoMundo('r', V())).multiplyScalar(0.5);
        E.desenhar((ctx) => { crackEm(ctx, mao, t, e1, 'CREC', { esc: 0.6, dx: -220, dy: -330 }); crackEm(ctx, mao, t, c, 'CRACK!', { dx: 200, dy: -360 }); });
      },

      osso(s) {
        const { t } = s;
        E.show(raiox);
        E.fundo(0x123a6b, 0x020812, { chao: false });
        E.key.intensity = 1.6;
        E.rim.color.set(0x6fb6ff);
        E.rim.intensity = 3;
        E.gtao.enabled = false;
        const q = s.cue('quebrando');
        const r = s.cue('raspando');
        ossoA.position.set(0, 0, 0);
        const esfrega = t > r && t < r + 0.6 ? Math.sin((t - r) * 40) * 0.07 : 0;
        ossoB.position.set(0, esfrega, 0);
        rachadura.visible = t > q && t < q + 0.8 && Math.floor(t * 14) % 2 === 0;
        bolsa.visible = fluido.visible = bolhaGas.visible = flash.visible = onda.visible = false;
        faiscas.visible = t > r && t < r + 0.7;
        faiscas.update(s.T, { x: 0, y: -0.3, z: 0.2, w: 0.5, d: 0.4, h: 0.8, r: 0.04, vel: 1.5 });
        for (const [x, t0] of [[xA, q + 0.25], [xB, r + 0.25]]) {
          x.visible = t > t0 && t < t0 + 0.75;
          x.scale.setScalar(0.45 * back(seg(t, t0, t0 + 0.2)));
        }
        xA.position.set(-0.75, 0.1, 0.8);
        xB.position.set(0, 0.0, 0.8);
        const ang = -0.5 + s.p * 0.6;
        E.cam(Math.sin(ang) * 4.8, 0.7, Math.cos(ang) * 4.8, -0.1, -0.3, 0, 36);
        E.tremer(pulse(t, q + 0.25, 0.2) * 0.4 + pulse(t, r + 0.25, 0.2) * 0.4);
        E.rotulo(new THREE.Vector3(-1.4, 0.2, 0), 'OSSO', { k: seg(t, 0.2, 0.45), dx: -30, dy: -230, bg: '#e8f4ff' });
        E.rotulo(new THREE.Vector3(1.3, 0.2, 0), 'OSSO', { k: seg(t, 0.35, 0.6), dx: 30, dy: -230, bg: '#e8f4ff' });
      },

      liquido(s) {
        const { t } = s;
        E.show(raiox);
        E.fundo(0x123a6b, 0x020812, { chao: false });
        E.key.intensity = 1.6;
        E.rim.color.set(0x6fb6ff);
        E.rim.intensity = 3;
        E.gtao.enabled = false;
        const kb = smooth(seg(t, s.cue('bolsa'), s.cue('bolsa') + 0.5));
        const kl = smooth(seg(t, s.cue('liquido'), s.cue('liquido') + 0.8));
        ossoA.position.set(0, 0, 0);
        ossoB.position.set(0, 0, 0);
        rachadura.visible = xA.visible = xB.visible = faiscas.visible = false;
        bolsa.visible = kb > 0;
        bolsa.scale.set(1.3 * back(kb), back(kb), back(kb));
        fluido.visible = kl > 0;
        fluido.scale.set(1.15 * kl, 0.84 * kl, 0.84 * kl);
        fluido.material.opacity = 0.38 * kl;
        bolhaGas.visible = flash.visible = onda.visible = false;
        const ang = 0.35 - s.p * 0.5;
        E.cam(Math.sin(ang) * lerp(4.6, 3.9, smooth(s.p)), 0.65, Math.cos(ang) * lerp(4.6, 3.9, smooth(s.p)), 0, -0.25, 0, 36);
        E.rotulo(new THREE.Vector3(0, 0.6, 0.3), 'BOLSA', { k: kb * (1 - seg(t, s.cue('liquido') - 0.2, s.cue('liquido'))), dx: 0, dy: -230, bg: '#ffe9a8' });
        const ks = seg(t, s.cue('sinovial') - 0.3, s.cue('sinovial'));
        E.rotulo(new THREE.Vector3(0.1, 0.3, 0.4), 'LÍQUIDO SINOVIAL', { k: Math.max(ks, seg(t, s.cue('liquido'), s.cue('liquido') + 0.3)), dx: 0, dy: -300, bg: '#ffd84a' });
      },

      bolha(s) {
        const { t } = s;
        E.show(raiox);
        E.fundo(0x123a6b, 0x020812, { chao: false });
        E.key.intensity = 1.6;
        E.rim.color.set(0x6fb6ff);
        E.rim.intensity = 3;
        E.gtao.enabled = false;
        const pu = s.cue('puxa');
        const bo = s.cue('bolha');
        const po = s.cue('pop');
        const abre = easeOut(seg(t, pu, pu + 0.6));
        ossoA.position.set(-0.08 * abre, 0, 0);
        ossoB.position.set(0.3 * abre, 0, 0);
        pele.scale.set(1, 1, 1);
        rachadura.visible = xA.visible = xB.visible = faiscas.visible = false;
        bolsa.visible = fluido.visible = true;
        bolsa.scale.set(1.3 + 0.12 * abre, 1 - 0.06 * abre, 1 - 0.06 * abre);
        fluido.scale.set(1.15 + 0.1 * abre, 0.84 - 0.08 * abre, 0.84 - 0.08 * abre);
        fluido.material.opacity = 0.38;
        const kb = back(seg(t, bo, bo + 0.35));
        bolhaGas.visible = t > bo;
        const vib = t > bo ? 1 + 0.04 * Math.sin(t * 50) : 1;
        bolhaGas.scale.setScalar(Math.max(0.001, kb * vib * (1 + 0.25 * pulse(t, po, 0.3))));
        bolhaGas.position.set(0.08, 0, 0);
        const kp = seg(t, po, po + 0.45);
        flash.visible = t > po && kp < 1;
        flash.scale.setScalar(0.5 + kp * 2.5);
        flash.material.opacity = 1 - kp;
        onda.visible = flash.visible;
        onda.scale.setScalar(0.4 + kp * 2.8);
        onda.material.opacity = 1 - kp;
        onda.rotation.set(0, Math.PI / 2, 0);
        if (t > po) { E.bloom.strength = 1.2 * (1 - kp); E.bloom.threshold = 1.0; }
        E.tremer(pulse(t, po, 0.4) * 1.3 + pulse(t, pu, 0.3) * 0.2);
        const d = lerp(4.4, 3.3, smooth(seg(t, 0, po)));
        const ang = -0.25 + s.p * 0.35;
        E.cam(Math.sin(ang) * d, 0.6, Math.cos(ang) * d, 0.05, -0.22, 0, 36);
        const kpres = seg(t, s.beat.words.find((w) => w.txt.toLowerCase().startsWith('press')).s, s.beat.words.find((w) => w.txt.toLowerCase().startsWith('press')).s + 0.3);
        E.rotulo(new THREE.Vector3(0.1, -0.3, 0.3), 'PRESSÃO CAI ↓', { k: kpres * (1 - seg(t, bo - 0.2, bo)), dx: 0, dy: -300, bg: '#ff8fa3', size: 54 });
        E.rotulo(new THREE.Vector3(0.08, 0.15, 0.2), 'BOLHA DE GÁS', { k: seg(t, bo + 0.2, bo + 0.5) * (1 - seg(t, po - 0.2, po)), dx: 0, dy: -300, bg: '#bfe6ff' });
        E.desenhar((ctx) => {
          if (t < po || t > po + 0.6) return;
          const [x, y] = E.projetar(new THREE.Vector3(0.08, 0, 0));
          explosao(ctx, x, y - 260, 'POP!', back(seg(t, po, po + 0.15)), { r: 200, size: 110, cor: '#ffffff', corTexto: '#2a7bff' });
        });
      },

      vinte(s) {
        const { t } = s;
        E.show(estudio);
        estudio.add(cara.root);
        E.fundo(0x2dd4bf, 0xe8fff9);
        animEnfeites(s.T);
        const v = s.cue('vinte');
        const nv = s.cue('novo');
        const tenta = easeOut(seg(t, nv - 0.1, nv + 0.05)) * (1 - smooth(seg(t, nv + 0.4, nv + 0.8)));
        const pose = misturar(misturar('cintura', 'maosJuntas', smooth(seg(t, nv - 0.5, nv - 0.2))), 'maosEsticadas', tenta);
        cara.update(s.T, { ...pose, x: -0.2, ry: 0.35, rKnee: t < nv - 0.5 ? 0.25 * Math.max(0, Math.sin(t * 9)) : 0, rLeg: t < nv - 0.5 ? 0.15 * Math.max(0, Math.sin(t * 9)) : 0 }, {
          expr: t < nv ? 'desconfiado' : 'bravo', gx: 0.7, gy: 0.4,
        });
        alarme.visible = true;
        artriteTxt.visible = false;
        alarme.position.set(0.9, 2.3 + 0.05 * Math.sin(t * 3), 0.3);
        alarme.rotation.set(0.05, -0.35, 0.06 * Math.sin(t * 25) * (t < v + 0.6 ? 1 : 0.3));
        alarme.ponteiros(t * 9, t * 0.75);
        vinteTxt.visible = t > v;
        vinteTxt.scale.setScalar(Math.max(0.001, elastic(seg(t, v, v + 0.7))));
        vinteTxt.position.set(0.35, 3.45, 0.3);
        vinteTxt.rotation.set(0.1, -0.2 + 0.15 * Math.sin(t * 2), 0);
        E.cam(0.45, 2.3, lerp(7.0, 6.5, smooth(s.p)), 0.32, 2.05, 0, 36);
        const cab = cara.cabecaMundo(V(), 1.2);
        E.desenhar((ctx) => {
          if (t < nv + 0.1) return;
          const [x, y] = E.projetar(cab);
          textoContorno(ctx, '...?', x - 30, y - 60, { size: 110, scale: back(seg(t, nv + 0.1, nv + 0.3)), cor: '#ffffff' });
        });
      },

      artrite(s) {
        const { t } = s;
        E.show(estudio);
        estudio.add(cara.root);
        E.fundo(0x3b2a5c, 0x1a1428, { chaoCor: 0x2a2140 });
        E.key.color.set(0xd6c8ff);
        E.rim.color.set(0xff4d6d);
        E.rim.intensity = 3;
        animEnfeites(s.T);
        const a = s.cue('artrite');
        alarme.visible = vinteTxt.visible = false;
        cara.update(s.T, { ...POSES.encolhido, ry: 0.15, headX: 0.05 }, { expr: t < a ? 'triste' : 'assustado', gy: 0.5 });
        artriteTxt.visible = t > a;
        artriteTxt.scale.setScalar(Math.max(0.001, back(seg(t, a, a + 0.3))));
        artriteTxt.position.set(0, 3.2, 0.3);
        artriteTxt.rotation.set(0.15, 0.1 * Math.sin(t * 2), -0.04);
        E.tremer(pulse(t, a, 0.3) * 0.6);
        E.cam(0.3, 1.3, lerp(6.4, 5.6, smooth(s.p)), 0, 2.1, 0, 36, 0.05);
      },

      medico(s) {
        const { t } = s;
        E.show(consultorio);
        consultorio.add(doutor.root);
        E.fundo(0xc9ecff, 0xf4fbff);
        const se = s.cue('sessenta');
        const es = s.cue('estalou');
        const eq = s.cue('esquerda');
        const levanta = smooth(seg(t, 0.2, 0.7));
        const estalos = [es, es + 0.45, eq];
        const aperta = estalos.reduce((acc, c) => acc + pulse(t, c - 0.05, 0.2), 0);
        doutor.update(s.T, {
          ...misturar('idle', { lArmFwd: 0.3, lArmOut: 2.1, lElbow: 1.0, lArmTwist: -0.4 }, levanta),
          lElbow: lerp(0.2, 1.0, levanta) - 0.25 * aperta, x: -0.35, ry: 0.25, headY: 0.35 * levanta, headX: 0.12 * levanta,
        }, { expr: t < es ? 'sorriso' : 'orgulhoso', gx: 0.7, gy: -0.3 });
        pedestal.visible = taca.visible = false;
        checks.forEach((c) => (c.visible = false));
        conf.visible = false;
        const maoE = doutor.maoMundo('l', V());
        anel.visible = t > eq;
        anel.position.copy(maoE);
        anel.scale.setScalar(back(seg(t, eq, eq + 0.25)) * (1 + 0.08 * Math.sin(t * 8)));
        E.cam(0.6, 2.1, lerp(6.4, 5.8, smooth(s.p)), 0.0, 1.85, 0, 36);
        anel.lookAt(E.camera.position);
        const anos = Math.round(60 * smooth(seg(t, se - 1.2, se + 0.3)));
        E.desenhar((ctx) => {
          const k = back(seg(t, se - 1.3, se - 1.0));
          if (k > 0) {
            textoContorno(ctx, `${anos} ANOS`, W / 2, 330, { size: 150, scale: k * (1 + 0.08 * pulse(t, se + 0.3, 0.3)), cor: anos >= 60 ? '#ffe135' : '#ffffff' });
            textoContorno(ctx, 'ESTALANDO SÓ UMA MÃO', W / 2, 455, { size: 56, scale: k, cor: '#ffffff' });
          }
          estalos.forEach((c) => crackEm(ctx, maoE, t, c, 'CRACK', { esc: 0.6, dx: 150, dy: -40 }));
        });
        E.rotulo(maoE, 'MÃO ESQUERDA', { k: seg(t, eq, eq + 0.3), dx: 120, dy: 250, bg: '#5cff72' });
      },

      resultado(s) {
        const { t } = s;
        E.show(consultorio);
        consultorio.add(doutor.root);
        E.fundo(0xc9ecff, 0xf4fbff);
        const ne = s.cue('nenhuma');
        const ar = s.cue('artrite');
        const pr = s.cue('premio');
        const no = s.cue('nobel');
        const sobe = smooth(seg(t, ne - 0.3, ne + 0.1));
        const festa = smooth(seg(t, no - 0.1, no + 0.2));
        doutor.update(s.T, {
          ...misturar(misturar('idle', { lArmOut: 1.9, lElbow: 0.5, rArmOut: 1.9, rElbow: 0.5 }, sobe * (1 - smooth(seg(t, pr - 0.6, pr - 0.2)))), 'comemorar', festa),
          x: -0.55, ry: 0.2, bob: 0.1 * Math.abs(Math.sin(t * 8)) * festa,
        }, { expr: t < pr ? 'sorriso' : 'feliz', gx: t > pr && t < no ? 0.8 : 0 });
        anel.visible = false;
        const mL = doutor.maoMundo('l', V());
        const mR = doutor.maoMundo('r', V());
        checks.forEach((c, i) => {
          const t0 = i === 0 ? ne : ar;
          const fim = smooth(seg(t, pr - 0.6, pr - 0.2));
          c.visible = t > t0 && fim < 1;
          c.scale.setScalar(Math.max(0.001, 0.32 * back(seg(t, t0, t0 + 0.3)) * (1 - fim)));
          c.position.copy(i === 0 ? mL : mR).add(new THREE.Vector3(0, 0.45, 0.1));
          c.rotation.set(0, 0, 0.1 * Math.sin(t * 4 + i));
        });
        pedestal.visible = taca.visible = t > pr - 0.4;
        const kp = back(seg(t, pr - 0.4, pr));
        pedestal.position.set(0.85, 0, 0.4);
        pedestal.scale.set(1, Math.max(0.001, kp), 1);
        taca.position.set(0.85, 0.92 * kp + 0.15 * pulse(t, no, 0.4), 0.4);
        taca.scale.setScalar(Math.max(0.001, 0.75 * back(seg(t, pr - 0.1, pr + 0.3))));
        taca.rotation.y = -0.4 + (t > no ? (t - no) * 3 : 0);
        conf.update(t - no, new THREE.Vector3(0.3, 2.6, 0.4));
        E.cam(0.35, 2.3, lerp(7.8, 7.2, smooth(s.p)), 0.15, 1.95, 0, 36);
        E.rotulo(new THREE.Vector3(0.85, 2.0, 0.4), 'IG NOBEL', { k: seg(t, no, no + 0.3), dx: 0, dy: -240, bg: '#ffc531' });
      },

      final(s) {
        const { t } = s;
        E.show(estudio);
        estudio.add(cara.root);
        E.fundo(0xffb86b, 0xfff1dc);
        animEnfeites(s.T);
        alarme.visible = vinteTxt.visible = artriteTxt.visible = false;
        const es = s.cue('estalar');
        const dr = s.cue('doer');
        const empurra = easeOut(seg(t, es - 0.08, es + 0.06)) * (1 - smooth(seg(t, es + 0.6, es + 1.0)));
        const pose = misturar(misturar('idle', 'maosJuntas', smooth(seg(t, es - 0.8, es - 0.3)) * (1 - smooth(seg(t, es + 0.6, es + 1.0)))), 'maosEsticadas', empurra);
        const aponta = smooth(seg(t, dr - 0.3, dr));
        cara.update(s.T, { ...misturar(pose, { ...POSES.dedoBalanca, lArmOut: 0.14, lArmFwd: 0, lElbow: 0.2, lArmTwist: 0 }, aponta), rArmTwist: 0.3 + 0.4 * Math.sin(t * 10) * aponta, ry: 0.15 }, {
          expr: t < es ? 'sorriso' : 'feliz', pisca: t > dr && t < dr + 0.7 ? 'L' : undefined,
        });
        E.tremer(pulse(t, es, 0.3) * 0.7);
        E.cam(0.4, 2.0, lerp(4.8, 4.2, smooth(s.p)), 0.05, 1.68, 0, 36);
        const mao = cara.maoMundo('l', V()).add(cara.maoMundo('r', V())).multiplyScalar(0.5);
        const cta = seg(t, s.dur - 1.5, s.dur - 1.2);
        E.desenhar((ctx) => {
          crackEm(ctx, mao, t, es, 'CRACK!', { dx: 200, dy: -360 });
          if (cta > 0) pilula(ctx, 'SIGA PRA MAIS CURIOSIDADES!', W / 2, 330, back(cta));
        });
      },
    },
  };
}
