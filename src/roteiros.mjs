// Carrega e valida os vídeos. Cada vídeo é uma pasta com roteiro.mjs (texto, tempos, efeitos) e cenas.js (3D):
//   exemplos/<id>/   versionados no git, servem de modelo
//   projetos/<id>/   os vídeos do usuário, fora do git (pasta configurável com PROJETOS_DIR)
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
import { RAIZ, fatorVelocidade, pastaProjetos } from './config.mjs';

export const PASTA_EXEMPLOS = path.join(RAIZ, 'exemplos');
const CLIMAS = ['brincalhao', 'curioso', 'misterio'];

async function lerPasta(base, origem, urlBase) {
  if (!fs.existsSync(base)) return [];
  const lista = [];
  for (const id of fs.readdirSync(base)) {
    const arq = path.join(base, id, 'roteiro.mjs');
    if (!fs.existsSync(arq)) continue;
    const mod = await import(pathToFileURL(arq).href);
    lista.push({ ...mod.default, id, origem, pasta: path.join(base, id), urlCenas: `${urlBase}/${encodeURIComponent(id)}/cenas.js` });
  }
  return lista;
}

/**
 * @param {{ exemplos?: boolean }} op exemplos=false deixa só os projetos do usuário
 * @returns {Promise<Record<string, object>>} vídeos por id, na ordem de `ordem` (um projeto com o mesmo id de um exemplo o substitui)
 */
export async function carregarRoteiros({ exemplos = true } = {}) {
  const porId = new Map();
  if (exemplos) for (const r of await lerPasta(PASTA_EXEMPLOS, 'exemplo', '/exemplos')) porId.set(r.id, r);
  for (const r of await lerPasta(pastaProjetos(), 'projeto', '/projetos')) porId.set(r.id, r);
  const lista = [...porId.values()].sort((a, b) => (a.ordem ?? 999) - (b.ordem ?? 999) || a.id.localeCompare(b.id));
  return Object.fromEntries(lista.map((r) => [r.id, r]));
}

/** Confere se <pasta>/cenas.js existe e tem uma função para cada beat. */
export function verificarCenas(r) {
  const arq = path.join(r.pasta, 'cenas.js');
  const rel = path.relative(RAIZ, arq);
  if (!fs.existsSync(arq)) return [`${r.id}: falta o arquivo de cenas ${rel} (crie com npm run novo)`];
  const src = fs.readFileSync(arq, 'utf8');
  return r.beats.filter((b) => !new RegExp(`\\b${b.id}\\s*\\(\\s*s\\s*\\)\\s*\\{`).test(src)).map((b) => `${r.id}: ${rel} não tem a cena "${b.id}(s) { ... }"`);
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
