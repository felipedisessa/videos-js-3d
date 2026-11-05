// Peças de clima e mapa: Brasil em 3D por regiões, termômetro, chuva, chama e frente fria.
import { THREE, mat, mesh, rng, brilho, vidro, escurecer } from '../engine.js';
import { halo } from './espaco.js';

// ---------- mapa do Brasil (contornos simplificados, lon/lat em graus) ----------
// Trechos de fronteira compartilhados entre regiões, para não sobrar fresta entre as peças.
const C = {
  costaN: [[-51.6, 4.3], [-50.9, 3.3], [-50.0, 1.8], [-49.9, 0.0], [-48.4, -0.8], [-47.5, -0.6], [-46.1, -1.0]],
  costaNE: [[-46.1, -1.0], [-44.3, -2.5], [-41.8, -2.9], [-38.5, -3.7], [-36.5, -5.0], [-35.2, -5.4], [-34.8, -7.1], [-35.0, -9.0], [-37.0, -11.0], [-38.5, -13.0], [-39.0, -15.0], [-39.2, -17.7], [-39.7, -18.3]],
  costaSE: [[-39.7, -18.3], [-40.3, -20.3], [-41.0, -22.0], [-43.2, -22.9], [-44.7, -23.4], [-46.3, -24.0], [-48.0, -25.3]],
  costaS: [[-48.0, -25.3], [-48.6, -26.5], [-48.5, -28.5], [-49.7, -29.3], [-51.0, -31.0], [-52.1, -32.2], [-53.4, -33.7]],
  fronteiraS: [[-53.4, -33.7], [-53.5, -32.5], [-55.6, -30.9], [-57.6, -30.2], [-55.7, -28.2], [-53.8, -27.2], [-54.6, -25.5], [-54.3, -24.0]],
  coS: [[-54.3, -24.0], [-52.6, -22.6]],
  seS: [[-52.6, -22.6], [-51.0, -22.6], [-50.0, -22.9], [-49.3, -23.3], [-48.3, -24.6], [-48.0, -25.3]],
  coSE: [[-52.6, -22.6], [-52.0, -21.8], [-51.0, -20.3], [-51.0, -19.8], [-50.2, -19.0], [-48.5, -18.3], [-47.3, -17.0], [-47.3, -16.0], [-46.9, -15.5], [-46.0, -15.2]],
  neSE: [[-46.0, -15.2], [-45.5, -15.0], [-44.0, -14.5], [-42.5, -15.0], [-41.0, -16.0], [-40.5, -17.5], [-39.7, -18.3]],
  neCO: [[-46.0, -15.2], [-46.5, -13.0]],
  nNE: [[-46.5, -13.0], [-46.2, -11.0], [-46.4, -9.4], [-47.4, -7.5], [-48.0, -5.3], [-46.8, -3.5], [-46.1, -1.0]],
  nCO: [[-46.5, -13.0], [-49.0, -13.0], [-50.5, -12.8], [-50.6, -9.9], [-55.0, -9.6], [-58.2, -7.4], [-59.5, -8.6], [-61.5, -10.0], [-60.5, -11.5], [-60.2, -13.6]],
  fronteiraCO: [[-60.2, -13.6], [-60.3, -15.0], [-58.3, -16.3], [-58.0, -20.0], [-57.8, -22.0], [-55.7, -22.5], [-54.3, -24.0]],
  fronteiraN: [[-60.2, -13.6], [-62.0, -13.0], [-64.3, -12.5], [-65.3, -11.5], [-65.3, -9.8], [-67.5, -10.5], [-69.6, -11.0], [-70.6, -11.0], [-70.6, -9.5], [-72.2, -10.0], [-73.0, -9.4], [-73.8, -7.4], [-72.9, -5.2], [-70.0, -4.2], [-69.5, -1.5], [-69.9, 1.0], [-67.3, 2.2], [-66.9, 1.2], [-64.0, 1.9], [-64.0, 4.0], [-62.8, 4.0], [-60.9, 5.2], [-60.1, 5.2], [-59.8, 4.2], [-59.6, 2.7], [-59.9, 1.4], [-58.4, 1.4], [-56.5, 1.9], [-55.0, 2.5], [-54.1, 2.1], [-52.6, 2.5], [-51.6, 4.3]],
};
const rev = (a) => [...a].reverse();
const junta = (...trechos) => trechos.reduce((acc, t) => acc.concat(acc.length ? t.slice(1) : t), []).slice(0, -1);

