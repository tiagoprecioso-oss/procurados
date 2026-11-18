// REDE: mostra os outros jogadores. Funciona de dois jeitos:
// 1) SUPABASE (itch.io ou qualquer site): se js/config-rede.js tiver a URL e a chave pública do projeto,
//    o jogo abre um canal do Supabase Realtime (WebSocket puro, sem biblioteca) e troca posições por "broadcast".
// 2) CASCA DO CLAUDE.AI: sem Supabase e rodando dentro da página "casca" (online.html), quem guarda a conexão
//    é a casca (capacidade "room" do claude.ai); o jogo conversa com ela por postMessage.
// Sem nenhum dos dois, o jogo é solo.
import { REDE } from './config-rede.js';

const comSupabase = !!(REDE.supabaseUrl && REDE.supabaseKey);
const naCasca = !comSupabase && window.parent !== window;
export const temRede = comSupabase || naCasca;
const outros = new Map();   // peer -> último estado recebido
const vistoEm = new Map();  // peer -> quando chegou o último estado (só no modo Supabase)
let conectados = 1;
const ouvintes = new Set();
const avisar = () => ouvintes.forEach((f) => f(outros));

// ---------- modo casca (claude.ai)
if (naCasca) addEventListener('message', (e) => {
  const m = e.data;
  if (!m || m.cap !== 'cabeca-a-premio' || m.tipo !== 'outros' || !Array.isArray(m.lista)) return;
  outros.clear();
  for (const p of m.lista) if (p && typeof p.peer === 'string' && p.estado && typeof p.estado === 'object') outros.set(p.peer, p.estado);
  conectados = m.lista.length + 1;
  avisar();
});

// ---------- modo Supabase Realtime (protocolo Phoenix sobre WebSocket)
// Para gastar pouco da cota grátis: manda até 4 vezes por segundo quando o jogador se mexe,
// e uma vez a cada 3 segundos quando está parado (para os outros saberem que ele continua ali).
const EU = (() => { try { let id = sessionStorage.getItem('cap.peer'); if (!id) { id = Math.random().toString(36).slice(2, 10); sessionStorage.setItem('cap.peer', id); } return id; } catch { return Math.random().toString(36).slice(2, 10); } })();
const TOPICO = 'realtime:' + (REDE.sala || 'procurados');
let ws = null, aberto = false, ref = 0, joinRef = null, batida = null, espera = 1000;
function mandar(event, payload, topic = TOPICO) { if (ws && ws.readyState === 1) ws.send(JSON.stringify({ topic, event, payload, ref: String(++ref), join_ref: topic === TOPICO ? joinRef : undefined })); }
function conectar() {
  const url = REDE.supabaseUrl.replace(/^http/, 'ws').replace(/\/$/, '') + '/realtime/v1/websocket?apikey=' + encodeURIComponent(REDE.supabaseKey) + '&vsn=1.0.0';
  ws = new WebSocket(url);
  ws.onopen = () => {
    espera = 1000; joinRef = String(++ref);
    ws.send(JSON.stringify({ topic: TOPICO, event: 'phx_join', ref: joinRef, join_ref: joinRef,
      payload: { config: { broadcast: { self: false, ack: false }, presence: { key: '' }, postgres_changes: [], private: false }, ...(REDE.supabaseKey.startsWith('eyJ') ? { access_token: REDE.supabaseKey } : {}) } }));   // chave nova (sb_publishable_) não é um token: vai só na URL
    clearInterval(batida); batida = setInterval(() => mandar('heartbeat', {}, 'phoenix'), 25000);
  };
  ws.onmessage = (ev) => {
    let m; try { m = JSON.parse(ev.data); } catch { return; }
    if (m.topic !== TOPICO) return;
    if (m.event === 'phx_reply' && m.ref === joinRef) { aberto = m.payload?.status === 'ok'; if (!aberto) console.warn('Supabase recusou o canal', m.payload); ultimo = null; return; }
    if (m.event === 'broadcast' && m.payload?.event === 'pos') {
      const p = m.payload.payload;
      if (!p || typeof p.peer !== 'string' || p.peer === EU || !p.estado || typeof p.estado !== 'object') return;
      if (p.sai) { outros.delete(p.peer); vistoEm.delete(p.peer); }
      else { outros.set(p.peer.slice(0, 16), p.estado); vistoEm.set(p.peer.slice(0, 16), performance.now()); }
      conectados = outros.size + 1; avisar();
    }
  };
  ws.onclose = () => { aberto = false; clearInterval(batida); setTimeout(conectar, espera); espera = Math.min(30000, espera * 2); };
  ws.onerror = () => { try { ws.close(); } catch {} };
}
if (comSupabase) {
  conectar();
  // quem some por mais de 8 segundos (fechou a aba, caiu a internet) sai da lista
  setInterval(() => { const agora = performance.now(); for (const [p, t] of vistoEm) if (agora - t > 8000) { outros.delete(p); vistoEm.delete(p); } conectados = outros.size + 1; }, 2000);
  addEventListener('pagehide', () => { if (aberto) mandar('broadcast', { type: 'broadcast', event: 'pos', payload: { peer: EU, sai: true, estado: {} } }); });
}

