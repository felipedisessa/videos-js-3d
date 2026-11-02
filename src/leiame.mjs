// Gera o "LEIA-ME" da pasta de saída com título, legenda e hashtags de cada vídeo (a partir dos roteiros).
import fs from 'node:fs';
import path from 'node:path';
import { pastaBuild } from './voz.mjs';

export const NOME_LEIAME = 'LEIA-ME - titulos, legendas e hashtags.txt';
export const PASTA_SEM_MUSICA = 'sem musica (para usar som em alta do TikTok)';

const linha = '-----------------------------------------------------';

// duração do último vídeo final gerado (gravada pelo make.mjs)
function duracao(id) {
  const arq = path.join(pastaBuild(id), 'final.json');
  if (!fs.existsSync(arq)) return '';
  return `  (~${Math.round(JSON.parse(fs.readFileSync(arq, 'utf8')).dur)} s)`;
}

export function textoLeiame(roteiros, saida) {
  const partes = [
    'VÍDEOS CANAL DARK 3D — títulos, legendas e hashtags',
    '=====================================================',
    '',
    'Formato: vertical 1080x1920, 30 fps, narração em pt-BR, legenda palavra por palavra, trilha e efeitos originais.',
    `Na pasta "${PASTA_SEM_MUSICA}" estão as mesmas versões só com narração + efeitos,`,
    'para você colocar um som em alta do TikTok por baixo (deixe o volume do som baixo, ~10-15%).',
    '',
    'Dica de hashtags: use de 3 a 5 por post. Misture 1-2 amplas (#curiosidades, #fy) com 2-3 do assunto do vídeo.',
    'Hashtag "em alta" muda toda semana: antes de postar, confira na busca do TikTok (aba Descobrir) ou no',
    'TikTok Creative Center qual delas está subindo e troque uma das amplas por ela.',
    '',
  ];
  for (const r of Object.values(roteiros)) {
    const p = r.publicacao ?? {};
    const existe = fs.existsSync(path.join(saida, `${r.arquivo}.mp4`));
    partes.push('', linha, `${r.arquivo.split(' - ')[0]} - ${r.titulo}${duracao(r.id)}${existe ? '' : '  [ainda não gerado]'}`, linha);
    partes.push('TIKTOK / REELS — legenda:', p.tiktok ?? '(defina publicacao.tiktok no roteiro)', (p.hashtags ?? []).join(' '), '');
    partes.push('YOUTUBE SHORTS — título:', p.shortsTitulo ?? '', 'Descrição:', p.shortsDescricao ?? '', (p.shortsHashtags ?? []).join(' '), '');
    if (p.reserva?.length) partes.push(`Hashtags reserva: ${p.reserva.join(' ')}`);
  }
  partes.push(
    '',
    '',
    linha,
    'DICAS DE POSTAGEM',
    linha,
    '- Os vídeos terminam emendando no começo (loop): isso ajuda a aumentar o tempo de exibição.',
    '- Poste um por dia, de preferência entre 18h e 21h, e responda os primeiros comentários.',
    '- Fixe um comentário com uma pergunta ("Você sabia disso?") para puxar engajamento.',
    '- YouTube e TikTok penalizam conteúdo repetitivo/em massa: varie temas e roteiros e confira os fatos.',
    '- A narração é uma voz sintética (TTS). Se a plataforma pedir, marque "conteúdo gerado/alterado por IA".',
    '',
  );
  return partes.join('\n');
}

export function escreverLeiame(roteiros, saida) {
  fs.mkdirSync(saida, { recursive: true });
  const arq = path.join(saida, NOME_LEIAME);
  fs.writeFileSync(arq, textoLeiame(roteiros, saida), 'utf8');
  return arq;
}
