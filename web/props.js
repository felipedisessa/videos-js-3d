// Objetos reaproveitados entre os vídeos.
import { THREE, mat, mesh, group, rng, brilho } from './engine.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { criarOlho } from './bonequinho.js';

export { RoundedBoxGeometry };
const Z = new THREE.Vector3(0, 0, 1);

export function xis(cor = 0xff3040) {
  const g = new THREE.Group();
  const m = mat(cor, { roughness: 0.3, clearcoat: 0.8, emissive: cor, emissiveIntensity: 0.18 });
  for (const r of [Math.PI / 4, -Math.PI / 4]) mesh(new RoundedBoxGeometry(1.4, 0.32, 0.28, 4, 0.12), m, { rot: [0, 0, r], parent: g });
  return g;
}

export function check(cor = 0x22d36b) {
  const s = new THREE.Shape();
  s.moveTo(-0.6, 0.05); s.lineTo(-0.38, 0.27); s.lineTo(-0.15, 0.04); s.lineTo(0.42, 0.6); s.lineTo(0.64, 0.38); s.lineTo(-0.15, -0.4); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3 });
  geo.center();
  return mesh(geo, mat(cor, { roughness: 0.3, clearcoat: 0.8, emissive: cor, emissiveIntensity: 0.2 }));
}

export function placaAviso(E) {
  const g = new THREE.Group();
  mesh(new THREE.CylinderGeometry(1, 1, 0.16, 3), mat(0x1a1a1a, { roughness: 0.4 }), { rot: [-Math.PI / 2, 0, 0], pos: [0, 0, -0.04], parent: g });
  mesh(new THREE.CylinderGeometry(0.82, 0.82, 0.2, 3), mat(0xffd60a, { roughness: 0.35, clearcoat: 0.7, emissive: 0xffb000, emissiveIntensity: 0.15 }), { rot: [-Math.PI / 2, 0, 0], parent: g });
  const ex = E.texto3d('!', { size: 0.62, depth: 0.08, cor: 0x1a1a1a, lado: 0x000000, emissivo: 0 });
  ex.position.set(0, -0.12, 0.12);
  g.add(ex);
  return g;
}

export function relogio(cor = 0xff4d5a) {
  const g = new THREE.Group();
  const corpoM = mat(cor, { roughness: 0.3, clearcoat: 0.9 });
  const metal = mat(0xd9dde3, { roughness: 0.25, metalness: 0.8 });
  mesh(new THREE.CylinderGeometry(1, 1, 0.4, 56), corpoM, { rot: [Math.PI / 2, 0, 0], parent: g });
  mesh(new THREE.TorusGeometry(0.96, 0.07, 12, 56), corpoM, { pos: [0, 0, 0.2], parent: g });
  mesh(new THREE.CircleGeometry(0.9, 56), mat(0xfffdf5, { roughness: 0.6 }), { pos: [0, 0, 0.205], parent: g });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    mesh(new THREE.BoxGeometry(i % 3 ? 0.04 : 0.07, i % 3 ? 0.1 : 0.17, 0.03), mat(0x222222), { pos: [Math.sin(a) * 0.74, Math.cos(a) * 0.74, 0.22], rot: [0, 0, -a], parent: g });
  }
  const hora = group(g, [0, 0, 0.24]);
  mesh(new RoundedBoxGeometry(0.08, 0.48, 0.03, 2, 0.015), mat(0x1d1d1d), { pos: [0, 0.2, 0], parent: hora });
  const min = group(g, [0, 0, 0.27]);
  mesh(new RoundedBoxGeometry(0.055, 0.7, 0.03, 2, 0.012), mat(0xff3040), { pos: [0, 0.3, 0], parent: min });
  mesh(new THREE.SphereGeometry(0.07, 16, 12), metal, { pos: [0, 0, 0.29], parent: g });
  for (const sx of [1, -1]) {
    const sino = group(g, [sx * 0.62, 0.88, -0.05]);
    sino.rotation.z = -sx * 0.6;
    mesh(new THREE.SphereGeometry(0.32, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), metal, { parent: sino });
    mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.04, 24), metal, { parent: sino });
    mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.5, 10), metal, { pos: [sx * 0.62, -1.0, 0], rot: [0, 0, sx * 0.5], parent: g });
  }
  mesh(new THREE.CapsuleGeometry(0.05, 0.3, 4, 8), metal, { pos: [0, 1.05, -0.05], rot: [0, 0, Math.PI / 2], parent: g });
  g.userData = { hora, min };
  g.ponteiros = (minAng, horaAng) => { min.rotation.z = -minAng; hora.rotation.z = -horaAng; };
  return g;
}

