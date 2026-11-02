// Vídeo 10: O que acontece se você cair num buraco negro?
import { THREE, W, mesh, brilho, seg, smooth, easeOut, easeIn, back, pulse, lerp, wob, textoContorno } from '/web/engine.js';
import { misturar } from '/web/bonequinho.js';
import { estrelas } from '/web/props.js';
import { astronauta, buracoNegro } from '/web/biblioteca/espaco.js';
import { pilula } from '/web/biblioteca/hud.js';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

export function criar(E) {
  const a1 = astronauta({ cabelo: 0x3a2417, estilo: 'curto', fase: 0.2 });
  const a2 = astronauta({ cabelo: 0x111111, estilo: 'coque', pele: 0xc68b5e, fase: 0.7 });

  const espaco = E.set();
  espaco.add(estrelas(2400, 150, 21));
  const bn = buracoNegro();
  espaco.add(bn);
  espaco.add(a1.root, a2.root);
  const curvas = Array.from({ length: 6 }, (_, i) => {
    const y = -1.4 + i * 0.55;
    return new THREE.CatmullRomCurve3([V(4.5, y + 0.6, 0.5), V(2.2, y * 0.8, 0.3), V(1.1, y * 0.35, 0.15), V(0, 0, 0)]);
  });
  const fotons = curvas.flatMap(() => [0, 1, 2].map(() => mesh(new THREE.SphereGeometry(0.06, 10, 8), brilho(0xfff1a8, 4), { parent: espaco, sombra: false })));
  const tracos = curvas.map((c) => mesh(new THREE.TubeGeometry(c, 60, 0.012, 6), new THREE.MeshBasicMaterial({ color: 0xfff1a8, transparent: true, opacity: 0.35, fog: false }), { parent: espaco, sombra: false }));
  const luzVermelha = new THREE.PointLight(0xff2a00, 0, 6, 1.2);
  espaco.add(luzVermelha);

  function base(s) {
    E.show(espaco);
    E.fundo(0x07061a, 0x000000, { chao: false, near: 300, far: 600 });
    E.hemi.intensity = 0.35;
    E.key.position.set(-5, 4, 6);
    E.key.intensity = 2.4;
    E.rim.color.set(0xff9a3d);
    E.rim.intensity = 2.5;
    E.rim.position.set(0, 0, -8);
    E.scene.environmentIntensity = 0.3;
    E.gtao.enabled = false;
    fotons.forEach((f) => (f.visible = false));
    tracos.forEach((t) => (t.visible = false));
    a2.root.visible = false;
    luzVermelha.intensity = 0;
    bn.scale.setScalar(1);
    bn.position.set(0, 0, 0);
    void s;
  }
  // depois de mudar a câmera
  const girar = (s) => bn.atualizar(s.T, E.camera);
  const esticar = (b, k) => {
    const sy = 1 + 1.2 * k;
    b.root.scale.set(1 / Math.sqrt(sy), sy, 1 / Math.sqrt(sy));
  };

  return {
    beats: {
      gancho(s) {
        const { t } = s;
        base(s);
        const pu = s.cue('puxa');
        const vai = easeIn(seg(t, pu - 0.2, s.dur));
        bn.position.set(0, 0.2, -7);
        a1.update(s.T, { ...misturar('idle', 'bracosAbertos', smooth(seg(t, pu - 0.3, pu))), x: lerp(0, -0.3, vai), y: lerp(0.2, 0.6, vai) + 0.1 * Math.sin(s.T), z: lerp(0, -4.5, vai), ry: lerp(0.2, Math.PI * 0.9, vai), rz: 0.08 * Math.sin(s.T * 0.7) + vai * 0.6 }, { expr: t < pu - 0.3 ? 'surpreso' : 'assustado', boca: t > pu - 0.3 ? 0.9 : undefined });
        E.cam(0.8, 1.9, lerp(5.6, 5.0, smooth(s.p)), 0, 1.4, -2.5, 36);
        girar(s);
        E.tremer(pulse(t, pu, 0.5) * 0.6);
      },

      luz(s) {
        const { t } = s;
        base(s);
        a1.root.visible = false;
        bn.position.set(0, 0, 0);
        tracos.forEach((tr) => (tr.visible = true));
        fotons.forEach((f, i) => {
          const c = curvas[Math.floor(i / 3)];
          const u = (s.T * 0.35 + (i % 3) / 3 + Math.floor(i / 3) * 0.13) % 1;
          f.visible = u < 0.97;
          f.position.copy(c.getPointAt(u));
        });
        E.cam(1.6, 0.9, lerp(10.5, 9.5, smooth(s.p)), 0.8, -0.4, 0, 36);
        girar(s);
        E.rotulo(V(0, -1.0, 0), 'NEM A LUZ ESCAPA', { k: seg(t, s.cue('luz'), s.cue('luz') + 0.3), dx: 0, dy: 330, bg: '#ffd23f' });
      },

      espaguete(s) {
        const { t } = s;
        base(s);
        bn.position.set(0, -3.3, -1);
        bn.scale.setScalar(0.7);
        const pe = s.cue('pes');
        const mc = s.cue('macarrao');
        const k = smooth(seg(t, pe - 0.2, mc + 0.2));
        a1.update(s.T, { lArmOut: 2.7, rArmOut: 2.7, lElbow: 0.1, rElbow: 0.1, y: lerp(-0.4, -1.0, k) - 0.4 * k, rz: 0.04 * wob(s.T * 3) }, { expr: k > 0.3 ? 'assustado' : 'surpreso', boca: k > 0.3 ? 0.8 : undefined });
        esticar(a1, k);
        E.cam(0.4, 1.0, 10.0, 0, 0.9, 0, 36);
        girar(s);
        const pes = a1.root.position.clone().add(V(0, 0.1, 0.3));
        const cab = a1.cabecaMundo(V(), 0.9);
        E.rotulo(pes, 'PÉS: PUXÃO FORTE', { k: seg(t, pe, pe + 0.3), dx: 230, dy: 40, bg: '#ff8fa3', size: 40 });
        E.rotulo(cab, 'CABEÇA: MAIS FRACO', { k: seg(t, pe + 1.2, pe + 1.5), dx: -200, dy: -120, bg: '#9fd4ff', size: 40 });
        E.tremer(0.15 * k);
      },

      nome(s) {
        const { t } = s;
        base(s);
        bn.position.set(0, -3.6, -1.5);
        bn.scale.setScalar(0.7);
        a1.update(s.T, { lArmOut: 2.7, rArmOut: 2.7, lElbow: 0.1, rElbow: 0.1, y: -1.4, rz: 0.15 * Math.sin(s.T * 4), rx: 0.1 * Math.sin(s.T * 3) }, { expr: 'confuso' });
        esticar(a1, 1);
        E.cam(0.4, 1.0, 10.0, 0, 0.9, 0, 36);
        girar(s);
        const n = s.cue('nome');
        E.desenhar((ctx) => {
          const k = back(seg(t, n, n + 0.25));
          if (k > 0.01) textoContorno(ctx, 'ESPAGUETIFICAÇÃO', W / 2, 330, { size: 74, scale: k, cor: '#ffe135', rot: -0.03 });
          if (t > n + 1.3) textoContorno(ctx, '🍝 (nome científico de verdade)', W / 2, 440, { size: 44, weight: 800, scale: back(seg(t, n + 1.3, n + 1.5)), cor: '#ffffff' });
        });
      },

      gigante(s) {
        const { t } = s;
        base(s);
        const gi = s.cue('gigante');
        const bo = s.cue('borda');
        const cresce = easeOut(seg(t, gi - 0.3, gi + 0.8));
        bn.scale.setScalar(lerp(0.8, 3.4, cresce));
        bn.position.set(0, lerp(-1.5, -4.4, cresce), -3);
        const atravessa = smooth(seg(t, bo - 0.6, s.dur));
        a1.update(s.T, { x: 0.2, y: lerp(0.9, -0.8, atravessa) + 0.08 * Math.sin(s.T), z: lerp(0, -1.6, atravessa), ry: 0.3, lArmOut: 0.8, rArmOut: 0.8 }, { expr: 'sorriso' });
        a1.root.scale.setScalar(1);
        E.cam(0.6, 1.4, lerp(8.0, 7.2, smooth(s.p)), 0, 0.5, -1, 36);
        girar(s);
        E.rotulo(V(-0.6, -0.9, -1.2), 'HORIZONTE DE EVENTOS', { k: seg(t, bo - 0.3, bo), dx: -60, dy: 330, bg: '#fb923c', size: 40 });
        E.desenhar((ctx) => { if (t > gi) textoContorno(ctx, '4 MILHÕES DE SÓIS', W / 2, 330, { size: 78, scale: back(seg(t, gi, gi + 0.25)), cor: '#ffe135' }); });
      },

      observador(s) {
        const { t } = s;
        base(s);
        bn.position.set(1.1, 1.6, -9);
        bn.scale.setScalar(1.6);
        const le = s.cue('lento');
        const ve = s.cue('vermelho');
        const so = s.cue('sumir');
        const congela = 1 - Math.exp(-Math.max(0, t) * 0.9);
        const pos = V(lerp(0.2, 0.75, congela), lerp(2.2, 2.0, congela), lerp(-3.5, -6.6, congela));
        const some = 1 - smooth(seg(t, so - 0.3, so + 0.2));
        a1.update(s.T * 0.2, { x: pos.x, y: pos.y, z: pos.z, s: 0.6 * Math.max(0.001, some), ry: Math.PI * 0.8, lArmOut: 2.2, rArmOut: 2.2 }, { expr: 'assustado' });
        luzVermelha.position.copy(pos).add(V(0, 0.8, 1));
        luzVermelha.intensity = 30 * smooth(seg(t, ve - 0.3, ve + 0.4)) * some;
        a2.update(s.T, { x: -1.05, y: -0.5, z: 1.2, ry: Math.PI + 0.5, headY: -0.2, rArmFwd: 1.2, rElbow: 0.3 }, { expr: 'surpreso' });
        a2.root.visible = true;
        E.cam(0.1, 1.8, 5.6, 0.3, 1.5, -4, 38);
        girar(s);
        const ang = 6 * (1 - Math.exp(-t * 0.7));
        const cab = a1.cabecaMundo(V(), 1.4);
        E.desenhar((ctx) => {
          if (t < le - 0.5 || some < 0.05) return;
          const [x, y] = E.projetar(cab);
          const r = 50 * back(seg(t, le - 0.5, le - 0.2));
          ctx.save();
          ctx.translate(x + 120, y - 40);
          ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fillStyle = '#fff'; ctx.lineWidth = 8; ctx.strokeStyle = '#111'; ctx.stroke(); ctx.fill();
          ctx.rotate(ang); ctx.strokeStyle = '#ff2d3d'; ctx.lineWidth = 6;
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -r * 0.75); ctx.stroke();
          ctx.restore();
          if (t > le) textoContorno(ctx, 'TEMPO DEVAGAR…', x + 120, y + 40, { size: 40, cor: '#ffffff' });
        });
      },

      final(s) {
        const { t } = s;
        base(s);
        bn.position.set(0, 1.0, -6);
        bn.scale.setScalar(1.3);
        a1.update(0, { x: 0.25, y: 1.9, z: -4.6, s: 0.35, ry: Math.PI * 0.8, lArmOut: 2.2, rArmOut: 2.2 }, { expr: 'assustado' });
        luzVermelha.position.set(0.25, 2.6, -3.6);
        luzVermelha.intensity = 14 * (0.7 + 0.3 * Math.sin(s.T * 2));
        E.cam(0.4, 1.8, lerp(5.0, 6.4, smooth(s.p)), 0, 1.4, -3, 36);
        girar(s);
        const cta = seg(t, s.dur - 1.5, s.dur - 1.2);
        E.desenhar((ctx) => {
          if (t > s.cue('nunca')) textoContorno(ctx, 'CONGELADO PRA SEMPRE', W / 2, 1480, { size: 70, scale: back(seg(t, s.cue('nunca'), s.cue('nunca') + 0.25)), cor: '#ff8fa3' });
          if (cta > 0) pilula(ctx, 'SIGA PRA MAIS CURIOSIDADES!', W / 2, 330, back(cta));
        });
      },
    },
  };
}