export const REGIOES = {
  norte: junta(C.fronteiraN, C.costaN, rev(C.nNE), C.nCO),
  nordeste: junta(C.costaNE, rev(C.neSE), C.neCO, C.nNE),
  centroOeste: junta(rev(C.nCO), rev(C.neCO), rev(C.coSE), rev(C.coS), rev(C.fronteiraCO)),
  sudeste: junta(C.costaSE, rev(C.seS), C.coSE, C.neSE),
  sul: junta(C.costaS, C.fronteiraS, C.coS, C.seS),
};

/** Rio Amazonas simplificado (lon/lat), para desenhar sobre o mapa. */
export const RIO_AMAZONAS = [[-73.0, -4.2], [-70.0, -3.6], [-67.0, -3.0], [-64.0, -3.4], [-60.0, -3.1], [-57.0, -2.6], [-54.0, -2.0], [-52.0, -1.4], [-50.2, -0.6]];

const LON0 = -52;
const LAT0 = -14;
const COSLAT = Math.cos((14 * Math.PI) / 180);

/**
 * Mapa do Brasil em relevo, uma peça por região, deitado no plano XZ (norte = -z), centrado em (0, 0, 0).
 * mapa.regioes.<nome> é a malha da região (.pintar(cor), .centro = Vector3 no topo); mapa.ponto(lon, lat) dá a
 * posição local de uma coordenada no topo do mapa; mapa.rio é o Amazonas (tubo).
 * k = unidades por grau (0.1 deixa o país com ~4 unidades de largura).
 */
export function mapaBrasil({ k = 0.1, altura = 0.12, cores = {} } = {}) {
  const g = new THREE.Group();
  const xy = ([lon, lat]) => new THREE.Vector2((lon - LON0) * k * COSLAT, (lat - LAT0) * k);
  g.ponto = (lon, lat, y = altura) => new THREE.Vector3((lon - LON0) * k * COSLAT, y, -(lat - LAT0) * k);
  const padrao = { norte: 0x4ade80, nordeste: 0xfacc15, centroOeste: 0xfb923c, sudeste: 0x60a5fa, sul: 0xa78bfa };
  g.regioes = {};
  for (const [nome, pts] of Object.entries(REGIOES)) {
    const shape = new THREE.Shape(pts.map(xy));
    const geo = new THREE.ExtrudeGeometry(shape, { depth: altura, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2, curveSegments: 1 });
    geo.rotateX(-Math.PI / 2);
    const cor = cores[nome] ?? padrao[nome];
    const topo = mat(cor, { roughness: 0.55, clearcoat: 0.3 });
    const lado = mat(escurecer(cor, 0.6), { roughness: 0.6 });
    const m = mesh(geo, [topo, lado], { parent: g });
    const c = pts.reduce((a, p) => [a[0] + p[0] / pts.length, a[1] + p[1] / pts.length], [0, 0]);
    m.centro = g.ponto(c[0], c[1]);
    m.pintar = (hex) => { topo.color.set(hex); lado.color.set(escurecer(hex, 0.6)); };
    m.materiais = { topo, lado };
    g.regioes[nome] = m;
  }
  // ajustes do "centro" visual (a média dos vértices puxa para as bordas detalhadas)
  g.regioes.norte.centro = g.ponto(-61, -4);
  g.regioes.nordeste.centro = g.ponto(-40.5, -8);
  g.regioes.centroOeste.centro = g.ponto(-53.5, -15.5);
  g.regioes.sudeste.centro = g.ponto(-45, -20);
  g.regioes.sul.centro = g.ponto(-52, -27.5);
  const curva = new THREE.CatmullRomCurve3(RIO_AMAZONAS.map(([lon, lat]) => g.ponto(lon, lat, altura + 0.02)));
  g.rio = mesh(new THREE.TubeGeometry(curva, 64, 0.018 * (k / 0.1), 8), mat(0x38bdf8, { roughness: 0.2, clearcoat: 1, emissive: 0x0ea5e9, emissiveIntensity: 0.25 }), { parent: g, sombra: false });
  return g;
}

// ---------- termômetro ----------
/** Termômetro de vidro com líquido vermelho; termometro.nivel(0..1). Altura total ~3 unidades. */
export function termometro({ cor = 0xff2d3d } = {}) {
  const g = new THREE.Group();
  const h = 2.4;
  const vid = vidro(0xffffff, 0.12);
  mesh(new THREE.CapsuleGeometry(0.2, h, 8, 24), vid, { pos: [0, 0.55 + h / 2, 0], parent: g, sombra: false });
  mesh(new THREE.SphereGeometry(0.4, 32, 24), vid, { pos: [0, 0.3, 0], parent: g, sombra: false });
  const liq = mat(cor, { emissive: cor, emissiveIntensity: 0.35, roughness: 0.25, clearcoat: 1 });
  mesh(new THREE.SphereGeometry(0.32, 32, 24), liq, { pos: [0, 0.3, 0], parent: g });
  const col = mesh(new THREE.CylinderGeometry(0.11, 0.11, 1, 20), liq, { parent: g });
  for (let i = 0; i < 9; i++) mesh(new THREE.BoxGeometry(i % 2 ? 0.1 : 0.18, 0.03, 0.03), mat(0x1f2937), { pos: [0.24 + (i % 2 ? 0 : 0.04), 0.8 + i * 0.26, 0.1], parent: g, sombra: false });
  g.liquido = liq;
  g.nivel = (k) => {
    const L = 0.12 + Math.max(0, Math.min(1, k)) * (h + 0.1);
    col.scale.y = L;
    col.position.y = 0.45 + L / 2;
  };
  g.nivel(0.3);
  return g;
}

