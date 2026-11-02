# Gerador de vídeos 3D para canal dark

Gera Shorts/TikToks/Reels verticais (1080x1920, 30 fps) no estilo **"O que acontece se…?"**: bonequinhos 3D estilo vinil, narração em pt-BR, legenda palavra por palavra, trilha e efeitos sonoros sintetizados (sem direitos autorais de terceiros). Funciona em **Windows, macOS e Linux**.

Cada vídeo sai em duas versões (com música e sem música, para usar um som em alta do TikTok) e o arquivo `LEIA-ME - titulos, legendas e hashtags.txt` é atualizado com o texto de publicação de cada um.

## Requisitos

- **Node.js 24+** (`.nvmrc` incluído)
- Um navegador Chromium instalado: Edge, Chrome, Chromium ou Brave. O gerador acha sozinho; se não achar, veja [Solução de problemas](#solução-de-problemas).
- O ffmpeg vem junto (pacote `ffmpeg-static`), não precisa instalar.

## Instalação

```bash
npm install
```

```bash
npm run doctor
```

O `doctor` confere Node, ffmpeg, navegador/GPU, pasta de saída, vozes e roteiros, e diz o que falta.

## Uso

| Comando | O que faz |
|---|---|
| `npm run video -- <id>` | Gera o vídeo final (voz → áudio → render → MP4 com e sem música) |
| `npm run video -- all` | Gera todos os vídeos de `roteiros/` |
| `npm run stills -- <id>` | Renderiza 3 frames por cena em `build/<id>/sheet.jpg`, para conferir o visual |
| `npm run audio -- <id>` | Só narração, timeline e mixagem (sem render) |
| `npm run novo -- <id> "Título"` | Cria o esqueleto de um vídeo novo que já renderiza |
| `npm run doctor` | Diagnóstico do ambiente |
| `npm run voz:lista` / `npm run voz:baixar -- <voz>` | Vozes locais Piper |
| `npm run check` | Lint + testes |

Opções do `video`/`stills`/`audio`: `--tts <provedor>`, `--voz <id>`, `--saida <pasta>`, `--reusar-video` (só refaz o áudio). Exemplo:

```bash
npm run video -- sal --tts piper --voz jeff-medium
```

Cada vídeo leva ~1 minuto para renderizar numa GPU comum.

## Vozes

| Provedor (`--tts`) | Onde roda | Internet | Custo | Qualidade | Tempo das palavras | Uso comercial |
|---|---|---|---|---|---|---|
| `edge` (padrão) | qualquer SO | sim | grátis | ★★★★ neural | informado pela API | zona cinza: usa o serviço do "Ler em voz alta" do Edge |
| `piper` | Windows, macOS, Linux (x64 e ARM), só CPU | só para baixar o modelo | grátis | ★★★ | estimado (~70 ms de erro) | faber/cadu/jeff: dataset CC0 (veja abaixo) |
| `sistema` | Windows (SAPI), macOS (`say`), Linux (espeak-ng) | não | grátis | ★ robótica | estimado | depende do SO |
| `azure` | qualquer SO | sim | cota grátis mensal, depois pago | ★★★★ (mesmas vozes do Edge) | estimado | sim |
| `elevenlabs` | qualquer SO | sim | pago | ★★★★★, clonagem de voz | informado pela API | sim (planos pagos) |

Escolha o provedor com `--tts` ou deixe fixo no `.env` (copie `.env.example` para `.env`). Um roteiro também pode fixar a voz dele com `vozes: { piper: 'jeff-medium' }`.

### Piper (local, offline)

Roda via [sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx) (pacote npm com binários prontos; não precisa de Python nem de GPU). Gera ~10× mais rápido que o tempo real.

```bash
npm run voz:lista
```

```bash
npm run voz:baixar -- faber-medium
```

Vozes pt-BR: `faber-medium` (recomendada), `cadu-medium`, `jeff-medium`, `edresson-low`, `dii-high`, `miro-high`. Acrescente `-int8` ao id para baixar uma versão de ~21 MB em vez de ~67 MB. Os modelos ficam em `modelos/` (fora do git).

> Licença: os datasets de faber, cadu e jeff são CC0, mas essas vozes foram ajustadas a partir da voz inglesa *lessac*, cujo dataset tem licença própria. Para canal monetizado, leia o `MODEL_CARD` de cada modelo ou prefira Azure/ElevenLabs.

> O `sherpa-onnx-node` está fixado na série 1.13: a 2.x removeu o fonetizador embutido que as vozes Piper usam.

### Voz do sistema

Zero instalação. Windows usa a primeira voz pt-BR do SAPI (ex.: Microsoft Maria; instale mais em *Configurações → Hora e idioma → Fala*), macOS usa `say -v Luciana`, Linux usa `espeak-ng -v pt-br` (`sudo apt install espeak-ng`).

### Azure e ElevenLabs

Preencha as chaves no `.env` (`AZURE_SPEECH_KEY` + `AZURE_SPEECH_REGION`, ou `ELEVENLABS_API_KEY` + `ELEVENLABS_VOZ`). São as opções indicadas para canal monetizado.

### Outras opções locais avaliadas (não integradas)

- **Kokoro-82M**: ótima qualidade e leve, mas o suporte a português ainda depende do pipeline Python (a versão JS só tem inglês).
- **XTTS-v2 (Coqui)**: clona voz e fala português, mas a licença do modelo é não comercial e precisa de GPU para ficar rápido.
- **F5-TTS / modelos pt-BR da comunidade**: qualidade alta, mas exigem Python + GPU.

Para integrar uma delas, crie um módulo em `src/tts/` seguindo a interface descrita em `src/tts/index.mjs` (o tempo das palavras é estimado automaticamente se o provedor não informar).

## Criar um vídeo novo

1. `npm run novo -- polvo "Por que o polvo tem três corações?"` cria `roteiros/polvo.mjs` e `web/videos/polvo.js`.
2. Escreva o roteiro (fatos verificáveis!) e rode `npm run audio -- polvo`. Confira em `build/polvo/timeline.json` se as palavras e cues saíram certas.
3. Monte as cenas em `web/videos/polvo.js`, reaproveitando os vídeos existentes.
4. `npm run stills -- polvo` e confira `build/polvo/sheet.jpg`. Repita até nada ficar cortado.
5. `npm run video -- polvo`.

### Roteiro (`roteiros/<id>.mjs`)

```js
export default {
  ordem: 9,                                          // define o número do arquivo e a ordem no LEIA-ME
  titulo: 'Por que o polvo tem três corações?',
  arquivo: '09 - Por que o polvo tem tres coracoes',
  velocidade: '+7%',                                 // ou 1.07
  musica: { bpm: 104, acordes: ['Am', 'F', 'C', 'G'], clima: 'curioso' }, // brincalhao | curioso | misterio
  vozes: { piper: 'jeff-medium' },                   // opcional
  publicacao: { tiktok, hashtags, shortsTitulo, shortsDescricao, shortsHashtags, reserva },
  beats: [
    {
      id: 'mito', texto: 'Mas isso é mito.', hold: 0.5, // hold = segundos extras depois da fala
      destaque: ['mito'],                             // palavras em amarelo ('palavra@2' = só a 2ª)
      cues: { mito: 'mito' },                         // momentos nomeados, usados na cena: s.cue('mito')
      sfx: [['buzz', 'mito'], ['stamp', 'mito', 0.8]], // [efeito, momento, ganho]
    },
  ],
};
```

**Momentos** (cues e sfx): número = segundos desde o início do beat · `'palavra'` = início da palavra · `'w:28'` = palavra que é número · `'>fim'` = fim da fala · `'%40'` = 40% do beat · aceitam `+0.2`/`-0.3` · podem citar outra cue pelo nome.

**Efeitos sonoros**: `whoosh pop gulp boing buzz stamp bubbles ding squish flush alarm crack boom bloop stretch riser tick fail dun tada wind fall sizzle brake splash hic chuva radio beep`.

### Cenas (`web/videos/<id>.js`)

Exporta `criar(E)`, que monta os objetos 3D e devolve `{ beats: { <idDoBeat>(s) { ... } } }`. Cada função recebe `s = { t, T, dur, p, cue(nome), desde(nome), falaFim }` e deve ser **pura em relação ao tempo**: qualquer frame pode ser renderizado isolado.

Motor (`web/engine.js`):
- `E.set()` cria um grupo que só aparece quando a cena chama `E.show(grupo)`.
- `E.fundo(topo, base, { chao, chaoCor, near, far, neblina })`, `E.cam(px, py, pz, ax, ay, az, fov, roll)`, `E.tremer(q)`, `E.sombra(x, z, tam)`.
- `E.texto3d('7 ANOS', { size, cor })`: largura ≈ 0,85 × size × nº de letras.
- `E.rotulo(pos3d, 'TEXTO', { k, dx, dy, bg })` e `E.desenhar(ctx => ...)` para a camada 2D (`textoContorno`, `explosao`, `pilula`).
- Luzes por cena: `E.key`, `E.rim`, `E.fill`, `E.hemi`, `E.gtao.enabled`, `E.tint`.

Personagem (`web/bonequinho.js`): `new Boneco({ camisa, calca, cabelo, estilo, oculos, bigode, pele })` e `b.update(s.T, pose, rosto)`.
- Estilos de cabelo: `curto`, `espetado`, `coque`, `longo`, `careca`.
- Poses prontas em `POSES` (idle, cintura, comemorar, maosRosto, maosJuntas, dedoBalanca, sentado, queda, mergulho, nadando…) e `misturar(a, b, k)`.
- Expressões: neutro, sorriso, feliz, surpreso, assustado, triste, bravo, aliviado, dor, confuso, desconfiado, orgulhoso, mastigando, calor. Extras: `boca` (0–1), `pisca: 'L'`, `gx`/`gy` (olhar), `cheeks`.

Objetos prontos em `web/props.js` (xis, check, placa de aviso, relógio, troféu, confete, estrelas, partículas, bolinha com rosto) e nos vídeos (Terra com continentes e corte, Lua, oceano, formiga, gato, prédio, nuvem, astronauta…). Um vídeo pode importar de outro.

**Enquadramento vertical**: com `fov 36`, a área visível a uma distância `d` tem altura ≈ `0,65·d` e largura ≈ `0,37·d`. A legenda fica em ~63% da altura, então deixe rosto e ação entre 20% e 55%. O topo (~330 px) é bom para títulos 2D.

## Configuração (`.env`)

Veja `.env.example`. Principais: `TTS_PROVEDOR`, a voz de cada provedor, `SAIDA_DIR` (padrão: `Área de Trabalho/Videos Canal Dark 3D`, ou `./saida` se não houver Área de Trabalho) e `NAVEGADOR`.

## Desenvolvimento

- `npm run lint` (ESLint) e `npm test` (testes com `node:test`, sem dependências extras). `npm run check` roda os dois.
- O CI do GitHub Actions (`.github/workflows/ci.yml`) roda lint e testes em Windows, macOS e Linux.
- `.editorconfig` e `.gitattributes` mantêm UTF-8 e quebras de linha LF.

```
roteiros/<id>.mjs   roteiro de cada vídeo (texto, cues, efeitos, música, publicação)
web/videos/<id>.js  cenas 3D de cada vídeo
web/engine.js       motor de render (Three.js + pós-processamento + camada 2D/legendas)
web/bonequinho.js   personagem
web/props.js        objetos reutilizáveis
src/make.mjs        CLI principal
src/voz.mjs         narração + timeline (cues, destaques)
src/tts/            provedores de voz + estimativa do tempo das palavras
src/audio.mjs       música e efeitos sintetizados + mixagem
src/render.mjs      navegador headless (puppeteer) → frames → ffmpeg
src/navegador.mjs   acha Edge/Chrome/Chromium/Brave em cada SO
src/doctor.mjs, src/novo.mjs, src/baixar-voz.mjs, src/leiame.mjs
test/               testes
build/              cache de voz e intermediários (pode apagar)
modelos/            vozes Piper baixadas
```

## Solução de problemas

- **"nenhum navegador Chromium encontrado"**: instale Chrome/Edge, ou rode `npx @puppeteer/browsers install chrome-headless-shell@stable` e coloque o caminho em `NAVEGADOR` no `.env`.
- **Render muito lento**: o `doctor` mostra se o WebGL está na GPU ou em software (SwiftShader/llvmpipe). Em Linux sem GPU funciona, mas devagar.
- **Frames "vazando"/transparentes**: não ative o `UnrealBloomPass`. Em alguns drivers ele gera alfa zerado; o brilho vem de materiais emissivos.
- **Voz do Edge falhando**: precisa de internet. Sem rede, use `--tts piper` ou `--tts sistema`.
- **Legenda fora de sincronia com Piper/sistema**: o tempo é estimado pelas pausas; frases com pontuação clara ficam mais precisas.

## Licenças e avisos

- Código: uso privado. Dependências: Three.js (MIT), Montserrat (OFL), puppeteer-core (Apache-2.0), sherpa-onnx (Apache-2.0), ffmpeg (GPL/LGPL, via ffmpeg-static).
- Vozes: cada provedor e modelo tem seus próprios termos (veja a tabela acima).
- YouTube e TikTok penalizam conteúdo repetitivo ou em massa: varie temas e roteiros e confira os fatos antes de publicar.
