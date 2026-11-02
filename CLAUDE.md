# CLAUDE.md

Gerador de Shorts/TikToks 3D "O que acontece se…?" para canal dark. Leia o `README.md` primeiro: ele documenta comandos, formato do roteiro, API do motor, personagens e props.

## Fluxo para criar vídeos novos

1. Escolha temas com fatos verificáveis (pesquise e confira números; nada de conselho de saúde arriscado).
2. Adicione o roteiro em `web/roteiros.js` e rode `npm run audio -- <id>`. Confira em `build/<id>/timeline.json` se cues e palavras saíram certos (o TTS às vezes junta "200 quilômetros por hora" numa palavra só; use `'w:200'` para cues numéricas).
3. Crie `web/videos/<id>.js` reaproveitando cenas/objetos dos vídeos existentes (`import` de outro vídeo funciona: ex. `texturaTerra` de `buraco.js`, `predio`/`nuvem` de `formiga.js`, `pilula` de `chiclete.js`).
4. `npm run stills -- <id>` e **olhe** `build/<id>/sheet.jpg` (3 frames por cena). Itere até nada ficar cortado e a ação ficar acima da legenda.
5. `npm run video -- <id>` → sai em `Desktop\Videos Canal Dark 3D\` (+ versão sem música). Atualize o `LEIA-ME - titulos, legendas e hashtags.txt` dessa pasta com título, legenda e hashtags do vídeo novo.

## Armadilhas conhecidas

- **Não use o UnrealBloomPass**: neste PC (Edge headless + ANGLE d3d11, RX 580) ele gera frames com alfa zerado e o frame anterior "vaza" no vídeo. O motor deixa o bloom desligado; brilho vem de materiais emissivos e sprites aditivos.
- Sprites/halos e transparências escurecem com o GTAO ligado: use `E.gtao.enabled = false` nessas cenas.
- Cenas devem ser funções puras do tempo (nada de `+=` entre frames); objetos compartilhados entre sets precisam ter `visible` resetado em cada cena.
- `Boneco.update` sempre deixa o boneco visível; esconda depois se precisar. Rotação do root é `YXZ` (rx = inclinar para frente).
- Texto 3D é largo: confira nos stills se não cortou. Montserrat 900 cobre acentos; emojis caem na fonte do sistema.
- O node não roda com cwd em caminhos muito longos (scratchpad do Claude): rode sempre a partir da pasta do projeto.
