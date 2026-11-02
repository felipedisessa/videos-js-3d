// Roteiros dos vídeos. Compartilhado entre o Node (voz/áudio) e o navegador (cenas).
//
// Cada beat vira um trecho de narração + uma cena (função com o mesmo id no módulo do vídeo).
// Cues marcam momentos dentro do beat e servem tanto para efeitos sonoros quanto para animação:
//   número     → segundos desde o início do beat
//   'palavra'  → início da 1ª palavra que começa com esse texto (ignora acento/caixa); 'palavra@2' = 2ª ocorrência
//   '>fim'     → fim da fala do beat
//   '%40'      → 40% da duração do beat
//   qualquer um aceita deslocamento: 'mito+0.1', '>fim-0.2'

export const VIDEOS = {
  chiclete: {
    arquivo: '01 - O que acontece se voce engolir chiclete',
    voz: 'pt-BR-AntonioNeural',
    velocidade: '+7%',
    musica: { bpm: 112, acordes: ['C', 'G', 'Am', 'F'], clima: 'brincalhao' },
    beats: [
      {
        id: 'gancho', texto: 'O que acontece se você engolir um chiclete?', hold: 0.8,
        destaque: ['chiclete'], cues: { estoura: 'chiclete', engole: '>fim+0.1' },
        sfx: [['pop', 'estoura'], ['gulp', 'engole']],
      },
      {
        id: 'avisada', texto: 'Desde criança, todo mundo ouviu que ele fica grudado no estômago por sete anos.',
        destaque: ['estômago', 'sete', 'anos'], cues: { sete: 'sete' },
        sfx: [['whoosh', 0], ['boing', 'sete']],
      },
      {
        id: 'mito', texto: 'Mas isso é mito.', hold: 0.5,
        destaque: ['mito'], cues: { mito: 'mito' },
        sfx: [['buzz', 'mito'], ['stamp', 'mito']],
      },
      {
        id: 'estomago', texto: 'O seu estômago realmente não consegue digerir a goma do chiclete.',
        destaque: ['estômago', 'goma'], cues: {},
        sfx: [['whoosh', 0], ['bubbles', 0.2]],
      },
      {
        id: 'acido', texto: 'O ácido desmancha a comida em volta, mas ele continua inteirinho.',
        destaque: ['ácido', 'inteirinho'], cues: { inteiro: 'inteirinho' },
        sfx: [['bubbles', 0], ['ding', 'inteiro']],
      },
      {
        id: 'intestino', texto: 'Só que ele não fica parado. Os músculos do intestino vão empurrando tudo pra frente.',
        destaque: ['intestino', 'empurrando'], cues: { musculos: 'músculos' },
        sfx: [['whoosh', 0], ['squish', 'musculos'], ['squish', '%62'], ['squish', '%85']],
      },
      {
        id: 'privada', texto: 'E em dois ou três dias, ele sai junto com o resto... você sabe por onde.', hold: 1.1,
        destaque: ['dois', 'três', 'dias'], cues: { dias: 'dois', sabe: 'sabe', descarga: '>fim+0.2' },
        sfx: [['whoosh', 0], ['boing', 'dias'], ['flush', 'descarga']],
      },
      {
        id: 'muitos', texto: 'O perigo é engolir muitos de uma vez.',
        destaque: ['perigo', 'muitos'], cues: { muitos: 'muitos' },
        sfx: [['whoosh', 0], ['pop', 'muitos'], ['pop', 'muitos+0.18'], ['pop', 'muitos+0.36'], ['gulp', '>fim']],
      },
      {
        id: 'hospital', texto: 'Já teve criança que foi parar no hospital com uma bola de chiclete entalada no intestino.',
        destaque: ['hospital', 'entalada'], cues: { hospital: 'hospital', entalada: 'entalada' },
        sfx: [['whoosh', 0], ['alarm', 'hospital'], ['squish', 'entalada']],
      },
      {
        id: 'final', texto: 'Então pode ficar tranquilo... mas não vai fazer disso um hábito, hein?', hold: 1.2,
        destaque: ['tranquilo', 'hábito'], cues: { hein: 'hein' },
        sfx: [['whoosh', 0], ['ding', 'hein']],
      },
    ],
  },

  estalar: {
    arquivo: '02 - O que acontece quando voce estala os dedos',
    voz: 'pt-BR-AntonioNeural',
    velocidade: '+7%',
    musica: { bpm: 100, acordes: ['Dm', 'Bb', 'F', 'C'], clima: 'curioso' },
    beats: [
      {
        id: 'gancho', texto: 'O que acontece quando você estala os dedos?', hold: 0.7,
        destaque: ['estala', 'dedos'], cues: { estala: 'estala', crack: '>fim+0.1' },
        sfx: [['crack', 'estala'], ['crack', 'crack'], ['boom', 'crack', 0.5]],
      },
      {
        id: 'osso', texto: 'Esse barulho não é osso quebrando, nem um osso raspando no outro.',
        destaque: ['quebrando', 'raspando'], cues: { quebrando: 'quebrando', raspando: 'raspando' },
        sfx: [['whoosh', 0], ['buzz', 'quebrando+0.25'], ['buzz', 'raspando+0.25']],
      },
      {
        id: 'liquido', texto: 'Entre os ossos existe uma bolsa cheia de um líquido que lubrifica a articulação: o líquido sinovial.',
        destaque: ['bolsa', 'líquido@2', 'sinovial'], cues: { bolsa: 'bolsa', liquido: 'líquido', sinovial: 'sinovial' },
        sfx: [['bloop', 'bolsa'], ['bubbles', 'liquido'], ['ding', 'sinovial']],
      },
      {
        id: 'bolha', texto: 'Quando você puxa o dedo, a pressão ali dentro cai tão rápido que se forma uma bolha de gás. E é isso que faz o POP!', hold: 0.5,
        destaque: ['pressão', 'bolha', 'pop'], cues: { puxa: 'puxa', bolha: 'bolha', pop: 'pop' },
        sfx: [['stretch', 'puxa'], ['riser', 'bolha-0.6'], ['crack', 'pop'], ['pop', 'pop'], ['boom', 'pop', 0.6]],
      },
      {
        id: 'vinte', texto: 'Por isso, depois de estalar, você precisa esperar uns vinte minutos pra conseguir estalar o mesmo dedo de novo.',
        destaque: ['vinte', 'minutos'], cues: { vinte: 'vinte', novo: 'novo' },
        sfx: [['whoosh', 0], ['tick', 0.1], ['boing', 'vinte'], ['fail', 'novo']],
      },
      {
        id: 'artrite', texto: 'Mas e a fama de que isso causa artrite?',
        destaque: ['artrite'], cues: { artrite: 'artrite' },
        sfx: [['whoosh', 0], ['dun', 'artrite']],
      },
      {
        id: 'medico', texto: 'Um médico americano resolveu testar em si mesmo: por mais de sessenta anos, ele estalou só os dedos da mão esquerda.',
        destaque: ['médico', 'sessenta', 'esquerda'], cues: { sessenta: 'sessenta', estalou: 'estalou', esquerda: 'esquerda' },
        sfx: [['whoosh', 0], ['crack', 'estalou'], ['crack', 'estalou+0.45'], ['crack', 'esquerda'], ['ding', 'esquerda+0.2']],
      },
      {
        id: 'resultado', texto: 'No final, nenhuma das duas mãos tinha artrite. E ele ainda ganhou um prêmio por isso: o Ig Nobel!', hold: 0.8,
        destaque: ['nenhuma', 'prêmio', 'nobel'], cues: { nenhuma: 'nenhuma', artrite: 'artrite', premio: 'prêmio', nobel: 'nobel' },
        sfx: [['ding', 'nenhuma'], ['ding', 'artrite'], ['riser', 'premio-0.8'], ['tada', 'nobel']],
      },
      {
        id: 'final', texto: 'Ou seja: até onde a ciência sabe, estalar não causa artrite. Só não força se doer.', hold: 1.2,
        destaque: ['não', 'artrite', 'doer'], cues: { estalar: 'estalar', doer: 'doer' },
        sfx: [['whoosh', 0], ['crack', 'estalar'], ['ding', 'doer']],
      },
    ],
  },

  buraco: {
    arquivo: '03 - E se voce pulasse num buraco que atravessa a Terra',
    voz: 'pt-BR-AntonioNeural',
    velocidade: '+6%',
    musica: { bpm: 92, acordes: ['Am', 'F', 'C', 'E'], clima: 'misterio' },
    beats: [
      {
        id: 'gancho', texto: 'E se você pulasse num buraco que atravessa a Terra inteira?', hold: 1.0,
        destaque: ['buraco', 'terra'], cues: { pula: '>fim+0.05' },
        sfx: [['wind', 0, 0.35], ['whoosh', 'pula'], ['fall', 'pula+0.15']],
      },
      {
        id: 'queda', texto: 'Saindo do Brasil, você ia cair cada vez mais rápido, puxado pela gravidade.',
        destaque: ['brasil', 'rápido', 'gravidade'], cues: { brasil: 'brasil' },
        sfx: [['whoosh', 0], ['riser', 'cair']],
      },
      {
        id: 'velocidade', texto: 'No centro do planeta, você passaria a mais de 28 mil quilômetros por hora!',
        destaque: ['28', 'mil', 'quilômetros'], cues: { vel: 'w:28' },
        sfx: [['wind', 0, 0.9], ['boom', 'vel']],
      },
      {
        id: 'calor', texto: 'Isso se você aguentasse o calor: o núcleo da Terra passa dos cinco mil graus, quase a temperatura da superfície do Sol.',
        destaque: ['calor', 'cinco', 'mil', 'sol'], cues: { graus: 'cinco', sol: 'sol' },
        sfx: [['sizzle', 0], ['boing', 'graus'], ['ding', 'sol']],
      },
      {
        id: 'freio', texto: 'Depois do centro, a gravidade começa a te frear, até você parar exatamente do outro lado.',
        destaque: ['frear', 'outro', 'lado'], cues: { frear: 'frear', parar: 'parar' },
        sfx: [['whoosh', 0], ['brake', 'frear'], ['ding', 'outro']],
      },
      {
        id: 'tempo', texto: 'A viagem inteira levaria uns 38 minutos.',
        destaque: ['38', 'minutos'], cues: { min: 'w:38' },
        sfx: [['whoosh', 0], ['tick', 0.1], ['boing', 'min']],
      },
      {
        id: 'pacifico', texto: 'E saindo de São Paulo, você apareceria no meio do Oceano Pacífico, a leste de Taiwan.', hold: 0.4,
        destaque: ['pacífico', 'taiwan'], cues: { sai: 'apareceria', taiwan: 'taiwan' },
        sfx: [['splash', 'sai'], ['ding', 'taiwan']],
      },
      {
        id: 'cai', texto: 'E se ninguém te segurar ali... você cai de novo.', hold: 0.3,
        destaque: ['cai'], cues: { cai: 'cai' },
        sfx: [['whoosh', 'cai-0.1'], ['splash', 'cai+0.1']],
      },
      {
        id: 'final', texto: 'E sem o ar pra te frear, ficaria indo e voltando pra sempre.', hold: 1.4,
        destaque: ['indo', 'voltando', 'sempre'], cues: { sempre: 'sempre' },
        sfx: [['whoosh', 0], ['riser', 0.4], ['ding', 'sempre']],
      },
    ],
  },

  lua: {
    arquivo: '04 - E se a Lua sumisse',
    voz: 'pt-BR-AntonioNeural',
    velocidade: '+6%',
    musica: { bpm: 84, acordes: ['Em', 'C', 'G', 'D'], clima: 'misterio' },
    beats: [
      {
        id: 'gancho', texto: 'E se a Lua sumisse do céu agora mesmo?', hold: 0.9,
        destaque: ['lua', 'sumisse'], cues: { some: '>fim+0.05' },
        sfx: [['wind', 0, 0.3], ['pop', 'some'], ['boom', 'some', 0.6]],
      },
      {
        id: 'noite', texto: 'A primeira coisa que você ia notar: as noites ficariam muito mais escuras.',
        destaque: ['noites', 'escuras'], cues: { escuras: 'escuras' },
        sfx: [['whoosh', 0], ['dun', 'escuras']],
      },
      {
        id: 'mares', texto: 'Mas o maior estrago seria nos oceanos. Hoje, é a Lua que puxa a água e faz as marés.',
        destaque: ['oceanos', 'lua', 'marés'], cues: { puxa: 'puxa', mares: 'marés' },
        sfx: [['whoosh', 0], ['bloop', 'puxa'], ['splash', 'mares', 0.5]],
      },
      {
        id: 'fracas', texto: 'Sem ela, só o Sol ia puxar os mares, e as marés ficariam com cerca de um terço da força.',
        destaque: ['sol', 'terço'], cues: { sol: 'sol', terco: 'terço' },
        sfx: [['whoosh', 0], ['ding', 'sol'], ['brake', 'terco']],
      },
      {
        id: 'praia', texto: 'Praias, manguezais e muitos bichos que dependem do sobe e desce da água iam sofrer.',
        destaque: ['bichos', 'sofrer'], cues: { sobe: 'sobe', sofrer: 'sofrer' },
        sfx: [['splash', 0, 0.5], ['fail', 'sofrer']],
      },
      {
        id: 'corais', texto: 'Tem corais que só se reproduzem guiados pela lua cheia. Sem ela, ficariam perdidos.',
        destaque: ['corais', 'cheia', 'perdidos'], cues: { cheia: 'cheia', perdidos: 'perdidos' },
        sfx: [['bubbles', 0], ['ding', 'cheia'], ['dun', 'perdidos']],
      },
      {
        id: 'eixo', texto: 'E o eixo da Terra, que a Lua ajuda a manter firme, poderia balançar muito mais, bagunçando as estações por milhões de anos.',
        destaque: ['eixo', 'balançar', 'estações'], cues: { firme: 'firme', balancar: 'balançar' },
        sfx: [['whoosh', 0], ['ding', 'firme'], ['stretch', 'balancar'], ['riser', 'bagunçando']],
      },
      {
        id: 'final', texto: 'Tudo isso por causa de uma bola de pedra que a gente quase nem repara no céu.', hold: 1.3,
        destaque: ['pedra', 'céu'], cues: { pedra: 'pedra', ceu: 'céu' },
        sfx: [['whoosh', 0], ['pop', 'pedra'], ['ding', 'ceu']],
      },
    ],
  },

  formiga: {
    arquivo: '05 - O que acontece se uma formiga cair de um predio',
    voz: 'pt-BR-AntonioNeural',
    velocidade: '+7%',
    musica: { bpm: 118, acordes: ['F', 'C', 'Dm', 'Bb'], clima: 'brincalhao' },
    beats: [
      {
        id: 'gancho', texto: 'O que acontece se uma formiga cair do alto de um prédio?', hold: 0.8,
        destaque: ['formiga', 'prédio'], cues: { cai: '>fim+0.05' },
        sfx: [['wind', 0, 0.3], ['whoosh', 'cai'], ['fall', 'cai+0.1']],
      },
      {
        id: 'nada', texto: 'Nada. Ela simplesmente sai andando.', hold: 0.5,
        destaque: ['nada', 'andando'], cues: { nada: 'nada', andando: 'andando' },
        sfx: [['pop', 'nada'], ['boing', 'nada+0.05'], ['ding', 'andando']],
      },
      {
        id: 'terminal', texto: 'Tudo por causa da velocidade terminal: o ponto em que o ar segura a queda, e a velocidade para de aumentar.',
        destaque: ['velocidade@1', 'terminal', 'ar'], cues: { ar: 'ar', para: 'para' },
        sfx: [['whoosh', 0], ['wind', 'ar', 0.4], ['ding', 'para']],
      },
      {
        id: 'humano', texto: 'Uma pessoa caindo chega a uns 200 quilômetros por hora.',
        destaque: ['pessoa', '200'], cues: { v: 'w:200' },
        sfx: [['wind', 0, 0.6], ['boom', 'v', 0.5]],
      },
      {
        id: 'gato', texto: 'Um gato, uns 100.', hold: 0.5,
        destaque: ['gato', '100'], cues: { v: 'w:100' },
        sfx: [['boing', 0.05], ['boom', 'v', 0.4]],
      },
      {
        id: 'formiga', texto: 'E uma formiga? Só uns 6 quilômetros por hora, a velocidade de alguém andando rápido.',
        destaque: ['formiga', '6', 'andando'], cues: { v: 'w:6', andando: 'andando' },
        sfx: [['whoosh', 0], ['ding', 'v'], ['pop', 'andando']],
      },
      {
        id: 'porque', texto: 'Quanto menor o bicho, maior a área do corpo em relação ao peso, e mais o ar consegue frear a queda.',
        destaque: ['menor', 'área', 'frear'], cues: { area: 'área', frear: 'frear' },
        sfx: [['whoosh', 0], ['bloop', 'area'], ['brake', 'frear']],
      },
      {
        id: 'final', texto: 'Por isso, pra uma formiga, cair de um prédio é quase como descer um degrau.', hold: 1.3,
        destaque: ['formiga', 'degrau'], cues: { degrau: 'degrau' },
        sfx: [['whoosh', 0], ['boing', 'degrau']],
      },
    ],
  },

  soluco: {
    arquivo: '06 - Por que a gente soluça',
    voz: 'pt-BR-AntonioNeural',
    velocidade: '+7%',
    musica: { bpm: 108, acordes: ['G', 'Em', 'C', 'D'], clima: 'curioso' },
    beats: [
      {
        id: 'gancho', texto: 'Por que a gente soluça do nada?', hold: 1.0,
        destaque: ['soluça', 'nada'], cues: { hic1: 'soluça', hic2: '>fim+0.25' },
        sfx: [['hic', 'hic1'], ['hic', 'hic2']],
      },
      {
        id: 'diafragma', texto: 'Embaixo dos pulmões existe um músculo em forma de cúpula: o diafragma. É ele que puxa o ar quando você respira.',
        destaque: ['pulmões', 'músculo', 'diafragma'], cues: { pulmoes: 'pulmões', cupula: 'cúpula', diafragma: 'diafragma' },
        sfx: [['whoosh', 0], ['ding', 'diafragma']],
      },
      {
        id: 'espasmo', texto: 'No soluço, ele se contrai de repente, sem você mandar, e o ar entra com tudo.',
        destaque: ['contrai', 'repente', 'tudo'], cues: { contrai: 'contrai', ar: 'ar' },
        sfx: [['whoosh', 0], ['boom', 'contrai', 0.5], ['whoosh', 'ar']],
      },
      {
        id: 'cordas', texto: 'Só que, uma fração de segundo depois, as cordas vocais se fecham e barram o ar. É isso que faz o barulho.', hold: 0.4,
        destaque: ['cordas', 'vocais', 'fecham', 'barulho'], cues: { fecham: 'fecham', barulho: 'barulho' },
        sfx: [['whoosh', 0], ['stamp', 'fecham', 0.5], ['hic', 'barulho+0.35']],
      },
      {
        id: 'causas', texto: 'Comer rápido, beber refrigerante ou levar um susto podem irritar os nervos que controlam o diafragma.',
        destaque: ['comer', 'refrigerante', 'susto', 'nervos'], cues: { refri: 'refrigerante', susto: 'susto' },
        sfx: [['pop', 'refri'], ['bubbles', 'refri+0.2'], ['dun', 'susto'], ['hic', '>fim']],
      },
      {
        id: 'recorde', texto: 'O americano Charles Osborne soluçou por 68 anos seguidos. Foram uns 430 milhões de soluços. É o recorde mundial.',
        destaque: ['68', 'anos', '430', 'recorde'], cues: { anos: 'w:68', milhoes: 'w:430', recorde: 'recorde' },
        sfx: [['whoosh', 0], ['hic', 0.6], ['hic', 1.6], ['boing', 'anos'], ['hic', 'milhoes-0.4'], ['tada', 'recorde']],
      },
      {
        id: 'final', texto: 'A boa notícia: o seu provavelmente passa em poucos minutos.', hold: 1.4,
        destaque: ['boa', 'minutos'], cues: { minutos: 'minutos', hic: '>fim+0.7' },
        sfx: [['whoosh', 0], ['ding', 'minutos'], ['hic', 'hic']],
      },
    ],
  },

  espaco: {
    arquivo: '07 - O que acontece se voce gritar no espaco',
    voz: 'pt-BR-AntonioNeural',
    velocidade: '+6%',
    musica: { bpm: 88, acordes: ['Dm', 'Bb', 'Gm', 'A'], clima: 'misterio' },
    beats: [
      {
        id: 'gancho', texto: 'O que acontece se você gritar no espaço?', hold: 1.0,
        destaque: ['gritar', 'espaço'], cues: { grito: '>fim+0.05' },
        sfx: [['wind', 0, 0.2], ['riser', 'grito-0.8']],
      },
      {
        id: 'ninguem', texto: 'Nada. Ninguém escuta. Nem quem estiver do seu lado.', hold: 0.3,
        destaque: ['ninguém', 'lado'], cues: { ninguem: 'ninguém', lado: 'lado' },
        sfx: [['fail', 'lado']],
      },
      {
        id: 'som', texto: 'O som é uma vibração que precisa de alguma coisa pra viajar, como o ar ou a água.',
        destaque: ['som', 'vibração', 'ar', 'água'], cues: { vibracao: 'vibração', ar: 'ar' },
        sfx: [['whoosh', 0], ['beep', 'vibração'], ['beep', 'vibração+0.5'], ['beep', 'ar']],
      },
      {
        id: 'vacuo', texto: 'E o espaço é praticamente vazio. Sem partículas pra vibrar, o som simplesmente não chega.',
        destaque: ['vazio', 'partículas', 'não'], cues: { vazio: 'vazio', chega: 'chega' },
        sfx: [['whoosh', 0], ['brake', 'vazio'], ['dun', 'chega']],
      },
      {
        id: 'capacete', texto: 'Mas tem um detalhe: você ia ouvir o próprio grito, porque dentro do capacete tem ar.',
        destaque: ['próprio', 'grito', 'capacete', 'ar'], cues: { grito: 'grito', capacete: 'capacete' },
        sfx: [['whoosh', 0], ['boom', 'grito', 0.4], ['ding', 'capacete']],
      },
      {
        id: 'radio', texto: 'Por isso os astronautas conversam pelo rádio. As ondas de rádio atravessam o vácuo.',
        destaque: ['rádio', 'ondas', 'vácuo'], cues: { radio: 'rádio', ondas: 'ondas' },
        sfx: [['radio', 'radio'], ['beep', 'ondas'], ['beep', 'ondas+0.4']],
      },
      {
        id: 'encostar', texto: 'Ou então encostam um capacete no outro, e a vibração passa pelo vidro.',
        destaque: ['encostam', 'capacete', 'vidro'], cues: { encostam: 'encostam', vidro: 'vidro' },
        sfx: [['whoosh', 0], ['stamp', 'encostam+0.3', 0.6], ['ding', 'vidro']],
      },
      {
        id: 'final', texto: 'Lá fora, você pode gritar o quanto quiser. Ninguém vai escutar.', hold: 1.4,
        destaque: ['gritar', 'ninguém'], cues: { grito: 'gritar', ninguem: 'ninguém' },
        sfx: [['whoosh', 0], ['riser', 'grito-0.4']],
      },
    ],
  },

  sal: {
    arquivo: '08 - Por que o mar e salgado',
    voz: 'pt-BR-AntonioNeural',
    velocidade: '+7%',
    musica: { bpm: 104, acordes: ['A', 'F#m', 'D', 'E'], clima: 'brincalhao' },
    beats: [
      {
        id: 'gancho', texto: 'Por que o mar é salgado, se os rios são de água doce?', hold: 0.7,
        destaque: ['mar', 'salgado', 'doce'], cues: { prova: 'salgado' },
        sfx: [['splash', 0, 0.4], ['buzz', 'prova+0.3']],
      },
      {
        id: 'chuva', texto: 'Tudo começa com a chuva. Ela é levemente ácida e vai desgastando as rochas, bem devagar.',
        destaque: ['chuva', 'ácida', 'rochas'], cues: { chuva: 'chuva', rochas: 'rochas' },
        sfx: [['chuva', 0], ['squish', 'rochas']],
      },
      {
        id: 'rio', texto: 'Os rios levam esses minerais até o oceano. É pouquinho, mas acontece há bilhões de anos.',
        destaque: ['minerais', 'oceano', 'bilhões'], cues: { minerais: 'minerais', bilhoes: 'bilhões' },
        sfx: [['splash', 0, 0.4], ['bubbles', 'minerais'], ['ding', 'bilhoes']],
      },
      {
        id: 'sol', texto: 'No mar, o sol evapora a água, mas o sal fica pra trás. E vai se acumulando.',
        destaque: ['sol', 'evapora', 'sal', 'acumulando'], cues: { evapora: 'evapora', sal: 'sal' },
        sfx: [['sizzle', 0], ['riser', 'evapora'], ['pop', 'sal'], ['pop', 'sal+0.25']],
      },
      {
        id: 'fontes', texto: 'Tem até sal saindo de rachaduras no fundo do mar, as fontes hidrotermais.',
        destaque: ['fundo', 'fontes', 'hidrotermais'], cues: { fontes: 'fontes' },
        sfx: [['bubbles', 0], ['boom', 'fontes', 0.4], ['ding', 'fontes+0.6']],
      },
      {
        id: 'camada', texto: 'Se tirassem todo o sal dos oceanos e espalhassem pelos continentes, ia formar uma camada de mais de 150 metros.',
        destaque: ['todo', 'sal', 'continentes', '150'], cues: { espalha: 'espalhassem', metros: 'w:150' },
        sfx: [['whoosh', 0], ['riser', 'espalha'], ['boom', 'metros', 0.6]],
      },
      {
        id: 'predio', texto: 'Mais ou menos a altura de um prédio de 40 andares.',
        destaque: ['prédio', '40', 'andares'], cues: { andares: 'w:40' },
        sfx: [['whoosh', 0], ['boing', 'andares']],
      },
      {
        id: 'final', texto: 'Resumindo: o mar é salgado porque a Terra passou bilhões de anos temperando ele.', hold: 1.3,
        destaque: ['salgado', 'temperando'], cues: { tempera: 'temperando' },
        sfx: [['whoosh', 0], ['pop', 'tempera'], ['pop', 'tempera+0.2'], ['pop', 'tempera+0.4'], ['ding', 'tempera+0.7']],
      },
    ],
  },
};
