# CLAUDE.md

Ferramenta genérica para gerar Shorts/TikToks 3D "O que acontece se…?". O repositório guarda só a ferramenta (motor, vozes, biblioteca de peças, 2 exemplos); os vídeos do usuário ficam em `projetos/` (fora do git, ou em `PROJETOS_DIR`) e **não devem ser commitados**. O `README.md` documenta comandos, vozes, formato do roteiro, API do motor, personagens e props: leia antes de mexer.

## Fluxo para criar vídeos novos

1. Escolha temas inéditos (veja `projetos/` e o LEIA-ME da pasta de saída) com fatos verificáveis: pesquise e confira números; nada de conselho de saúde arriscado.
2. `npm run novo -- <id> "Título"` e escreva `projetos/<id>/roteiro.mjs`, incluindo `publicacao` (legenda, hashtags, título e descrição do Shorts).
3. `npm run audio -- <id>` e confira `build/<id>/timeline.json` (o TTS às vezes junta "200 quilômetros por hora" numa palavra; use `'w:200'` em cues numéricas).
4. Monte `projetos/<id>/cenas.js` com as peças de `web/props.js` e `web/biblioteca/` (imports absolutos: `/web/...`). Peça nova que sirva para outros vídeos vai para a biblioteca (isso sim é commitado).
5. `npm run stills -- <id>` e **olhe** `build/<id>/sheet.jpg` (3 frames por cena). Itere até nada ficar cortado e a ação ficar acima da legenda.
6. `npm run video -- <id>`. O MP4 e o LEIA-ME saem na pasta de saída (padrão: `Desktop/Videos Canal Dark 3D`).
7. `npm run check` antes de commitar.

## Vozes

Provedores em `src/tts/` (edge, piper, sistema, azure, elevenlabs), escolhidos por `--tts` ou `TTS_PROVEDOR`. Quem não informa o tempo das palavras passa por `src/tts/alinhamento.mjs` (estimativa por pausas + sílabas, erro mediano ~70 ms). O cache em `build/<id>/voz` usa provedor+voz+velocidade+texto como chave.

## Armadilhas conhecidas

- **Não use o UnrealBloomPass**: neste PC (Edge headless + ANGLE d3d11, RX 580) ele gera frames com alfa zerado e o frame anterior "vaza" no vídeo. O bloom fica desligado; brilho vem de materiais emissivos e sprites aditivos.
- **sherpa-onnx-node fica na 1.13.x**: a 2.x removeu o fonetizador espeak embutido e as vozes Piper param de funcionar.
- Sprites/halos e transparências escurecem com o GTAO ligado: use `E.gtao.enabled = false` nessas cenas.
- `InstancedMesh` cujas instâncias começam fora da tela precisa de `frustumCulled = false` (a esfera envolvente é calculada uma vez só).
- Cenas devem ser funções puras do tempo (nada de `+=` entre frames); objetos compartilhados entre sets precisam ter `visible` resetado em cada cena.
- `Boneco.update` sempre deixa o boneco visível; esconda depois se precisar. Rotação do root é `YXZ` (rx = inclinar para frente).
- Texto 3D é largo: confira nos stills se não cortou. Montserrat 900 cobre acentos; emojis caem na fonte do sistema.
- O node não roda com cwd em caminhos muito longos (scratchpad do Claude): rode sempre a partir da pasta do projeto.