export function trofeu() {
  const g = new THREE.Group();
  const ouro = mat(0xffc531, { metalness: 1, roughness: 0.2, clearcoat: 0.6 });
  mesh(new RoundedBoxGeometry(1.0, 0.3, 1.0, 3, 0.05), mat(0x3b2a20, { roughness: 0.5, clearcoat: 0.5 }), { pos: [0, 0.15, 0], parent: g });
  mesh(new RoundedBoxGeometry(0.6, 0.14, 0.04, 2, 0.02), ouro, { pos: [0, 0.15, 0.5], parent: g });
  mesh(new THREE.CylinderGeometry(0.3, 0.38, 0.14, 40), ouro, { pos: [0, 0.37, 0], parent: g });
  mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.4, 24), ouro, { pos: [0, 0.62, 0], parent: g });
  mesh(new THREE.SphereGeometry(0.13, 24, 16), ouro, { pos: [0, 0.8, 0], parent: g });
  const perfil = [[0, 0], [0.14, 0], [0.32, 0.1], [0.47, 0.36], [0.54, 0.72], [0.57, 0.82], [0.52, 0.83], [0.48, 0.72], [0.42, 0.38], [0.27, 0.15], [0, 0.1]].map(([x, y]) => new THREE.Vector2(x, y));
  mesh(new THREE.LatheGeometry(perfil, 56), ouro, { pos: [0, 0.86, 0], parent: g });
  for (const sx of [1, -1]) mesh(new THREE.TorusGeometry(0.22, 0.05, 12, 28, Math.PI), ouro, { pos: [sx * 0.52, 1.32, 0], rot: [0, 0, -sx * Math.PI / 2], parent: g });
  // estrela
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    const r = i % 2 ? 0.08 : 0.19;
    i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  const eg = new THREE.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 });
  mesh(eg, mat(0xfff1a8, { metalness: 0.9, roughness: 0.15, emissive: 0xffd34d, emissiveIntensity: 0.4 }), { pos: [0, 1.25, 0.47], parent: g });
  return g;
}

// confete em InstancedMesh; explode a partir de um ponto e cai
export function confete(n = 160, seed = 3) {
  const R = rng(seed);
  const geo = new THREE.PlaneGeometry(0.09, 0.055);
  const m = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.6 });
  const inst = new THREE.InstancedMesh(geo, m, n);
  inst.castShadow = false;
  const cores = [0xff3b5c, 0xffd60a, 0x3dd6ff, 0x6bff6b, 0xb06bff, 0xff8c1a];
  const dados = [];
  for (let i = 0; i < n; i++) {
    inst.setColorAt(i, new THREE.Color(cores[i % cores.length]));
    const a = R() * Math.PI * 2;
    const up = 0.35 + R() * 0.65;
    dados.push({ v: new THREE.Vector3(Math.cos(a) * (1 - up * 0.5), up * 1.6, Math.sin(a) * (1 - up * 0.5)).multiplyScalar(2 + R() * 2.5), rx: R() * 10, ry: R() * 10, w: 3 + R() * 6 });
  }
  const o = new THREE.Object3D();
  inst.update = (t, centro) => {
    inst.visible = t > 0;
    for (let i = 0; i < n; i++) {
      const d = dados[i];
      const k = (1 - Math.exp(-2.2 * t)) / 2.2;
      o.position.set(centro.x + d.v.x * k, centro.y + d.v.y * k - 0.9 * t * t * 0.6, centro.z + d.v.z * k);
      o.rotation.set(d.rx + t * d.w, d.ry + t * d.w * 0.7, 0);
      o.updateMatrix();
      inst.setMatrixAt(i, o.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
  };
  return inst;
}

export function estrelas(n = 1500, raio = 120, seed = 11) {
  const R = rng(seed);
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const v = new THREE.Vector3(R() * 2 - 1, R() * 2 - 1, R() * 2 - 1).normalize().multiplyScalar(raio);
    pos.set([v.x, v.y, v.z], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 0.35, sizeAttenuation: true, fog: false }));
}

