// Carrega e valida os roteiros (um arquivo por vídeo em roteiros/<id>.mjs).
//
// Cada roteiro:
//   ordem, titulo, arquivo (nome do MP4), velocidade ('+7%' ou 1.07), musica { bpm, acordes, clima },
//   vozes? { <provedor>: id } (voz específica deste vídeo), publicacao { tiktok, hashtags, shortsTitulo, ... },
//   beats: [{ id, texto, hold?, pre?, post?, destaque?, cues?, sfx? }]
//
// Cada beat vira um trecho de narração + uma cena (função com o mesmo id em web/videos/<id>.js).
// Momentos (cues e sfx) aceitam:
//   número     → segundos desde o início do beat
//   'palavra'  → início da 1ª palavra que começa com esse texto (ignora acento/caixa); 'palavra@2' = 2ª ocorrência
//   'w:28'     → idem, para palavras que são números (sem o prefixo seria lido como segundos)
//   '>fim'     → fim da fala do beat
//   '%40'      → 40% da duração do beat
//   todos aceitam deslocamento: 'mito+0.1', '>fim-0.2'; e podem citar outra cue pelo nome.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ, fatorVelocidade } from './config.mjs';

export const PASTA_ROTEIROS = path.join(RAIZ, 'roteiros');
const CLIMAS = ['brincalhao', 'curioso', 'misterio'];

/** @returns {Promise<Record<string, object>>} roteiros por id, na ordem de `ordem` */
export async function carregarRoteiros() {
  const arquivos = fs.readdirSync(PASTA_ROTEIROS).filter((f) => f.endsWith('.mjs'));
  const lista = [];
  for (const f of arquivos) {
    const id = path.basename(f, '.mjs');
    const mod = await import(pathToFileURL(path.join(PASTA_ROTEIROS, f)).href);
    lista.push({ id, ...mod.default });
  }
  lista.sort((a, b) => (a.ordem ?? 999) - (b.ordem ?? 999) || a.id.localeCompare(b.id));
  return Object.fromEntries(lista.map((r) => [r.id, r]));
}

/** Confere se web/videos/<id>.js existe e tem uma função para cada beat. */
export function verificarCenas(r) {
  const arq = path.join(RAIZ, 'web', 'videos', `${r.id}.js`);
  if (!fs.existsSync(arq)) return [`${r.id}: falta o arquivo de cenas web/videos/${r.id}.js (crie com npm run novo)`];
  const src = fs.readFileSync(arq, 'utf8');
  return r.beats.filter((b) => !new RegExp(`\\b${b.id}\\s*\\(\\s*s\\s*\\)\\s*\\{`).test(src)).map((b) => `${r.id}: web/videos/${r.id}.js não tem a cena "${b.id}(s) { ... }"`);
}

/** Lista de problemas encontrados no roteiro (vazia = ok). */
export function validarRoteiro(r, { efeitos = [] } = {}) {
  const erros = [];
  const e = (msg) => erros.push(`${r.id}: ${msg}`);
  if (!/^[a-z0-9-]+$/.test(r.id)) e('id deve ter só letras minúsculas, números e hífen');
  if (!r.titulo) e('falta "titulo"');
  if (!r.arquivo) e('falta "arquivo"');
  try {
    fatorVelocidade(r.velocidade);
  } catch (x) {
    e(x.message);
  }
  if (!r.musica || !CLIMAS.includes(r.musica.clima)) e(`musica.clima deve ser um de: ${CLIMAS.join(', ')}`);
  if (!Array.isArray(r.musica?.acordes) || !r.musica.acordes.length) e('musica.acordes vazio');
  if (!Array.isArray(r.beats) || !r.beats.length) e('sem beats');
  const ids = new Set();
  for (const b of r.beats ?? []) {
    if (!b.id || !/^[a-zA-Z_]\w*$/.test(b.id)) e(`beat com id inválido: "${b.id}"`);
    if (ids.has(b.id)) e(`beat repetido: ${b.id}`);
    ids.add(b.id);
    if (!b.texto?.trim()) e(`beat ${b.id} sem texto`);
    for (const s of b.sfx ?? []) {
      if (!Array.isArray(s) || s.length < 2) e(`beat ${b.id}: sfx deve ser [efeito, momento, ganho?]`);
      else if (efeitos.length && !efeitos.includes(s[0])) e(`beat ${b.id}: efeito sonoro desconhecido "${s[0]}"`);
    }
  }
  return erros;
}
