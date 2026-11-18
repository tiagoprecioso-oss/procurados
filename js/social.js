// SOCIAL: pontos da cidade, amizades, guildas e alianças (ferramentas/supabase-social.sql).
// Cada pirata ganha um "pid" público (8 letras); o código de pirata (secreto) só vai para as funções do servidor.
import { REDE } from './config-rede.js';
import { salvo } from './boneco.js';
import { nuvemAtiva, codigoDoJogador, enviarNuvem } from './nuvem.js';

async function rpc(nome, corpo) {
  const chave = REDE.supabaseKey;
  const r = await fetch(REDE.supabaseUrl.replace(/\/$/, '') + '/rest/v1/rpc/' + nome, {
    method: 'POST',
    headers: { apikey: chave, 'Content-Type': 'application/json', ...(chave.startsWith('eyJ') ? { Authorization: 'Bearer ' + chave } : {}) },
    body: JSON.stringify(corpo),
  });
  const txt = await r.text();
  if (!r.ok) {
    if (/could not find the function|does not exist|PGRST202/i.test(txt)) throw new Error('falta-sql');
    throw new Error(txt.slice(0, 160));
  }
  return txt ? JSON.parse(txt) : null;
}
export const socialAtivo = nuvemAtiva;
let meuPid = null;
// garante o pid público deste pirata (cria na primeira vez; precisa do save na nuvem)
export async function registrar() {
  if (!nuvemAtiva) throw new Error('offline');
  const j = salvo.jogador(); if (!j) throw new Error('sem personagem');
  if (meuPid) return meuPid;
  await enviarNuvem().catch(() => {});
  meuPid = await rpc('registrar_pirata', { p_codigo: codigoDoJogador(), p_nome: j.nome || 'Pirata', p_cidade: j.cidade || 'niteroi' });
  if (j.pid !== meuPid) { j.pid = meuPid; salvo.salvarJogador(j); }
  return meuPid;
}
export const pidSalvo = () => salvo.jogador()?.pid || null;
const cod = () => codigoDoJogador();
export const buscar = (nome) => rpc('buscar_piratas', { p_nome: nome });
export const meuSocial = async () => { await registrar(); return rpc('meu_social', { p_codigo: cod() }); };
export const pedirAmizade = async (pid) => { await registrar(); return rpc('pedir_amizade', { p_codigo: cod(), p_para: pid }); };
export const responderAmizade = (pid, sim) => rpc('responder_amizade', { p_codigo: cod(), p_de: pid, p_aceita: sim });
export const criarGuilda = async (nome, tag) => { await registrar(); return rpc('criar_guilda', { p_codigo: cod(), p_nome: nome, p_tag: tag }); };
export const convidarGuilda = (pid) => rpc('convidar_guilda', { p_codigo: cod(), p_pid: pid });
export const responderGuilda = (sim) => rpc('responder_guilda', { p_codigo: cod(), p_aceita: sim });
export const sairGuilda = () => rpc('sair_guilda', { p_codigo: cod() });
export const cargoGuilda = (pid, cargo) => rpc('cargo_guilda', { p_codigo: cod(), p_pid: pid, p_cargo: cargo });
export const proporAlianca = (tag) => rpc('propor_alianca', { p_codigo: cod(), p_tag: tag });
export const responderAlianca = (guilda, sim) => rpc('responder_alianca', { p_codigo: cod(), p_guilda: guilda, p_aceita: sim });
export const tagsPiratas = (pids) => rpc('tags_piratas', { p_pids: pids });
// pontos da cidade
export const listarPontos = (cidade) => (nuvemAtiva ? rpc('listar_pontos', { p_cidade: cidade }) : Promise.resolve([]));
export const reivindicarPonto = async (cidade, id) => { await enviarNuvem().catch(() => {}); return rpc('reivindicar_ponto', { p_codigo: cod(), p_nome: salvo.jogador()?.nome || 'Pirata', p_cidade: cidade, p_id: id }); };
// carteira (patacos no servidor) e o ponto do dono
export const minhaCarteira = async (inicial) => { await registrar(); return rpc('minha_carteira', { p_codigo: cod(), p_inicial: Math.max(0, Math.floor(inicial || 0)) }); };
export const venderNaFeira = (item, qtd, preco) => rpc('vender', { p_codigo: cod(), p_item: item, p_qtd: qtd, p_preco: preco });
export const gastarPatacos = (valor, motivo) => rpc('gastar', { p_codigo: cod(), p_valor: Math.floor(valor), p_motivo: motivo });
export const meuPonto = () => rpc('meu_ponto', { p_codigo: cod() });
export const pagarManutencao = () => rpc('pagar_manutencao', { p_codigo: cod() });
export const recolherCofre = () => rpc('recolher_cofre', { p_codigo: cod() });
// economia entre piratas, ofertas, encomendas e mural
export const informarNivel = (n) => rpc('informar_nivel', { p_codigo: cod(), p_nivel: n });
export const transferir = (pid, valor) => rpc('transferir', { p_codigo: cod(), p_para: pid, p_valor: Math.floor(valor) });
export const bancoGuilda = (valor) => rpc('banco_guilda', { p_codigo: cod(), p_valor: Math.trunc(valor) });
export const extratoGuilda = () => rpc('extrato_guilda', { p_codigo: cod() });
export const ofertarPonto = (ponto, valor) => rpc('ofertar_ponto', { p_codigo: cod(), p_ponto: ponto, p_valor: Math.floor(valor) });
export const responderOferta = (id, sim) => rpc('responder_oferta', { p_codigo: cod(), p_oferta: id, p_aceita: sim });
export const cancelarOferta = (ponto) => rpc('cancelar_oferta', { p_codigo: cod(), p_ponto: ponto });
export const minhasOfertas = () => rpc('minhas_ofertas', { p_codigo: cod() });
export const encomendasHoje = () => rpc('encomendas_hoje', { p_codigo: cod() });
export const entregarEncomenda = (id) => rpc('entregar_encomenda', { p_codigo: cod(), p_id: id });
export const mural = (cidade) => rpc('mural', { p_cidade: cidade });