// bolinhas que sobem em loop (bolhas de ácido, faíscas, etc.)
export function particulas(n, material, seed = 5) {
  const R = rng(seed);
  const geo = new THREE.SphereGeometry(1, 10, 8);
  const inst = new THREE.InstancedMesh(geo, material, n);
  inst.castShadow = false;
  const d = Array.from({ length: n }, () => ({ x: R() - 0.5, z: R() - 0.5, f: R(), v: 0.6 + R() * 0.8, r: 0.4 + R() * 0.6 }));
  const o = new THREE.Object3D();
  inst.update = (T, { x = 0, y = 0, z = 0, w = 1, d: prof = 1, h = 1, r = 0.05, vel = 0.3 } = {}) => {
    d.forEach((p, i) => {
      const k = (p.f + T * vel * p.v) % 1;
      o.position.set(x + p.x * w, y + k * h, z + p.z * prof);
      o.scale.setScalar(r * p.r * Math.sin(Math.PI * k));
      o.updateMatrix();
      inst.setMatrixAt(i, o.matrix);
    });
    inst.instanceMatrix.needsUpdate = true;
  };
  return inst;
}

// bolinha com rostinho (chiclete, etc.)
export function bolinha(cor = 0xff6fae, r = 0.28, seed = 1) {
  const g = new THREE.Group();
  const geo = new THREE.SphereGeometry(r, 48, 36);
  const p = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = 1 + 0.035 * Math.sin(v.x * 31 + seed) * Math.sin(v.y * 27) * Math.sin(v.z * 29 + seed * 2);
    v.multiplyScalar(n);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  const corpo = mesh(geo, mat(cor, { roughness: 0.42, clearcoat: 0.5, sheen: 0.4, sheenColor: 0xffffff }), { parent: g });
  const rosto = group(g);
  const olhos = [1, -1].map((sx) => {
    const ol = criarOlho(r * 0.3);
    const d = new THREE.Vector3(sx * 0.33, 0.22, 0.92).normalize();
    ol.g.position.copy(d).multiplyScalar(r * 0.96);
    ol.g.quaternion.setFromUnitVectors(Z, d);
    rosto.add(ol.g);
    return ol;
  });
  const bd = new THREE.Vector3(0, -0.22, 0.97).normalize();
  const bocaG = group(rosto);
  bocaG.position.copy(bd).multiplyScalar(r * 1.0);
  bocaG.quaternion.setFromUnitVectors(Z, bd);
  const linha = mat(0x3a0f1f);
  const sorriso = mesh(new THREE.TorusGeometry(r * 0.22, r * 0.05, 8, 20, Math.PI), linha, { rot: [0, 0, Math.PI], pos: [0, r * 0.08, 0], parent: bocaG });
  const aberta = mesh(new THREE.SphereGeometry(r * 0.17, 16, 12), mat(0x4a1720), { scale: [1, 1.1, 0.4], parent: bocaG });
  g.corpo = corpo;
  g.rosto = (expr = 'feliz', gx = 0, gy = 0) => {
    sorriso.visible = expr === 'feliz' || expr === 'orgulhoso';
    aberta.visible = !sorriso.visible;
    aberta.scale.set(1, expr === 'assustado' ? 1.5 : 1.1, 0.4);
    for (const ol of olhos) {
      ol.lid.scale.set(1, expr === 'orgulhoso' ? 0.55 : 1, 1);
      ol.pupila.scale.setScalar(expr === 'assustado' ? 0.6 : 1);
      ol.pupila.position.set(gx * r * 0.08, gy * r * 0.1, ol.pupila.position.z);
    }
  };
  g.rosto();
  return g;
}

export { brilho };