// ---------- chuva ----------
/** Riscos de chuva caindo em loop; chuva.update(T, { x, y, z, w, d, h, vel }) (cai de y + h até y). */
export function chuva(n = 300, { cor = 0xbfe3ff, comprimento = 0.35, raio = 0.012, seed = 9 } = {}) {
  const R = rng(seed);
  const geo = new THREE.CylinderGeometry(raio, raio, comprimento, 4);
  const m = new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: 0.75, depthWrite: false });
  const inst = new THREE.InstancedMesh(geo, m, n);
  inst.frustumCulled = false;
  inst.castShadow = false;
  const d = Array.from({ length: n }, () => ({ x: R() - 0.5, z: R() - 0.5, f: R(), v: 0.8 + R() * 0.4 }));
  const o = new THREE.Object3D();
  inst.update = (T, { x = 0, y = 0, z = 0, w = 2, d: prof = 2, h = 3, vel = 1.2, inclina = 0 } = {}) => {
    d.forEach((p, i) => {
      const k = (p.f + T * vel * p.v) % 1;
      o.position.set(x + p.x * w + inclina * (1 - k) * h, y + (1 - k) * h, z + p.z * prof);
      o.rotation.set(0, 0, -inclina);
      o.updateMatrix();
      inst.setMatrixAt(i, o.matrix);
    });
    inst.instanceMatrix.needsUpdate = true;
  };
  return inst;
}

// ---------- chama ----------
/** Chaminha estilizada (queimada, fogueira); chama.atualizar(T, k) com k = tamanho 0..1. */
export function chama(seed = 1) {
  const g = new THREE.Group();
  const camadas = [[0.22, 0.6, 0xff3d0a, 2.2], [0.15, 0.45, 0xff9a1a, 2.8], [0.08, 0.28, 0xfff1a8, 3.5]].map(([r, h, cor, i]) => {
    const geo = new THREE.SphereGeometry(r, 16, 12);
    geo.translate(0, r, 0);
    geo.scale(1, h / (2 * r) * 1.6, 1);
    return mesh(geo, brilho(cor, i, { transparent: true, opacity: 0.9 }), { parent: g, sombra: false, recebe: false });
  });
  const luz = halo('255,140,50', 1.4);
  luz.position.y = 0.25;
  g.add(luz);
  const fase = seed * 1.7;
  g.atualizar = (T, k = 1) => {
    g.visible = k > 0.01;
    camadas.forEach((c, i) => {
      const f = 1 + 0.18 * Math.sin(T * 13 + fase + i * 1.3) + 0.1 * Math.sin(T * 29 + fase * 2 + i);
      c.scale.set(k * (1 - 0.06 * i * Math.sin(T * 9 + fase)), k * f, k);
      c.rotation.z = 0.12 * Math.sin(T * 7 + fase + i);
    });
    luz.scale.setScalar(1.4 * k);
  };
  g.atualizar(0, 1);
  return g;
}

// ---------- frente fria ----------
/** Símbolo meteorológico de frente fria (linha azul com triângulos) ao longo de pontos Vector3. */
export function frenteFria(pontos, { n = 7, tam = 0.13, cor = 0x2563eb } = {}) {
  const g = new THREE.Group();
  const curva = new THREE.CatmullRomCurve3(pontos);
  const m = mat(cor, { roughness: 0.3, clearcoat: 0.8, emissive: cor, emissiveIntensity: 0.35 });
  mesh(new THREE.TubeGeometry(curva, 48, tam * 0.22, 8), m, { parent: g, sombra: false });
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n;
    const p = curva.getPointAt(u);
    const tg = curva.getTangentAt(u);
    const tri = mesh(new THREE.ConeGeometry(tam, tam * 1.6, 3), m, { parent: g, sombra: false });
    tri.position.copy(p);
    const lado = new THREE.Vector3(tg.z, 0, -tg.x).normalize();
    tri.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), lado);
    tri.position.addScaledVector(lado, tam * 0.7);
  }
  g.curva = curva;
  return g;
}

