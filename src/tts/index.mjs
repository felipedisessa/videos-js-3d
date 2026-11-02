// Registro dos provedores de voz. Para adicionar um novo, crie um módulo com a mesma interface e registre aqui:
//   { nome, descricao, vozPadrao(), verificar(voz) → {ok, detalhe}, criar(voz) → { falar(texto, {velocidade, tmp}), fechar() } }
// `falar` devolve { arquivo } ou { amostras, taxa } e, se souber, `palavras: [{ w, s, e }]` (sem isso o tempo é estimado).
import edge from './edge.mjs';
import piper from './piper.mjs';
import sistema from './sistema.mjs';
import azure from './azure.mjs';
import elevenlabs from './elevenlabs.mjs';

export const PROVEDORES = { edge, piper, sistema, azure, elevenlabs };

export function provedor(nome) {
  const p = PROVEDORES[nome];
  if (!p) throw new Error(`provedor de voz desconhecido: "${nome}". Opções: ${Object.keys(PROVEDORES).join(', ')}`);
  return p;
}
