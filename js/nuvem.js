// SAVE NA NUVEM: o personagem e o progresso vão também para o Supabase (tabela "saves",
// ver ferramentas/supabase-saves.sql), presos a um "código de pirata" de 12 letras.
// Com o código, a pessoa recupera o personagem em outro aparelho ou depois de limpar o navegador.
// Sem Supabase configurado (js/config-rede.js vazio), nada disso liga e o save fica só no navegador.
import { REDE } from './config-rede.js';
import { salvo } from './boneco.js';

export const nuvemAtiva = !!(REDE.supabaseUrl && REDE.supabaseKey);
const ALFA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';   // sem 0/O, 1/I/L: fácil de copiar à mão
export function novoCodigo() { const a = new Uint32Array(12); crypto.getRandomValues(a); return [...a].map((n) => ALFA[n % ALFA.length]).join(''); }
export const formatar = (c) => (c ? c.match(/.{1,4}/g).join('-') : '');
export const limparCodigo = (t) => String(t || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

async function rpc(nome, corpo, keepalive = false) {
  const chave = REDE.supabaseKey;
  const r = await fetch(REDE.supabaseUrl.replace(/\/$/, '') + '/rest/v1/rpc/' + nome, {
    method: 'POST', keepalive,
    headers: { apikey: chave, 'Content-Type': 'application/json', ...(chave.startsWith('eyJ') ? { Authorization: 'Bearer ' + chave } : {}) },
    body: JSON.stringify(corpo),
  });
  if (!r.ok) throw new Error('nuvem ' + r.status + ' ' + (await r.text()).slice(0, 200));
  return r.json();
}

// o código fica junto do personagem salvo; personagens antigos ganham um na primeira vez
export function codigoDoJogador() {
  const j = salvo.jogador(); if (!j) return null;
  if (!j.codigo) { j.codigo = novoCodigo(); salvo.salvarJogador(j); }
  return j.codigo;
}
let ultimo = '';
export async function enviarNuvem(keepalive = false) {
  if (!nuvemAtiva) return false;
  const codigo = codigoDoJogador(); if (!codigo) return false;
  const dados = { v: 1, jogador: salvo.jogador(), progresso: salvo.progresso() };
  const txt = JSON.stringify(dados); if (txt === ultimo) return true;
  await rpc('gravar_save', { p_codigo: codigo, p_dados: dados }, keepalive && txt.length < 60000);
  ultimo = txt; return true;
}
// devolve { jogador, progresso } ou null se o código não existe
export async function baixarNuvem(codigo) {
  const c = limparCodigo(codigo); if (c.length !== 12) return null;
  const d = await rpc('carregar_save', { p_codigo: c });
  return d && d.jogador ? d : null;
}
// ---------- LOTES compartilhados (ferramentas/supabase-lotes.sql)
// lista pública da cidade: [{ id, dono_nome, degrau }]
export async function listarLotes(cidade) { if (!nuvemAtiva) return []; return (await rpc('listar_lotes', { p_cidade: cidade })) || []; }
// reserva o primeiro lote livre da lista para este personagem (ou devolve o que ele já tem)
export async function reservarLote(ids, cidade) {
  if (!nuvemAtiva) return null;
  const j = salvo.jogador(); if (!j) return null;
  await enviarNuvem();   // o servidor só reserva para quem já tem save na nuvem
  return rpc('reservar_lote', { p_codigo: codigoDoJogador(), p_nome: j.nome || 'Pirata', p_cidade: cidade, p_ids: ids, p_arroba: j.instagram || null });
}
export async function atualizarLote(degrau) {
  if (!nuvemAtiva) return false;
  const j = salvo.jogador(); if (!j) return false;
  return rpc('atualizar_lote', { p_codigo: codigoDoJogador(), p_degrau: degrau, p_nome: j.nome || 'Pirata' });
}

// manda o save de tempos em tempos e quando a pessoa sai da página
export function sincronizarSempre(seg = 20) {
  if (!nuvemAtiva) return;
  const tenta = () => enviarNuvem().catch((e) => console.warn('save na nuvem falhou:', e.message));
  setTimeout(tenta, 4000); setInterval(tenta, seg * 1000);
  addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') enviarNuvem(true).catch(() => {}); });
}
