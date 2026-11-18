// Coisas comuns ao menu e ao jogo: o desenho do personagem, as peças de aparência,
// as cidades de nascimento e o que fica salvo no navegador.

export const TRACO = '#2b1d0e';
export const CEL_L = 128, CEL_A = 192;   // tamanho de cada quadro da folha do personagem

function forma(c, cor, desenho) { c.fillStyle = cor; c.beginPath(); desenho(); c.fill(); c.stroke(); }

// ---------- peças trocáveis (paleta de cada peça)
export const PECAS = {
  pele:   ['#f1c7a0', '#e0a77c', '#c98e62', '#a8693f', '#7a4a2a', '#5a3520'],
  cabelo: ['#1d1a17', '#3b2414', '#6b4423', '#b5532f', '#d9b36a', '#9a958a'],
  camisa: ['#efe6d0', '#c9dcd6', '#e9d49a', '#d8a9a0', '#a9b89a'],
  faixa:  ['#c0281c', '#1f4fa3', '#d9a441', '#3f7a3a', '#2b1d0e', null],   // null: sem faixa
  barba:  ['rala', 'cheia', 'nenhuma'],
  cabeloLongo: [false, true],
};
export const APARENCIA_PADRAO = { pele: '#e0a77c', cabelo: '#3b2414', camisa: '#efe6d0', calca: '#6b5a44', faixa: '#c0281c', barba: 'rala', cabeloLongo: false };

// ---------- o personagem náufrago: vista 'frente' | 'lado' | 'costas'; quadro 0 parado, 1 e 2 passos
export function desenharBoneco(c, vista, quadro, p) {
  p = { ...APARENCIA_PADRAO, ...p };
  c.lineWidth = 4; c.lineJoin = 'round'; c.strokeStyle = TRACO;
  const cx = 64, pe = 186, lado = vista === 'lado';
  const passo = quadro === 0 ? 0 : quadro === 1 ? 1 : -1, sobe = quadro === 0 ? 0 : -3, hy = 58 + sobe;
  // cabelo longo fica atrás de tudo
  if (p.cabeloLongo && vista !== 'frente') forma(c, p.cabelo, () => c.roundRect(cx - (lado ? 34 : 30), hy - 6, lado ? 30 : 60, 54, 12));
  for (const s of [-1, 1]) {
    const dx = lado ? s * passo * 11 : s * 12, ergue = !lado && passo === s ? 7 : 0;
    forma(c, p.calca, () => c.roundRect(cx + dx - 8, 126 + sobe, 16, pe - 140 - sobe - ergue, 5));
    forma(c, p.pele, () => c.roundRect(cx + dx - (lado ? 6 : 8), pe - 18 - ergue, lado ? 18 : 16, 14, 5));   // pés descalços
  }
  const ombroY = 96 + sobe, larg = lado ? 34 : 50;
  const braco = (bx, ang) => { c.save(); c.translate(bx, ombroY); c.rotate(ang); forma(c, p.pele, () => c.roundRect(-7, -4, 14, 44, 6)); forma(c, p.camisa, () => c.roundRect(-8, -6, 16, 16, 5)); c.restore(); };
  if (lado) braco(cx - 2, passo * 0.5);
  forma(c, p.camisa, () => { c.moveTo(cx - larg / 2, 92 + sobe); c.lineTo(cx + larg / 2, 92 + sobe); c.lineTo(cx + larg / 2, 128 + sobe); c.lineTo(cx + 8, 134 + sobe); c.lineTo(cx + 2, 126 + sobe); c.lineTo(cx - 10, 136 + sobe); c.lineTo(cx - larg / 2, 128 + sobe); c.closePath(); });  // camisa rasgada
  forma(c, '#8a6a44', () => c.rect(cx - larg / 2, 122 + sobe, larg, 6));
  if (lado) braco(cx + 2, -passo * 0.5);
  else { braco(cx - larg / 2 - 4, 0.15 + passo * 0.12); braco(cx + larg / 2 + 4, -0.15 + passo * 0.12); }
  forma(c, p.pele, () => c.arc(cx, hy, 30, 0, 6.3));
  if (vista === 'costas') forma(c, p.cabelo, () => c.arc(cx, hy + 2, 29, 0, 6.3));
  else {
    c.fillStyle = p.cabelo; c.beginPath(); c.arc(cx + (lado ? -6 : 0), hy - 2, 30, Math.PI * 1.02, Math.PI * 1.98); c.fill();
    if (p.cabeloLongo) { c.beginPath(); c.arc(cx + (lado ? -14 : -24), hy + 8, lado ? 16 : 9, 0, 6.3); if (!lado) c.arc(cx + 24, hy + 8, 9, 0, 6.3); c.fill(); }
    c.fillStyle = TRACO;
    if (lado) { c.beginPath(); c.arc(cx + 16, hy + 2, 4, 0, 6.3); c.fill(); forma(c, p.pele, () => c.arc(cx + 28, hy + 10, 6, -1.4, 1.6)); }
    else for (const s of [-1, 1]) { c.beginPath(); c.arc(cx + s * 11, hy + 2, 4, 0, 6.3); c.fill(); }
    if (p.barba === 'rala') { c.fillStyle = 'rgba(43,29,14,.35)'; for (let k = 0; k < 7; k++) { c.beginPath(); c.arc(cx - 14 + k * 4.5 + (lado ? 10 : 0), hy + 18 + (k % 2) * 3, 1.6, 0, 6.3); c.fill(); } }
    if (p.barba === 'cheia') forma(c, p.cabelo, () => { if (lado) c.arc(cx + 10, hy + 15, 14, -0.3, 2.6); else c.arc(cx, hy + 14, 19, 0.1, Math.PI - 0.1); });
  }
  if (p.faixa) forma(c, p.faixa, () => { c.moveTo(cx - 31, hy - 12); c.lineTo(cx + 31, hy - 12); c.lineTo(cx + 31, hy - 4); c.lineTo(cx - 31, hy - 4); c.closePath(); });
}

