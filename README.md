# Gerador de vídeos 3D para canal dark

Gera Shorts/TikToks verticais (1080x1920, 30 fps) no estilo **"O que acontece se…?"**: bonequinhos 3D estilo vinil, narração neural em pt-BR, legenda palavra por palavra, trilha e efeitos sonoros sintetizados (sem direitos autorais de terceiros).

Os vídeos prontos vão para `Área de Trabalho\Videos Canal Dark 3D\` (com e sem música).

## Como usar

Precisa do Node 24+ e do Microsoft Edge instalado (já vem no Windows).

```bash
npm install
```

```bash
npm run video -- chiclete
```

| Comando | O que faz |
|---|---|
| `npm run video -- <id>` | Gera o vídeo final (voz → áudio → render → MP4 na Área de Trabalho) |
| `npm run video -- all` | Gera todos os vídeos de `web/roteiros.js` |
| `npm run stills -- <id>` | Só renderiza 3 frames por cena e monta `build/<id>/sheet.jpg` para conferir o visual |
| `npm run audio -- <id>` | Só gera narração, timeline e mixagem (sem render) |

Cada vídeo leva ~1 minuto para renderizar.

## Vídeos já feitos

| id | Tema |
|---|---|
| `chiclete` | O que acontece se você engolir chiclete |
| `estalar` | O que acontece quando você estala os dedos |
| `buraco` | E se você pulasse num buraco que atravessa a Terra |
| `lua` | E se a Lua sumisse |
| `formiga` | O que acontece se uma formiga cair de um prédio |
| `soluco` | Por que a gente soluça |
| `espaco` | O que acontece se você gritar no espaço |
| `sal` | Por que o mar é salgado |

## Como criar um vídeo novo

1. **Roteiro** — adicione uma entrada em `web/roteiros.js` (id, nome do arquivo, voz, música e a lista de *beats*). Cada beat é um trecho de narração + uma cena.
2. **Cenas** — crie `web/videos/<id>.js` exportando `criar(E)`, que monta os objetos 3D e devolve `{ beats: { <idDoBeat>(s) { ... } } }`. Use os vídeos existentes como modelo.
3. Rode `npm run stills -- <id>`, confira `build/<id>/sheet.jpg`, ajuste câmera/enquadramento e repita.
4. Rode `npm run video -- <id>`.

### Roteiro (beats)

```js
{
  id: 'mito', texto: 'Mas isso é mito.', hold: 0.5,       // hold = segundos extras depois da fala
  destaque: ['mito'],                                     // palavras em amarelo na legenda ('palavra@2' = só a 2ª)
  cues: { mito: 'mito' },                                 // momentos nomeados, usados na animação: s.cue('mito')
  sfx: [['buzz', 'mito'], ['stamp', 'mito', 0.8]],        // [efeito, momento, ganho]
}
```

Momentos (cues e sfx): número = segundos desde o início do beat · `'palavra'` = início da palavra · `'w:28'` = palavra que é número · `'>fim'` = fim da fala · `'%40'` = 40% do beat · todos aceitam `+0.2` / `-0.3`.

Efeitos sonoros: `whoosh pop gulp boing buzz stamp bubbles ding squish flush alarm crack boom bloop stretch riser tick fail dun tada wind fall sizzle brake splash hic chuva radio beep`.

Climas de música: `brincalhao`, `curioso`, `misterio` (com `bpm` e `acordes`, ex.: `['Am', 'F', 'C', 'G']`).

### Cena (API do motor, `web/engine.js`)

Cada função de beat recebe `s = { t, T, dur, p, cue(nome), desde(nome), falaFim }` e é **pura em relação ao tempo** (qualquer frame pode ser renderizado isolado — nada de estado acumulado).

- `E.set()` cria um grupo que só aparece quando a cena chama `E.show(grupo)`.
- `E.fundo(topo, base, { chao, chaoCor, near, far, neblina })` — degradê de fundo + chão.
- `E.cam(px, py, pz, alvoX, alvoY, alvoZ, fov, roll)`, `E.tremer(intensidade)`, `E.sombra(x, z, tamanho)`.
- `E.texto3d('7 ANOS', { size, cor })` — texto 3D (Montserrat Black). Largura ≈ 0,85 × size × nº de letras.
- `E.rotulo(pos3d, 'TEXTO', { k, dx, dy, bg })` — etiqueta 2D presa a um ponto 3D.
- `E.desenhar(ctx => ...)` — desenho 2D por cima (use `textoContorno`, `explosao`, `pilula`).
- Luzes por cena: `E.key`, `E.rim`, `E.fill`, `E.hemi`, `E.gtao.enabled`, `E.tint`.

Personagem (`web/bonequinho.js`): `new Boneco({ camisa, calca, cabelo, estilo: 'curto'|'espetado'|'coque'|'longo'|'careca', oculos, bigode, pele })` e `b.update(s.T, pose, rosto)`.
- Poses prontas em `POSES` (idle, cintura, comemorar, maosRosto, maosJuntas, dedoBalanca, sentado, queda, mergulho, nadando…) e `misturar(a, b, k)`.
- Expressões: neutro, sorriso, feliz, surpreso, assustado, triste, bravo, aliviado, dor, confuso, desconfiado, orgulhoso, mastigando, calor. Extras: `boca` (0–1), `pisca: 'L'`, `gx/gy` (olhar), `cheeks`.

Objetos prontos em `web/props.js` (xis, check, placa de aviso, relógio, troféu, confete, estrelas, partículas, bolinha com rosto) e espalhados nos vídeos (Terra com continentes e corte, Lua, oceano, formiga, gato, prédio, nuvem, astronauta…).

### Dicas de enquadramento (tela vertical)

- Com `fov 36`, a área visível a uma distância `d` tem altura ≈ `0,65·d` e largura ≈ `0,37·d`.
- A legenda fica em ~63% da altura: deixe rosto e ação principal entre 20% e 55%.
- Topo (~330 px) é bom para títulos 2D e para o "SIGA PRA MAIS CURIOSIDADES!" no fim.

## Estrutura

```
src/make.mjs       orquestra tudo (CLI)
src/voz.mjs        narração (voz neural do Edge) + tempos de cada palavra + timeline
src/audio.mjs      música e efeitos sintetizados + mixagem com ducking
src/render.mjs     Edge headless (puppeteer) → frames → ffmpeg (H.264)
src/servidor.mjs   servidor estático local para o navegador
web/engine.js      motor de render (Three.js + pós-processamento + camada 2D/legendas)
web/bonequinho.js  personagem
web/props.js       objetos reutilizáveis
web/roteiros.js    roteiros de todos os vídeos
web/videos/*.js    cenas de cada vídeo
build/             cache de voz e arquivos intermediários (pode apagar)
```

## Avisos

- A narração usa a voz do "Ler em voz alta" do Microsoft Edge (`msedge-tts`, precisa de internet). Para canal monetizado, considere regravar com a sua voz ou um TTS com licença comercial.
- YouTube e TikTok penalizam conteúdo repetitivo/em massa: varie temas e roteiros e confira os fatos antes de publicar.
