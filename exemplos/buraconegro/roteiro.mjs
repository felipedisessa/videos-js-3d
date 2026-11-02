// Roteiro: O que acontece se você cair num buraco negro. Formato documentado em src/roteiros.mjs e no README.
// Física: espaguetificação (força de maré) em buracos negros estelares; em supermassivos (Sgr A*, ~4 milhões de sóis)
// a maré no horizonte é fraca; observador distante vê quem cai ficar lento, avermelhado e sumir.
export default {
  ordem: 10,
  titulo: 'O que acontece se você cair num buraco negro',
  arquivo: '10 - O que acontece se voce cair num buraco negro',
  velocidade: '+6%',
  musica: { bpm: 84, acordes: ['Em', 'C', 'Am', 'B'], clima: 'misterio' },
  publicacao: {
    tiktok: 'Cair num buraco negro: você vira MACARRÃO 🍝🕳️ (é sério)',
    hashtags: ['#curiosidades', '#vocesabia', '#buraconegro', '#espaco', '#ciencia'],
    shortsTitulo: 'Caí num buraco negro 🕳️ #shorts #curiosidades #espaco',
    shortsDescricao: 'Num buraco negro pequeno você seria esticado como macarrão (espaguetificação). Num gigante, cruzaria a borda sem sentir nada... e pra quem ficou de fora, você nunca terminaria de cair.',
    shortsHashtags: ['#curiosidades', '#vocesabia', '#astronomia', '#fisica', '#animacao3d'],
    reserva: ['#fatoscuriosos', '#universo', '#oquaconteceria', '#nasa', '#fy', '#fyp', '#viral'],
  },
  beats: [
    {
      id: 'gancho',
      texto: 'O que acontece se você cair num buraco negro?',
      hold: 0.9,
      destaque: ['cair', 'buraco', 'negro'],
      cues: { puxa: '>fim' },
      sfx: [['wind', 0, 0.3], ['riser', 'puxa-0.6'], ['boom', 'puxa', 0.6]],
    },
    {
      id: 'luz',
      texto: 'Perto dele, a gravidade é tão forte que nem a luz consegue escapar.',
      destaque: ['gravidade', 'luz'],
      cues: { luz: 'luz' },
      sfx: [['whoosh', 0], ['brake', 'luz'], ['dun', 'escapar']],
    },
    {
      id: 'espaguete',
      texto: 'Num buraco negro pequeno, seus pés seriam puxados bem mais forte que a cabeça. Você seria esticado como um macarrão.',
      destaque: ['pés', 'cabeça', 'macarrão'],
      cues: { pes: 'pés', macarrao: 'macarrão' },
      sfx: [['whoosh', 0], ['stretch', 'pes'], ['stretch', 'macarrao-0.3'], ['boing', 'macarrao']],
    },
    {
      id: 'nome',
      texto: 'Os cientistas chamam isso de espaguetificação. É sério.',
      hold: 0.4,
      destaque: ['espaguetificação', 'sério'],
      cues: { nome: 'espaguetificação' },
      sfx: [['ding', 'nome'], ['pop', 'sério']],
    },
    {
      id: 'gigante',
      texto: 'Mas num buraco negro gigante, como o do centro da nossa galáxia, você passaria pela borda sem sentir nada.',
      destaque: ['gigante', 'galáxia', 'nada'],
      cues: { gigante: 'gigante', borda: 'borda' },
      sfx: [['whoosh', 0], ['boom', 'gigante', 0.5], ['ding', 'nada']],
    },
    {
      id: 'observador',
      texto: 'E pra quem estivesse olhando de longe, você ia parecer ficar cada vez mais lento, mais vermelho, até sumir.',
      destaque: ['lento', 'vermelho', 'sumir'],
      cues: { lento: 'lento', vermelho: 'vermelho', sumir: 'sumir' },
      sfx: [['tick', 'lento-0.5', 0.5], ['brake', 'lento'], ['riser', 'sumir-0.6'], ['pop', 'sumir']],
    },
    {
      id: 'final',
      texto: 'Pra quem ficou do lado de fora, você nunca terminaria de cair.',
      hold: 1.3,
      destaque: ['nunca', 'cair'],
      cues: { nunca: 'nunca' },
      sfx: [['whoosh', 0], ['dun', 'nunca']],
    },
  ],
};
