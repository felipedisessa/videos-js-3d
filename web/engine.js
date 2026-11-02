// Motor de render: cena Three.js + pós-processamento + camada 2D (legendas, rótulos, efeitos).
// Tudo é função do tempo T, então qualquer frame pode ser renderizado em qualquer ordem.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { TTFLoader } from 'three/addons/loaders/TTFLoader.js';
import { Font } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

export { THREE };
export const W = 1080;
export const H = 1920;

// ---------- utilitários de animação ----------
export const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const lerp = (a, b, k) => a + (b - a) * k;
export const seg = (t, a, b) => clamp01((t - a) / (b - a));
export const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
export const easeOut = (x) => 1 - Math.pow(1 - clamp01(x), 3);
export const easeIn = (x) => Math.pow(clamp01(x), 3);
export const easeInOut = (x) => { x = clamp01(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const back = (x) => { x = clamp01(x); const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
export const elastic = (x) => {
  x = clamp01(x);
  if (x === 0 || x === 1) return x;
  return Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
};
// sobe e desce (0→1→0) dentro de [a, a+d]
export const pulse = (t, a, d) => (t >= a && t <= a + d ? Math.sin((Math.PI * (t - a)) / d) : 0);
// ruído suave determinístico em [-1, 1]
export const wob = (x) => Math.sin(x * 1.31) * 0.5 + Math.sin(x * 2.73 + 1.3) * 0.3 + Math.sin(x * 5.17 + 2.1) * 0.2;
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- materiais e malhas ----------
export function mat(color, o = {}) {
  return new THREE.MeshPhysicalMaterial({ color, roughness: 0.5, metalness: 0, clearcoat: 0.25, clearcoatRoughness: 0.35, ...o });
}
export function brilho(color, intensidade = 2, o = {}) {
  return new THREE.MeshStandardMaterial({ color: 0x000000, emissive: color, emissiveIntensity: intensidade, roughness: 1, ...o });
}
export function vidro(color, opacidade = 0.35, o = {}) {
  return new THREE.MeshPhysicalMaterial({
    color, roughness: 0.08, metalness: 0, clearcoat: 1, transparent: true, opacity: opacidade, depthWrite: false, ...o,
  });
}
export function mesh(geo, material, o = {}) {
  const m = new THREE.Mesh(geo, material);
  if (o.pos) m.position.set(...o.pos);
  if (o.rot) m.rotation.set(...o.rot);
  if (o.scale !== undefined) Array.isArray(o.scale) ? m.scale.set(...o.scale) : m.scale.setScalar(o.scale);
  m.castShadow = o.sombra ?? true;
  m.receiveShadow = o.recebe ?? true;
  if (o.parent) o.parent.add(m);
  return m;
}
export const group = (parent, pos) => {
  const g = new THREE.Group();
  if (pos) g.position.set(...pos);
  if (parent) parent.add(g);
  return g;
};
export function escurecer(hex, k = 0.6) {
  const c = new THREE.Color(hex);
  return c.multiplyScalar(k).getHex();
}

// ---------- desenho 2D ----------
export const FONTE = 'Montserrat';

export function textoContorno(ctx, txt, x, y, o = {}) {
  const size = o.size ?? 90;
  ctx.save();
  ctx.translate(x, y);
  if (o.rot) ctx.rotate(o.rot);
  if (o.scale !== undefined) ctx.scale(o.scale, o.scale);
  ctx.font = `${o.weight ?? 900} ${size}px ${FONTE}`;
  ctx.textAlign = o.align ?? 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  if (o.sombra !== false) {
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth = size * (o.contorno ?? 0.22);
    ctx.strokeText(txt, 0, size * 0.09);
  }
  ctx.strokeStyle = o.corContorno ?? '#000';
  ctx.lineWidth = size * (o.contorno ?? 0.22);
  ctx.strokeText(txt, 0, 0);
  ctx.fillStyle = o.cor ?? '#fff';
  ctx.fillText(txt, 0, 0);
  ctx.restore();
}

// Balão estilo gibi ("CRACK!", "POP!")
export function explosao(ctx, x, y, txt, k, o = {}) {
  if (k <= 0) return;
  const r = (o.r ?? 190) * k;
  const pontas = o.pontas ?? 14;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(o.rot ?? -0.12);
  ctx.beginPath();
  for (let i = 0; i < pontas * 2; i++) {
    const a = (i / (pontas * 2)) * Math.PI * 2;
    const rr = i % 2 ? r * 0.62 : r * (0.95 + 0.08 * Math.sin(i * 7.3));
    ctx.lineTo(Math.cos(a) * rr * 1.25, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.lineJoin = 'round';
  ctx.lineWidth = 16 * k;
  ctx.strokeStyle = '#111';
  ctx.fillStyle = o.cor ?? '#ffd400';
  ctx.stroke();
  ctx.fill();
  ctx.restore();
  textoContorno(ctx, txt, x, y, { size: (o.size ?? 92) * k, rot: o.rot ?? -0.12, cor: o.corTexto ?? '#ff3b30', contorno: 0.2 });
}

// ---------- motor ----------
export class Engine {
  constructor() {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const r = (this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' }));
    r.setPixelRatio(1);
    r.setSize(W, H, false);
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFShadowMap;
    r.toneMapping = THREE.NeutralToneMapping;
    r.localClippingEnabled = true;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(36, W / H, 0.05, 500);

    const pmrem = new THREE.PMREMGenerator(r);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    this.hemi = new THREE.HemisphereLight(0xffffff, 0x8f8478, 0.9);
    this.key = new THREE.DirectionalLight(0xfff1de, 2.6);
    this.key.castShadow = true;
    this.key.shadow.mapSize.set(2048, 2048);
    this.key.shadow.bias = -0.0004;
    this.key.shadow.normalBias = 0.03;
    this.key.shadow.radius = 4;
    this.rim = new THREE.DirectionalLight(0xc4dcff, 1.5);
    this.fill = new THREE.DirectionalLight(0xffffff, 0.45);
    this.scene.add(this.hemi, this.key, this.key.target, this.rim, this.fill);

    // fundo em degradê
    this.bgMat = new THREE.ShaderMaterial({
      uniforms: { top: { value: new THREE.Color() }, bottom: { value: new THREE.Color() }, mid: { value: 0 } },
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform vec3 top; uniform vec3 bottom; uniform float mid; varying vec3 vP;
        void main(){ float h = smoothstep(-0.35, 0.75, vP.y - mid); gl_FragColor = vec4(mix(bottom, top, h), 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        }`,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
    });
    this.bg = new THREE.Mesh(new THREE.SphereGeometry(200, 32, 16), this.bgMat);
    this.bg.frustumCulled = false;
    this.bg.renderOrder = -10;
    this.scene.add(this.bg);

    this.floorMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92 });
    this.floor = mesh(new THREE.CircleGeometry(90, 72), this.floorMat, { rot: [-Math.PI / 2, 0, 0], sombra: false });
    this.scene.add(this.floor);
    this.scene.fog = new THREE.Fog(0xffffff, 18, 60);

    // pós-processamento
    const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
    this.composer = new EffectComposer(r, rt);
    this.composer.setPixelRatio(1);
    this.composer.setSize(W, H);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.gtao = new GTAOPass(this.scene, this.camera, W, H);
    this.gtao.updateGtaoMaterial({ radius: 0.5, distanceExponent: 2, thickness: 2, scale: 1.1, samples: 16 });
    this.gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 5, rings: 2, samples: 16 });
    this.composer.addPass(this.gtao);
    this.bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.3, 0.5, 0.92);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    this.out = document.createElement('canvas');
    this.out.width = W;
    this.out.height = H;
    this.ctx = this.out.getContext('2d');

    this.sets = [];
    this._v = new THREE.Vector3();
  }

  async init() {
    const buf = await fetch('/node_modules/@fontsource/montserrat/files/montserrat-latin-900-normal.woff').then((r) => r.arrayBuffer());
    this.font = new Font(new TTFLoader().parse(buf));
  }

  // Grupo que só aparece quando a cena do beat chama show()
  set() {
    const g = new THREE.Group();
    g.visible = false;
    this.scene.add(g);
    this.sets.push(g);
    return g;
  }
  show(g) { g.visible = true; return g; }

  texto3d(str, o = {}) {
    const geo = new TextGeometry(str, {
      font: this.font, size: o.size ?? 0.6, depth: o.depth ?? 0.2, curveSegments: 8,
      bevelEnabled: true, bevelThickness: o.bevel ?? 0.03, bevelSize: (o.bevel ?? 0.03) * 0.8, bevelSegments: 3,
    });
    geo.center();
    const cor = o.cor ?? 0xffd23f;
    const frente = mat(cor, { roughness: 0.3, clearcoat: 0.8, emissive: cor, emissiveIntensity: o.emissivo ?? 0.12 });
    const lado = mat(o.lado ?? escurecer(cor, 0.55), { roughness: 0.4, clearcoat: 0.4 });
    return mesh(geo, [frente, lado], { recebe: false });
  }

  cam(px, py, pz, tx, ty, tz, fov = 36, roll = 0) {
    const c = this.camera;
    c.position.set(px, py, pz);
    c.up.set(Math.sin(roll), Math.cos(roll), 0);
    c.lookAt(tx, ty, tz);
    if (c.fov !== fov) { c.fov = fov; c.updateProjectionMatrix(); }
    this._alvo = [tx, ty, tz];
  }
  tremer(q) { this._shake = Math.max(this._shake, q); }

  fundo(top, bottom, o = {}) {
    this.bgMat.uniforms.top.value.set(top);
    this.bgMat.uniforms.bottom.value.set(bottom);
    this.bgMat.uniforms.mid.value = o.mid ?? 0;
    this.floor.visible = o.chao !== false;
    this.floorMat.color.set(o.chaoCor ?? bottom);
    this.scene.fog.color.set(o.neblina ?? bottom);
    this.scene.fog.near = o.near ?? 18;
    this.scene.fog.far = o.far ?? 60;
  }

  sombra(cx = 0, cz = 0, tam = 7) {
    const k = this.key;
    k.position.set(cx + 4, 9, cz + 7);
    k.target.position.set(cx, 0, cz);
    const s = k.shadow.camera;
    if (s.right !== tam) {
      s.left = -tam; s.right = tam; s.top = tam; s.bottom = -tam; s.near = 0.5; s.far = 40;
      s.updateProjectionMatrix();
    }
  }

  resetFrame() {
    for (const g of this.sets) g.visible = false;
    this.fundo(0xfff4e6, 0xf6d7b8);
    this.sombra();
    this.key.intensity = 2.6;
    this.key.color.set(0xfff1de);
    this.rim.position.set(-6, 5, -7);
    this.rim.intensity = 1.5;
    this.rim.color.set(0xc4dcff);
    this.fill.position.set(-6, 2, 6);
    this.fill.intensity = 0.45;
    this.hemi.intensity = 0.9;
    this.scene.environmentIntensity = 0.55;
    this.renderer.toneMappingExposure = 1.0;
    // o UnrealBloomPass gera frames com alfa zerado neste driver; o brilho vem dos materiais emissivos
    this.bloom.enabled = false;
    this.bloom.strength = 0;
    this.bloom.threshold = 1.6;
    this.bloom.radius = 0.5;
    this.gtao.enabled = true;
    this.gtao.blendIntensity = 0.85;
    this._shake = 0;
    this.draws = [];
    this.rotulos = [];
    this.tint = null;
    this.legenda = true;
    this.cam(0, 1.6, 7, 0, 1.2, 0, 36);
  }

  // Rótulo 2D preso a um ponto 3D
  rotulo(pos, txt, o = {}) { this.rotulos.push({ pos: pos.clone ? pos.clone() : new THREE.Vector3(...pos), txt, o }); }
  desenhar(fn) { this.draws.push(fn); }

  projetar(v) {
    this._v.copy(v).project(this.camera);
    return [(this._v.x * 0.5 + 0.5) * W, (-this._v.y * 0.5 + 0.5) * H, this._v.z];
  }

  setup(tl, video) {
    this.tl = tl;
    this.video = video;
    for (const b of tl.beats) {
      // o TTS às vezes devolve "200 quilômetros por hora" como uma palavra só: separa para a legenda caber
      b.words = b.words.flatMap((w) => {
        const partes = w.txt.split(' ').filter(Boolean);
        if (partes.length < 2) return [w];
        const total = partes.reduce((a, p) => a + p.length, 0);
        let s0 = w.s;
        return partes.map((p) => {
          const d = ((w.e - w.s) * p.length) / total;
          const out = { ...w, txt: p, s: s0, e: s0 + d };
          s0 += d;
          return out;
        });
      });
      b.blocos = blocosLegenda(b);
    }
  }

  frame(T, qualidade = 0.92) {
    const tl = this.tl;
    let i = tl.beats.findIndex((b) => T >= b.start && T < b.start + b.dur);
    if (i < 0) i = T < tl.beats[0].start ? 0 : tl.beats.length - 1;
    const b = tl.beats[i];
    const t = T - b.start;
    this.resetFrame();
    const s = {
      E: this, T, t, dur: b.dur, p: t / b.dur, id: b.id, i, beat: b,
      cue: (n) => b.cues[n] ?? 0,
      desde: (n) => t - (b.cues[n] ?? 0),
      falaFim: b.falaFim,
    };
    this.video.beats[b.id](s);

    if (this._shake > 0) {
      const q = this._shake;
      const c = this.camera;
      c.position.x += wob(T * 37) * 0.08 * q;
      c.position.y += wob(T * 41 + 3) * 0.08 * q;
      c.rotateZ(wob(T * 29 + 7) * 0.025 * q);
    }

    this.composer.render();
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.drawImage(this.renderer.domElement, 0, 0);
    if (this.tint) {
      ctx.fillStyle = this.tint;
      ctx.fillRect(0, 0, W, H);
    }
    this.vinheta(ctx);
    for (const r of this.rotulos) this.desenharRotulo(ctx, r);
    for (const fn of this.draws) { ctx.save(); fn(ctx); ctx.restore(); }
    if (this.legenda) desenharLegenda(ctx, b, t);
    return this.out.toDataURL('image/jpeg', qualidade);
  }

  vinheta(ctx) {
    if (!this._vin) {
      const g = ctx.createRadialGradient(W / 2, H * 0.46, H * 0.28, W / 2, H * 0.5, H * 0.72);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,0.32)');
      this._vin = g;
    }
    ctx.fillStyle = this._vin;
    ctx.fillRect(0, 0, W, H);
  }

  desenharRotulo(ctx, { pos, txt, o }) {
    const [x, y, z] = this.projetar(pos);
    if (z > 1) return;
    const k = o.k ?? 1;
    if (k <= 0.001) return;
    const size = (o.size ?? 46) * (0.6 + 0.4 * back(k));
    const dx = o.dx ?? 0;
    const dy = o.dy ?? -110;
    ctx.save();
    ctx.globalAlpha = clamp01(k * 1.5);
    ctx.font = `900 ${size}px ${FONTE}`;
    const w = ctx.measureText(txt).width + size * 1.1;
    const h = size * 1.55;
    const lx = x + dx;
    const ly = y + dy;
    if (o.linha !== false) {
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 9;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(lx, ly); ctx.stroke();
      ctx.strokeStyle = o.bg ?? '#fff';
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(lx, ly); ctx.stroke();
      ctx.fillStyle = o.bg ?? '#fff';
      ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 5; ctx.strokeStyle = '#111'; ctx.stroke();
    }
    ctx.translate(lx, ly);
    ctx.rotate(o.rot ?? 0);
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, h / 2);
    ctx.fillStyle = o.bg ?? '#fff';
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#111';
    ctx.stroke();
    ctx.fill();
    ctx.fillStyle = o.cor ?? '#111';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(txt, 0, size * 0.04);
    ctx.restore();
  }
}

// ---------- legendas ----------
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

function blocosLegenda(b) {
  const blocos = [];
  let atual = null;
  b.words.forEach((w, i) => {
    const prev = b.words[i - 1];
    const quebra = !atual || atual.words.length >= 3 || atual.chars + w.txt.length > 17 || (prev && /[.,?!:;…]$/.test(prev.txt)) || (prev && w.s - prev.e > 0.35);
    if (quebra) {
      atual = { words: [], chars: 0, s: w.s };
      blocos.push(atual);
    }
    atual.words.push(w);
    atual.chars += w.txt.length + 1;
  });
  blocos.forEach((bl, i) => {
    const ultimo = bl.words[bl.words.length - 1];
    const prox = blocos[i + 1];
    bl.e = prox ? prox.s : Math.min(b.dur, ultimo.e + 0.6);
  });
  return blocos;
}

function desenharLegenda(ctx, b, t) {
  const bl = b.blocos.find((x) => t >= x.s && t < x.e);
  if (!bl) return;
  const k = back(seg(t, bl.s, bl.s + 0.16));
  let size = 104;
  const txts = bl.words.map((w) => w.txt.toUpperCase().replace(/[,;:]$/, ''));
  ctx.font = `900 ${size}px ${FONTE}`;
  const gap = size * 0.46;
  const larg = (sz) => txts.reduce((a, s) => a + ctx.measureText(s).width * (sz / size), 0) + gap * (sz / size) * (txts.length - 1);
  const max = 900;
  let total = larg(size);
  if (total > max) { size = Math.max(70, size * (max / total) * 0.98); }
  ctx.font = `900 ${size}px ${FONTE}`;
  const g = size * 0.46;
  const ws = txts.map((s) => ctx.measureText(s).width);
  // se ainda não couber, quebra em duas linhas
  let linhas = [[0, txts.length]];
  total = ws.reduce((a, x) => a + x, 0) + g * (txts.length - 1);
  if (total > max + 2 && txts.length > 1) {
    const m = Math.ceil(txts.length / 2);
    linhas = [[0, m], [m, txts.length]];
  }
  const cy = H * 0.635;
  const lh = size * 1.12;
  ctx.save();
  ctx.translate(W / 2, cy);
  ctx.scale(k, k);
  ctx.translate(-W / 2, -cy);
  linhas.forEach(([a, z], li) => {
    const lw = ws.slice(a, z).reduce((acc, x) => acc + x, 0) + g * (z - a - 1);
    let x = W / 2 - lw / 2;
    const y = cy + (li - (linhas.length - 1) / 2) * lh;
    for (let j = a; j < z; j++) {
      const w = bl.words[j];
      const ativo = t >= w.s && (t < w.e + 0.08 || j === bl.words.length - 1 || t < bl.words[j + 1].s);
      const cor = ativo ? '#5CFF72' : w.destaque ? '#FFE135' : '#FFFFFF';
      const esc = ativo ? 1.06 : 1;
      textoContorno(ctx, txts[j], x + ws[j] / 2, y, { size, scale: esc, cor });
      x += ws[j] + g;
    }
  });
  ctx.restore();
}
