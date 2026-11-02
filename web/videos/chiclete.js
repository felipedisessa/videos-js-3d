// Vídeo 1: O que acontece se você engolir chiclete?
import {
  THREE, W, H, mat, mesh, group, brilho, seg, smooth, easeOut, easeIn, back, elastic, pulse, wob, lerp, clamp01,
  textoContorno, explosao,
} from '../engine.js';
import { Boneco, POSES, misturar } from '../bonequinho.js';
import { bolinha, placaAviso, particulas, RoundedBoxGeometry } from '../props.js';

const V = () => new THREE.Vector3();

export function criar(E) {
  const kid = new Boneco({ camisa: 0xff5a36, estilo: 'curto' });
  const mae = new Boneco({ camisa: 0x9b5cff, estilo: 'coque', cabelo: 0x5a2d1a, calca: 0x334155, fase: 0.9 });
  const tmp = V();
  const tmp2 = V();

  // ---------- quarto: gancho / muitos / final ----------
  const quarto = E.set();
  const bolha = mesh(new THREE.SphereGeometry(1, 40, 30), mat(0xff7ab8, { roughness: 0.12, clearcoat: 1, transparent: true, opacity: 0.9 }), { parent: quarto });
  const voando = [0xff6fae, 0x5cc8ff, 0x7cff6b].map((c) => mesh(new THREE.SphereGeometry(0.12, 24, 16), mat(c, { roughness: 0.4, clearcoat: 0.6 }), { parent: quarto }));
  // formas flutuando no fundo (dá profundidade)
  const enfeites = [];
  [[-2.2, 3.4, -4, 0xffd166], [2.4, 2.6, -5, 0x9b8cff], [-1.6, 0.9, -6, 0x5cc8ff], [2.0, 4.6, -7, 0xff8fab]].forEach(([x, y, z, c], i) => {
    const m = mesh(i % 2 ? new THREE.TorusGeometry(0.35, 0.13, 16, 32) : new THREE.IcosahedronGeometry(0.4, 0), mat(c, { roughness: 0.35, clearcoat: 0.7 }), { pos: [x, y, z], parent: quarto, sombra: false });
    enfeites.push(m);
  });
  enfeites.forEach((m) => (m.userData.y0 = m.position.y));
  const animEnfeites = (T) => enfeites.forEach((m, i) => { m.rotation.set(T * 0.4 + i, T * 0.6 + i * 2, 0); m.position.y = m.userData.y0 + Math.sin(T * 1.3 + i) * 0.15; });

  function mastigar(t, vel = 20) { return 0.12 + 0.2 * Math.abs(Math.sin(t * vel * 0.5)); }

  // ---------- sala: avisada / mito ----------
  const sala = E.set();
  const seteAnos = E.texto3d('7 ANOS', { size: 0.33, cor: 0xffd23f });
  const mitoTxt = E.texto3d('MITO', { size: 0.47, depth: 0.2, cor: 0xff2d3d, bevel: 0.03 });
  sala.add(seteAnos, mitoTxt);
  const quadro = mesh(new RoundedBoxGeometry(1.5, 1.0, 0.08, 3, 0.04), mat(0xffffff, { roughness: 0.6 }), { pos: [1.9, 2.6, -2.2], parent: sala });
  mesh(new RoundedBoxGeometry(1.25, 0.78, 0.05, 2, 0.02), mat(0x7cc6ff), { pos: [0, 0, 0.04], parent: quadro });
  mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.6, 32), mat(0x6ad48a, { roughness: 0.7 }), { pos: [-2.4, 0.8, -2.5], parent: sala });
  mesh(new THREE.SphereGeometry(0.75, 24, 16), mat(0x3fa864, { roughness: 0.8 }), { pos: [-2.4, 2.0, -2.5], parent: sala });

  // ---------- estômago ----------
  const estomagoSet = E.set();
  const corte = [new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.0)];
  const geoEst = (() => {
    const g = new THREE.SphereGeometry(1, 80, 60);
    const p = g.attributes.position;
    const v = V();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      let x = v.x * 1.05;
      const y = v.y * 1.45;
      let z = v.z * 0.82;
      const k = y > 0 ? 1 - 0.4 * (y / 1.45) : 1 + 0.06 * (-y / 1.45);
      x *= k;
      z *= k;
      x += (0.42 * (y * y)) / 1.45 - 0.3;
      p.setXYZ(i, x, y, z);
    }
    g.computeVertexNormals();
    return g;
  })();
  const estomago = group(estomagoSet);
  estomago.rotation.z = 0.32;
  const paredeFora = mat(0xff8fa3, { roughness: 0.38, clearcoat: 0.7, clippingPlanes: corte, side: THREE.FrontSide });
  const paredeDentro = mat(0xc23a58, { roughness: 0.65, clippingPlanes: corte, side: THREE.BackSide });
  mesh(geoEst, paredeFora, { parent: estomago });
  mesh(geoEst, paredeDentro, { parent: estomago });
  for (const [geo, pos, rot] of [
    [new THREE.CylinderGeometry(0.22, 0.26, 1.4, 28, 1, true), [0.28, 2.0, 0], [0, 0, 0.12]],
    [new THREE.CylinderGeometry(0.2, 0.24, 1.2, 28, 1, true), [0.75, -1.25, 0], [0, 0, 1.25]],
  ]) {
    mesh(geo, paredeFora, { pos, rot, parent: estomago });
    mesh(geo, paredeDentro, { pos, rot, parent: estomago });
  }
  // dobras internas
  for (let i = 0; i < 0; i++) {
    const y = -1.1 + i * 0.32;
    mesh(new THREE.TorusGeometry(0.5 + 0.25 * Math.cos(i * 0.5), 0.035, 8, 40, Math.PI), mat(0xa52a48, { roughness: 0.7, clippingPlanes: corte }), { pos: [(0.42 * (y * y)) / 1.45 - 0.3, y, -0.15], rot: [0, 0, Math.PI], scale: [1, 0.35, 1], parent: estomago });
  }
  const POCA = new THREE.Vector3(0.27, -0.92, -0.05);
  const acidoM = new THREE.MeshPhysicalMaterial({ color: 0x8dff4f, emissive: 0x3bbd12, emissiveIntensity: 0.55, roughness: 0.1, clearcoat: 1, transparent: true, opacity: 0.7, clippingPlanes: corte, side: THREE.DoubleSide, depthWrite: false });
  mesh(new THREE.SphereGeometry(1, 48, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), acidoM, { pos: POCA.toArray(), scale: [0.82, 0.4, 0.52], parent: estomagoSet, sombra: false });
  mesh(new THREE.CircleGeometry(1, 48), acidoM, { pos: POCA.toArray(), rot: [-Math.PI / 2, 0, 0], scale: [0.82, 0.52, 1], parent: estomagoSet, sombra: false });
  const bolhasAcido = particulas(26, brilho(0xd8ffb0, 1.4), 9);
  estomagoSet.add(bolhasAcido);
  const comidas = [
    [new RoundedBoxGeometry(0.2, 0.16, 0.18, 2, 0.04), 0xffd166, [-0.32, 0.02, -0.1]],
    [new THREE.SphereGeometry(0.11, 16, 12), 0xff4d4d, [0.38, 0.04, -0.22]],
    [new THREE.CylinderGeometry(0.06, 0.06, 0.26, 12), 0x8ac926, [0.05, 0.03, -0.3]],
    [new RoundedBoxGeometry(0.15, 0.15, 0.15, 2, 0.03), 0xff9f1c, [-0.5, 0.0, -0.3]],
    [new THREE.SphereGeometry(0.09, 16, 12), 0xffe8a3, [0.55, 0.02, -0.05]],
  ].map(([geo, c, p], i) => {
    const m = mesh(geo, mat(c, { roughness: 0.6 }), { parent: estomagoSet });
    m.userData.base = new THREE.Vector3(...p).add(POCA);
    m.userData.i = i;
    return m;
  });
  const gomaEst = bolinha(0xff6fae, 0.24, 2);
  estomagoSet.add(gomaEst);
  const luzAcido = new THREE.PointLight(0x9dff5a, 3, 3, 1.5);
  luzAcido.position.copy(POCA).add(new THREE.Vector3(0, 0.3, 0.2));
  estomagoSet.add(luzAcido);

  // ---------- intestino ----------
  const intestinoSet = E.set();
  const pts = [];
  for (let r = 0; r < 6; r++) {
    const z = 2.6 - r * 1.3;
    const d = r % 2 ? -1 : 1;
    for (let k = 0; k <= 6; k++) pts.push(new THREE.Vector3(d * (-2.4 + k * 0.8), 0.06 * Math.sin(k * 1.7 + r), z));
    if (r < 5) pts.push(new THREE.Vector3(d * 3.05, 0, z - 0.65));
  }
  const curva = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const RT = 0.32;
  const tuboM = new THREE.MeshPhysicalMaterial({ color: 0xff7f9c, roughness: 0.28, clearcoat: 0.9, transparent: true, opacity: 0.3, depthWrite: false, side: THREE.FrontSide });
  const tubo = mesh(new THREE.TubeGeometry(curva, 900, RT, 24, false), tuboM, { parent: intestinoSet, sombra: false });
  tubo.position.y = RT + 0.02;
  const veias = mesh(new THREE.TubeGeometry(curva, 900, RT * 0.18, 8, false), mat(0xd9476a, { roughness: 0.6 }), { parent: intestinoSet });
  veias.position.y = 0.06;
  const aneis = [0, 1, 2].map(() => mesh(new THREE.TorusGeometry(RT + 0.015, 0.06, 12, 32), mat(0xe0577a, { roughness: 0.5, clearcoat: 0.4 }), { parent: intestinoSet }));
  const gomaInt = bolinha(0xff6fae, 0.22, 3);
  intestinoSet.add(gomaInt);
  const bolaGrande = bolinha(0xff5fa2, 0.5, 4);
  intestinoSet.add(bolaGrande);
  const bojo = mesh(new THREE.SphereGeometry(1, 36, 24), new THREE.MeshPhysicalMaterial({ color: 0xff7f9c, roughness: 0.3, clearcoat: 0.9, transparent: true, opacity: 0.38, depthWrite: false }), { parent: intestinoSet, sombra: false });
  const pequenas = Array.from({ length: 12 }, (_, i) => {
    const b = bolinha([0xff6fae, 0x5cc8ff, 0x7cff6b, 0xffd23f][i % 4], 0.14, 10 + i);
    intestinoSet.add(b);
    return b;
  });
  const aviso = placaAviso(E);
  intestinoSet.add(aviso);
  const naCurva = (u, alvo) => curva.getPointAt(THREE.MathUtils.clamp(u, 0, 1), alvo).add(new THREE.Vector3(0, RT + 0.02, 0));

  function posicionarAnel(anel, u, aperto) {
    const p = naCurva(u, tmp);
    const tg = curva.getTangentAt(THREE.MathUtils.clamp(u, 0, 1), tmp2);
    anel.position.copy(p);
    anel.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tg);
    anel.scale.setScalar(1 - 0.32 * aperto);
  }

  // ---------- banheiro ----------
  const banheiro = E.set();
  const azulejo = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const x = c.getContext('2d');
    x.fillStyle = '#b9dff2';
    x.fillRect(0, 0, 256, 256);
    x.fillStyle = '#f4fbff';
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) x.fillRect(i * 128 + 5, j * 128 + 5, 118, 118);
    const tx = new THREE.CanvasTexture(c);
    tx.colorSpace = THREE.SRGBColorSpace;
    tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
    tx.repeat.set(8, 6);
    return tx;
  })();
  mesh(new THREE.PlaneGeometry(14, 10), new THREE.MeshStandardMaterial({ map: azulejo, roughness: 0.3 }), { pos: [0, 4.2, -1.0], parent: banheiro, sombra: false });
  const porc = mat(0xffffff, { roughness: 0.16, clearcoat: 1 });
  const vaso = group(banheiro);
  const perfil = [[0, 0], [0.3, 0], [0.32, 0.05], [0.25, 0.2], [0.24, 0.4], [0.4, 0.62], [0.48, 0.74], [0.46, 0.79], [0, 0.79]].map(([a, b]) => new THREE.Vector2(a, b));
  mesh(new THREE.LatheGeometry(perfil, 56), porc, { scale: [1, 1, 1.22], parent: vaso });
  mesh(new THREE.TorusGeometry(0.4, 0.065, 14, 48), porc, { pos: [0, 0.8, 0], rot: [-Math.PI / 2, 0, 0], scale: [1, 1.22, 1], parent: vaso });
  const agua = mesh(new THREE.CircleGeometry(0.36, 40), mat(0x6fcaff, { roughness: 0.05, clearcoat: 1 }), { pos: [0, 0.74, 0], rot: [-Math.PI / 2, 0, 0], scale: [1, 1.2, 1], parent: vaso });
  mesh(new RoundedBoxGeometry(0.95, 0.85, 0.32, 3, 0.06), porc, { pos: [0, 1.15, -0.66], parent: vaso });
  mesh(new RoundedBoxGeometry(1.02, 0.08, 0.38, 2, 0.03), porc, { pos: [0, 1.6, -0.66], parent: vaso });
  mesh(new RoundedBoxGeometry(0.85, 0.95, 0.06, 3, 0.03), porc, { pos: [0, 1.22, -0.46], rot: [-0.1, 0, 0], parent: vaso });
  mesh(new RoundedBoxGeometry(0.34, 0.5, 0.3, 2, 0.05), porc, { pos: [0, 0.5, -0.36], parent: vaso });
  const alavanca = mesh(new THREE.CapsuleGeometry(0.03, 0.18, 4, 8), mat(0xc9d1d9, { metalness: 0.9, roughness: 0.2 }), { pos: [0.42, 1.42, -0.48], rot: [0, 0, Math.PI / 2], parent: vaso });
  const papel = group(banheiro, [-1.15, 1.0, -0.82]);
  mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.22, 24), mat(0xffffff, { roughness: 0.9 }), { rot: [0, 0, Math.PI / 2], parent: papel });
  mesh(new THREE.CapsuleGeometry(0.02, 0.3, 4, 8), mat(0xc9d1d9, { metalness: 0.9, roughness: 0.2 }), { rot: [0, 0, Math.PI / 2], parent: papel });
  const diasTxt = E.texto3d('2-3 DIAS', { size: 0.25, cor: 0x46d9ff });
  banheiro.add(diasTxt);
  const gotas = particulas(18, mat(0x8fd8ff, { roughness: 0.05, clearcoat: 1 }), 21);
  banheiro.add(gotas);

  const popTxt = (ctx, pos, txt, k, o = {}) => {
    const [x, y] = E.projetar(pos);
    explosao(ctx, x + (o.dx ?? 0), y + (o.dy ?? 0), txt, back(k), o);
  };

  return {
    beats: {
      gancho(s) {
        const { t } = s;
        E.show(quarto);
        quarto.add(kid.root);
        E.fundo(0x6cc6ff, 0xffe6c7);
        animEnfeites(s.T);
        const est = s.cue('estoura');
        const eng = s.cue('engole');
        const cresce = smooth(seg(t, 0.7, est));
        const gole = pulse(t, eng, 0.5);
        kid.update(s.T, {
          ...misturar('idle', 'maoNaBarriga', smooth(seg(t, eng, eng + 0.25))),
          ry: 0.12, headX: 0.28 * gole - 0.06 * cresce, headZ: 0.04 * Math.sin(t * 2.2), squash: 0.05 * gole,
        }, {
          expr: t < 0.7 ? 'mastigando' : t < est ? 'surpreso' : t < eng ? 'surpreso' : 'assustado',
          boca: t < 0.7 ? mastigar(t) : undefined, gy: t > 0.7 && t < est ? -0.8 : 0, pupila: t > eng ? 0.7 : 1,
        });
        const boca = kid.bocaMundo(tmp);
        const r = 0.04 + 0.42 * cresce * (1 + 0.03 * Math.sin(t * 30));
        bolha.visible = t > 0.7 && t < est;
        bolha.scale.setScalar(r);
        bolha.position.copy(boca).add(new THREE.Vector3(Math.sin(0.12), 0, Math.cos(0.12)).multiplyScalar(r * 0.92));
        voando.forEach((v) => (v.visible = false));
        E.tremer(pulse(t, est, 0.3) * 0.8);
        E.cam(0.4, 2.1, lerp(4.5, 3.9, smooth(s.p)), 0, 1.72, 0, 36);
        const pBoca = boca.clone();
        E.desenhar((ctx) => {
          if (t >= est && t < est + 0.45) popTxt(ctx, pBoca, 'POP!', seg(t, est, est + 0.15), { dy: -40, r: 170, cor: '#ff7ab8', corTexto: '#fff' });
          if (t >= eng && t < eng + 0.75) {
            const [x, y] = E.projetar(pBoca);
            textoContorno(ctx, 'GULP!', x + 230, y - 300, { size: 120, scale: back(seg(t, eng, eng + 0.18)), rot: -0.15, cor: '#ffe135' });
          }
        });
      },

      avisada(s) {
        const { t } = s;
        E.show(sala);
        sala.add(kid.root, mae.root);
        E.fundo(0x9fe0ff, 0xffeedd);
        const sete = s.cue('sete');
        const fala = t > 0.15 && t < s.falaFim;
        mae.update(s.T, {
          ...POSES.dedoBalanca, rArmTwist: 0.25 + 0.4 * Math.sin(t * 10), x: -0.8, z: 0.1, ry: 0.5, s: 1.12,
          spineZ: 0.04 * Math.sin(t * 5), headZ: 0.07 * Math.sin(t * 5), spineX: 0.06,
        }, { expr: 'bravo', boca: fala ? 0.12 + 0.35 * Math.abs(Math.sin(t * 11)) : 0 });
        const susto = smooth(seg(t, sete, sete + 0.3));
        kid.update(s.T, { ...misturar('idle', 'maosRosto', susto), x: 0.85, z: 0.2, ry: -0.45, s: 0.9, squash: 0.06 * pulse(t, sete, 0.3) }, { expr: t < sete ? 'neutro' : 'assustado', gx: -0.6 });
        mitoTxt.visible = false;
        seteAnos.visible = t > sete;
        const k = elastic(seg(t, sete, sete + 0.7));
        seteAnos.scale.setScalar(Math.max(0.001, k));
        seteAnos.position.set(0, 3.45, 0.3);
        seteAnos.rotation.set(0.1, 0.25 * Math.sin(t * 2.4), 0.05 * Math.sin(t * 3));
        E.cam(0, 2.3, lerp(8.2, 7.3, smooth(s.p)), 0, 1.9, 0, 36);
      },

      mito(s) {
        const { t } = s;
        E.show(sala);
        sala.add(kid.root, mae.root);
        E.fundo(0x9fe0ff, 0xffeedd);
        const m = s.cue('mito');
        const depois = smooth(seg(t, m + 0.05, m + 0.35));
        mae.update(s.T, { ...misturar('dedoBalanca', 'idle', depois), x: -0.8, z: 0.1, ry: 0.5, s: 1.12 }, { expr: t < m ? 'bravo' : 'surpreso', gy: 0.6 });
        kid.update(s.T, { ...misturar('maosRosto', 'comemorar', depois), x: 0.85, z: 0.2, ry: -0.35, s: 0.9, bob: 0.12 * Math.abs(Math.sin(t * 9)) * depois }, { expr: t < m ? 'assustado' : 'feliz' });
        // "7 ANOS" é arremessado no impacto
        const voo = Math.max(0, t - m);
        seteAnos.visible = true;
        seteAnos.scale.setScalar(1);
        seteAnos.position.set(voo * 5, 3.45 + voo * 3 - voo * voo * 9, 0.3 + voo * 2);
        seteAnos.rotation.set(0.1 + voo * 6, voo * 4, voo * 7);
        // carimbo MITO
        mitoTxt.visible = t > m - 0.2;
        const queda = easeIn(seg(t, m - 0.2, m));
        const assenta = seg(t, m, m + 0.5);
        mitoTxt.position.set(0, lerp(7.5, 3.0, queda), 0.6);
        mitoTxt.rotation.set(0.12, 0, lerp(-0.35, -0.08, elastic(assenta)));
        const sq = t > m ? 1 - 0.35 * (1 - elastic(assenta)) : 1;
        mitoTxt.scale.set(1 / Math.sqrt(sq), sq, 1);
        E.tremer(pulse(t, m, 0.4) * 1.4);
        E.cam(0.2, 2.4, 7.0, 0, 2.05, 0, 36, 0.04 * depois);
        if (t > m && t < m + 0.08) E.tint = 'rgba(255,255,255,0.35)';
      },

      estomago(s) {
        const { t } = s;
        E.show(estomagoSet);
        E.fundo(0x7a1730, 0x2a0610, { chao: false });
        E.rim.color.set(0xff6b8b);
        E.rim.intensity = 2.2;
        bolhasAcido.update(s.T, { x: POCA.x, y: POCA.y - 0.05, z: POCA.z - 0.2, w: 1.2, d: 0.5, h: 0.55, r: 0.06, vel: 0.45 });
        comidas.forEach((c) => {
          c.visible = true;
          c.scale.setScalar(1);
          c.position.copy(c.userData.base).add(new THREE.Vector3(0, 0.03 * Math.sin(s.T * 2 + c.userData.i), 0));
          c.rotation.set(s.T * 0.3 + c.userData.i, s.T * 0.2, 0);
        });
        gomaEst.position.copy(POCA).add(new THREE.Vector3(0.05, 0.08 + 0.03 * Math.sin(s.T * 2.2), 0.05));
        gomaEst.rotation.set(0, -0.2 + 0.2 * Math.sin(s.T), 0.1 * Math.sin(s.T * 1.7));
        gomaEst.rosto('feliz', 0, 0.3);
        E.cam(0.5, 0.5, lerp(8.0, 7.2, smooth(s.p)), 0.25, 0.25, 0, 36);
        E.rotulo(new THREE.Vector3(-0.7, 0.6, 0.3), 'ESTÔMAGO', { k: seg(t, 0.25, 0.55), dx: 40, dy: -330, bg: '#ff8fa3' });
        const kg = seg(t, s.beat.words.find((w) => w.txt.toLowerCase().startsWith('goma')).s, s.beat.words.find((w) => w.txt.toLowerCase().startsWith('goma')).s + 0.3);
        E.rotulo(gomaEst.position.clone().add(new THREE.Vector3(0, 0.2, 0.1)), 'CHICLETE', { k: kg, dx: 150, dy: -230, bg: '#ff6fae', cor: '#fff' });
      },

      acido(s) {
        const { t } = s;
        E.show(estomagoSet);
        E.fundo(0x7a1730, 0x2a0610, { chao: false });
        E.rim.color.set(0xff6b8b);
        E.rim.intensity = 2.2;
        const ini = s.cue('inteiro');
        bolhasAcido.update(s.T, { x: POCA.x, y: POCA.y - 0.05, z: POCA.z - 0.2, w: 1.2, d: 0.5, h: 0.55, r: 0.07, vel: 0.7 });
        comidas.forEach((c) => {
          const i = c.userData.i;
          const k = 1 - smooth(seg(t, 0.4 + i * 0.22, 1.9 + i * 0.25));
          c.visible = k > 0.01;
          c.scale.setScalar(Math.max(0.001, k) * (1 + 0.08 * Math.sin(s.T * 20 + i)));
          c.position.copy(c.userData.base).add(new THREE.Vector3(0, 0.03 * Math.sin(s.T * 2 + i) - (1 - k) * 0.08, 0));
          c.rotation.set(s.T * 0.6 + i, s.T * 0.4, 0);
        });
        gomaEst.position.copy(POCA).add(new THREE.Vector3(0.05, 0.08 + 0.03 * Math.sin(s.T * 2.2), 0.05));
        gomaEst.rotation.set(0, -0.15 + 0.15 * Math.sin(s.T), 0);
        gomaEst.rosto(t > ini ? 'orgulhoso' : 'feliz', t > ini ? 0 : -0.6, 0.2);
        E.cam(POCA.x + 0.55, POCA.y + 0.75, lerp(2.7, 2.3, smooth(s.p)), POCA.x + 0.05, POCA.y + 0.12, 0, 36);
        E.rotulo(POCA.clone().add(new THREE.Vector3(-0.55, 0.02, 0.1)), 'ÁCIDO', { k: seg(t, 0.15, 0.45), dx: -40, dy: 260, bg: '#8dff4f' });
        const pg = gomaEst.position.clone();
        E.desenhar((ctx) => {
          if (t < ini) return;
          const [x, y] = E.projetar(pg);
          const k = back(seg(t, ini, ini + 0.25));
          for (let i = 0; i < 4; i++) {
            const a = i * 1.7 + 0.4;
            const rr = 190 + 30 * Math.sin(s.T * 6 + i);
            estrela(ctx, x + Math.cos(a) * rr, y - 40 + Math.sin(a) * rr * 0.8, 34 * k * (0.8 + 0.3 * Math.sin(s.T * 9 + i)));
          }
        });
      },

      intestino(s) {
        const { t } = s;
        E.show(intestinoSet);
        E.fundo(0x5a1024, 0x1c050c, { chaoCor: 0x6b1a30, near: 6, far: 16, neblina: 0x2a0812 });
        E.rim.color.set(0xff7b9c);
        E.rim.intensity = 2;
        const cues = [s.cue('musculos'), s.dur * 0.62, s.dur * 0.85];
        let u = 0.015 + 0.012 * smooth(seg(t, 0, cues[0]));
        cues.forEach((c) => (u += 0.032 * easeOut(seg(t, c, c + 0.55))));
        const p = naCurva(u, V());
        gomaInt.visible = true;
        gomaInt.position.copy(p).add(new THREE.Vector3(0, -0.08, 0));
        gomaInt.rotation.set(0, Math.PI / 2 - 0.6, 0);
        const empurrao = cues.reduce((a, c) => Math.max(a, pulse(t, c - 0.05, 0.45)), 0);
        gomaInt.rosto(empurrao > 0.3 ? 'surpreso' : 'feliz', 0.6, 0);
        gomaInt.scale.set(1 + 0.15 * empurrao, 1 - 0.12 * empurrao, 1);
        aneis.forEach((a, i) => {
          a.visible = true;
          posicionarAnel(a, u - 0.011 * (i + 1), cues.reduce((acc, c) => Math.max(acc, pulse(t, c - 0.12 + i * 0.05, 0.45)), 0));
        });
        bolaGrande.visible = false;
        bojo.visible = false;
        aviso.visible = false;
        pequenas.forEach((b) => (b.visible = false));
        E.cam(p.x - 1.2, p.y + 3.4, p.z + 3.9, p.x + 0.35, p.y - 0.35, p.z + 0.55, 36);
        E.sombra(p.x, p.z, 5);
        E.rotulo(naCurva(u + 0.03, V()), 'INTESTINO', { k: seg(t, 0.3, 0.6), dx: -120, dy: -300, bg: '#ff8fa3' });
      },

      privada(s) {
        const { t } = s;
        E.show(banheiro);
        banheiro.add(kid.root);
        E.fundo(0xbfe9ff, 0xdbe7f0, { chaoCor: 0xd4e2ee });
        const dias = s.cue('dias');
        const sabe = s.cue('sabe');
        const desc = s.cue('descarga');
        const olha = smooth(seg(t, sabe - 0.1, sabe + 0.25));
        const balanco = Math.sin(t * 4) * 0.25;
        kid.update(s.T, {
          ...POSES.sentado, lArmFwd: 0.55, lArmOut: 0.25, lElbow: 0.5, rArmFwd: 0.55, rArmOut: 0.25, rElbow: 0.5,
          y: 0.24, z: -0.02, lKnee: 1.5 + balanco, rKnee: 1.5 - balanco, headY: 0.35 * olha, headX: -0.08 * olha, headZ: 0.05 * Math.sin(t * 1.6),
          spineX: 0.06,
        }, { expr: t > desc ? 'aliviado' : t > sabe - 0.1 ? 'desconfiado' : 'neutro', blush: t > sabe ? 1 : 0.4, gx: 0.6 * olha });
        diasTxt.visible = t > dias;
        diasTxt.scale.setScalar(Math.max(0.001, elastic(seg(t, dias, dias + 0.7))));
        diasTxt.position.set(0, 3.1, 0.3);
        diasTxt.rotation.set(0.1, 0.2 * Math.sin(t * 2), 0.04 * Math.sin(t * 3));
        alavanca.rotation.z = Math.PI / 2 + 0.5 * pulse(t, desc, 0.4);
        agua.rotation.z = (t > desc ? (t - desc) * 8 : 0);
        gotas.visible = t > desc;
        gotas.update(s.T, { x: 0, y: 0.75, z: 0.05, w: 0.6, d: 0.6, h: 0.5, r: 0.06, vel: 1.2 });
        E.tremer(pulse(t, desc, 0.6) * 0.3);
        E.cam(0.9, 2.05, lerp(5.8, 5.2, smooth(s.p)), 0.05, 1.95, 0, 36);
      },

      muitos(s) {
        const { t } = s;
        E.show(quarto);
        quarto.add(kid.root);
        E.fundo(0xff9ec4, 0xffeef6);
        animEnfeites(s.T);
        const m = s.cue('muitos');
        const hits = [m, m + 0.18, m + 0.36];
        const fim = s.falaFim;
        const enchido = hits.reduce((a, h) => a + smooth(seg(t, h, h + 0.12)), 0);
        const gole = pulse(t, fim, 0.45);
        kid.update(s.T, { ry: -0.15, cheeks: enchido * 0.45 * (1 - smooth(seg(t, fim, fim + 0.2))), headX: 0.25 * gole - 0.08, squash: 0.04 * gole }, {
          expr: t < m ? 'neutro' : t < fim ? 'surpreso' : 'assustado', boca: t > m - 0.25 && t < hits[2] + 0.05 ? 0.7 : undefined,
        });
        bolha.visible = false;
        const boca = kid.bocaMundo(V());
        voando.forEach((b, i) => {
          const h = hits[i];
          const k = seg(t, h - 0.25, h);
          b.visible = k > 0 && k < 1;
          const ini = new THREE.Vector3(1.6 - i * 0.8, 3.6, 1.2);
          b.position.lerpVectors(ini, boca, easeIn(k)).add(new THREE.Vector3(0, Math.sin(Math.PI * k) * 0.5, 0));
        });
        E.tremer(hits.reduce((a, h) => a + pulse(t, h, 0.15) * 0.3, 0));
        E.cam(-1.0, 2.1, 4.3, 0, 1.74, 0, 36);
        E.desenhar((ctx) => {
          if (t >= fim && t < fim + 0.7) {
            const [x, y] = E.projetar(boca);
            textoContorno(ctx, 'GULP!', x + 230, y - 300, { size: 120, scale: back(seg(t, fim, fim + 0.18)), rot: -0.15, cor: '#ffe135' });
          }
        });
      },

      hospital(s) {
        const { t } = s;
        E.show(intestinoSet);
        const hosp = s.cue('hospital');
        const ent = s.cue('entalada');
        const alerta = t > hosp ? 0.5 + 0.5 * Math.sin((t - hosp) * 9) : 0;
        E.fundo(0x5a1024, 0x1c050c, { chaoCor: 0x6b1a30, near: 6, far: 16, neblina: 0x2a0812 });
        E.rim.color.set(0xff4040);
        E.rim.intensity = 2 + 3 * alerta;
        if (alerta) E.tint = `rgba(255,20,20,${0.16 * alerta})`;
        const U = 0.5;
        const P = naCurva(U, V());
        const junta = smooth(seg(t, 0.2, hosp));
        pequenas.forEach((b, i) => {
          const u0 = U - 0.012 - i * 0.006;
          const k = smooth(seg(t, 0.1 + i * 0.08, hosp - 0.1 + i * 0.02));
          b.visible = k < 0.98;
          b.position.lerpVectors(naCurva(u0, V()), P, k).add(new THREE.Vector3(0, -0.12, 0));
          b.scale.setScalar(1 - 0.6 * k);
          b.rosto('feliz', 0.5, 0);
        });
        const tremor = t > ent ? Math.sin(t * 50) * 0.03 * (1 - seg(t, ent + 0.8, ent + 1.4)) : 0;
        bolaGrande.visible = true;
        bolaGrande.scale.setScalar(0.35 + 0.75 * junta);
        bolaGrande.position.copy(P).add(new THREE.Vector3(tremor, -0.05, 0));
        bolaGrande.rotation.set(0, 0.6, 0);
        bolaGrande.rosto(t > hosp ? 'assustado' : 'feliz', 0.3, 0);
        bojo.visible = junta > 0.5;
        bojo.position.copy(P);
        bojo.scale.set(0.58 * bolaGrande.scale.x, 0.56 * bolaGrande.scale.x, 0.58 * bolaGrande.scale.x);
        aneis.forEach((a, i) => {
          a.visible = true;
          posicionarAnel(a, U - 0.03 - 0.008 * i, t > ent ? Math.abs(Math.sin((t - ent) * 7 + i)) : 0);
        });
        gomaInt.visible = false;
        aviso.visible = t > hosp;
        aviso.position.copy(P).add(new THREE.Vector3(0, 1.55, 0));
        aviso.scale.setScalar(Math.max(0.001, back(seg(t, hosp, hosp + 0.35))) * 0.75);
        aviso.rotation.set(0, -0.5, 0.08 * Math.sin(t * 7));
        E.cam(P.x + 1.0, P.y + 2.7, P.z + 5.6, P.x, P.y + 0.05, P.z + 0.4, 36);
        E.sombra(P.x, P.z, 5);
        E.tremer(t > ent ? 0.35 * (1 - seg(t, ent + 0.6, ent + 1.4)) : 0);
      },

      final(s) {
        const { t } = s;
        E.show(quarto);
        quarto.add(kid.root);
        E.fundo(0xffd84d, 0xfff6d6);
        animEnfeites(s.T);
        const hein = s.cue('hein');
        const k = smooth(seg(t, hein - 0.35, hein));
        kid.update(s.T, { ...misturar('idle', { ...POSES.dedoBalanca, lArmOut: 0.14, lArmFwd: 0, lElbow: 0.2, lArmTwist: 0 }, k), rArmTwist: 0.3 + 0.4 * Math.sin(t * 10) * k, ry: 0.1, headZ: 0.08 * Math.sin(t * 2) }, {
          expr: t < hein ? 'mastigando' : 'orgulhoso', boca: t < hein - 0.4 ? mastigar(t) : undefined, pisca: t > hein && t < hein + 0.7 ? 'L' : undefined,
        });
        bolha.visible = false;
        voando.forEach((v) => (v.visible = false));
        E.cam(0.25, 2.05, lerp(4.5, 3.9, smooth(s.p)), 0, 1.72, 0, 36);
        const cta = seg(t, s.dur - 1.5, s.dur - 1.2);
        if (cta > 0) E.desenhar((ctx) => pilula(ctx, 'SIGA PRA MAIS CURIOSIDADES!', W / 2, 330, back(cta)));
      },
    },
  };
}

export function estrela(ctx, x, y, r) {
  if (r <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const rr = i % 2 ? r * 0.28 : r;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = '#fff6a8';
  ctx.shadowColor = '#ffe135';
  ctx.shadowBlur = 20;
  ctx.fill();
  ctx.restore();
}

export function pilula(ctx, txt, x, y, k) {
  if (k <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.font = '900 54px Montserrat';
  const w = ctx.measureText(txt).width + 80;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -48, w, 96, 48);
  ctx.fillStyle = '#ff2d55';
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#111';
  ctx.stroke();
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(txt, 0, 3);
  ctx.restore();
}