let ultimoEnvio = 0, ultimo = null;
const mudou = (a, b) => !b || a.cena !== b.cena || Math.abs(a.x - b.x) > 0.05 || Math.abs(a.z - b.z) > 0.05 || a.anda !== b.anda || a.acao !== b.acao || a.caido !== b.caido || a.velas !== b.velas || Math.abs((a.a ?? a.rumo ?? 0) - (b.a ?? b.rumo ?? 0)) > 0.1;
export function enviar(estado, agora = performance.now()) {
  if (naCasca) {   // a casca já controla o ritmo da sala
    if (agora - ultimoEnvio < 100) return;
    ultimoEnvio = agora; window.parent.postMessage({ cap: 'cabeca-a-premio', tipo: 'eu', estado }, '*'); return;
  }
  if (!comSupabase || !aberto) return;
  const intervalo = mudou(estado, ultimo) ? 250 : 3000;
  if (agora - ultimoEnvio < intervalo) return;
  ultimoEnvio = agora; ultimo = { ...estado };
  mandar('broadcast', { type: 'broadcast', event: 'pos', payload: { peer: EU, estado } });
}
export const aoMudar = (f) => (ouvintes.add(f), () => ouvintes.delete(f));
export const lista = () => outros;
export const quantos = () => conectados;

// o que chega de outro jogador é dado não confiável: limpa antes de usar
export function limpar(e) {
  const num = (v, min, max, pad = 0) => (typeof v === 'number' && isFinite(v) ? Math.max(min, Math.min(max, v)) : pad);
  const comp = e.comp && typeof e.comp === 'object' ? e.comp : {};
  return {
    cena: e.cena === 'mar' ? 'mar' : e.cena === 'carta' ? 'carta' : 'terra',
    nome: String(e.nome || 'Pirata').replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮]/g, '').slice(0, 20),
    x: num(e.x, -5000, 5000), z: num(e.z, -5000, 5000), a: num(e.a, -10, 10), rumo: num(e.rumo, -10, 10),
    anda: !!e.anda, corre: !!e.corre, caido: !!e.caido, velas: num(e.velas, 0, 3),
    acao: ['PickUp', 'Interact', '1H_Melee_Attack_Chop'].includes(e.acao) ? e.acao : null,
    comp: { sexo: comp.sexo === 'f' ? 'f' : 'm', pele: num(comp.pele, 0, 4, 1) | 0, cabelo: num(comp.cabelo, 0, 3) | 0, corCabelo: num(comp.corCabelo, 0, 4, 1) | 0, barba: !!comp.barba },
  };
}