// folha completa 3 x 3 num canvas (o jogo transforma em textura)
export function folhaBoneco(p) {
  const cv = document.createElement('canvas'); cv.width = CEL_L * 3; cv.height = CEL_A * 3; const c = cv.getContext('2d');
  ['frente', 'lado', 'costas'].forEach((v, lin) => { for (let q = 0; q < 3; q++) { c.save(); c.translate(q * CEL_L, lin * CEL_A); desenharBoneco(c, v, q, p); c.restore(); } });
  return cv;
}

// ---------- cidades de nascimento (dificuldade da região em volta: 1 a 5)
export const CIDADES = [
  { id: 'niteroi', nome: 'Niterói', regiao: 'Baía de Guanabara', dif: 1, aberta: true, desc: 'Águas calmas, mata e mangue. O começo mais tranquilo.' },
  { id: 'salvador', nome: 'Salvador', regiao: 'Baía de Todos os Santos', dif: 2, aberta: false, desc: 'Recifes, cacau e a rota do açúcar.' },
  { id: 'buenosaires', nome: 'Buenos Aires', regiao: 'Rio da Prata', dif: 3, aberta: false, desc: 'Pampa, gado e contrabando na fronteira.' },
  { id: 'belem', nome: 'Belém', regiao: 'Foz do Amazonas', dif: 4, aberta: false, desc: 'Rios sem fim, floresta densa, piratas de rio.' },
  { id: 'lima', nome: 'Lima', regiao: 'Costa do Pacífico', dif: 5, aberta: false, desc: 'Prata dos Andes, deserto e o mar depois do Cabo Horn.' },
  { id: 'cartagena', nome: 'Cartagena', regiao: 'Caribe', dif: 5, aberta: false, desc: 'As melhores recompensas do mapa, e os maiores riscos.' },
];

// ---------- o que fica salvo neste navegador (pode falhar em janela anônima: tudo protegido)
const CHAVE = { jogador: 'cabeca-a-premio.jogador', progresso: 'cabeca-a-premio.progresso', opcoes: 'cabeca-a-premio.opcoes' };
const TOQUE = (() => { try { return matchMedia('(pointer: coarse)').matches; } catch { return false; } })();
export const OPCOES_PADRAO = { qualidade: 'media', mostrarQps: false };   // celular também começa em média (a baixa deixava tudo borrado)
function ler(k) { try { return JSON.parse(localStorage.getItem(CHAVE[k])); } catch { return null; } }
function gravar(k, v) { try { v === null ? localStorage.removeItem(CHAVE[k]) : localStorage.setItem(CHAVE[k], JSON.stringify(v)); return true; } catch { return false; } }
export const salvo = {
  jogador: () => ler('jogador'), salvarJogador: (v) => gravar('jogador', v),
  progresso: () => ler('progresso'), salvarProgresso: (v) => gravar('progresso', v),
  opcoes: () => {
    const o = { ...OPCOES_PADRAO, ...(ler('opcoes') || {}) };
    if (TOQUE && !o.v2) { if (!o.qualidadeEscolhida) o.qualidade = 'media'; if (!o.zoom || o.zoom < 1.8) delete o.zoom; o.v2 = true; gravar('opcoes', o); }   // 18/11: celular mais nítido e câmera mais perto
    return o;
  }, salvarOpcoes: (v) => gravar('opcoes', v),
  apagarTudo: () => { gravar('jogador', null); gravar('progresso', null); },
};
export const PIXEL = { baixa: 0.75, media: 1, alta: 1.5 };   // limite de resolução por qualidade
