// CENTRAL DE AVISOS: em vez de caixas por cima da tela, todo aviso, dica e explicação vai para cá.
// Na tela fica só um ícone pequeno de pergaminho; quando chega aviso novo, ele ganha um "!" pulsando
// com o número de não lidos. Tocar no ícone abre a lista (com ✕ grande para fechar).
// Uso: const avisos = criarAvisos(); avisos.novo('lote', 'Título', 'texto ou <b>html</b>' | elementoDOM, { abrir: false });
export function criarAvisos() {
  if (window.avisosJogo) return window.avisosJogo;
  const estilo = document.createElement('style');
  estilo.textContent = `
  #avisosBt { position: fixed; left: 16px; top: 96px; z-index: 6; width: 38px; height: 38px; border-radius: 50%; border: 2px solid #c9a24f; background: radial-gradient(#4a3418, #2b1d0e);
    color: #ffe7a3; font: bold 18px Georgia, serif; display: grid; place-items: center; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,.55); padding: 0; touch-action: manipulation; }
  #avisosBt svg { width: 20px; height: 20px; }
  #avisosBt .qt { position: absolute; right: -6px; top: -6px; min-width: 18px; height: 18px; padding: 0 4px; border-radius: 9px; background: #c0281c; color: #fff; font: bold 12px/18px sans-serif; display: none; }
  #avisosBt.novo .qt { display: block; } #avisosBt.novo { animation: avisoPulsa 1.2s ease-in-out infinite; }
  @keyframes avisoPulsa { 50% { transform: scale(1.14); box-shadow: 0 0 0 5px rgba(255, 200, 60, .35); } }
  #avisosPainel { position: fixed; inset: 0; z-index: 30; display: none; place-items: center; background: rgba(15, 10, 5, .55); }
  #avisosPainel.aberto { display: grid; }
  #avisosPainel .caixa { position: relative; width: min(560px, 94vw); max-height: calc(100dvh - 24px); overflow-y: auto; -webkit-overflow-scrolling: touch; touch-action: pan-y; background: #f4e8cd; color: #2b1d0e; border: 3px solid #5e3a1e; border-radius: 10px; padding: 14px 16px 16px; font: 15px/1.5 var(--fonte-texto, Georgia, serif); }
  #avisosPainel h2 { margin: 0 40px 8px 0; font: 26px var(--fonte-titulo, Georgia, serif); font-weight: normal; }
  #avisosPainel .fecharAv { position: absolute; right: 8px; top: 8px; width: 40px; height: 40px; border-radius: 50%; border: 2px solid #f4e8cd; background: #5e3a1e; color: #f4e8cd; font: bold 20px sans-serif; cursor: pointer; }
  #avisosPainel .item { border-top: 1px solid rgba(94, 58, 30, .3); padding: 8px 2px; }
  #avisosPainel .item > b { display: flex; align-items: center; gap: 8px; cursor: pointer; }
  #avisosPainel .item > b .ex { display: inline-grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; background: #c0281c; color: #fff; font: bold 13px sans-serif; flex: none; }
  #avisosPainel .item .corpo { margin-top: 4px; font-size: 14px; }
  #avisosPainel .item.fechado .corpo { display: none; }
  #avisosPainel .vazio { opacity: .7; }
  html.toque #avisosBt { left: max(10px, var(--sa-left, env(safe-area-inset-left, 0px))); top: calc(max(8px, var(--sa-top, env(safe-area-inset-top, 0px))) + 88px); width: 36px; height: 36px; }`;
  document.head.appendChild(estilo);
  const bt = document.createElement('button'); bt.id = 'avisosBt'; bt.setAttribute('aria-label', 'Avisos');
  bt.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h11a2 2 0 0 1 2 2v13a3 3 0 0 1-3 3H7"/><path d="M6 3a2 2 0 0 0-2 2v2h4V5a2 2 0 0 0-2-2z"/><path d="M8 7v11a3 3 0 0 1-3 3"/><path d="M11 8h5M11 12h5M11 16h3"/></svg><span class="qt"></span>';
  const painel = document.createElement('div'); painel.id = 'avisosPainel';
  painel.innerHTML = '<div class="caixa"><button class="fecharAv" aria-label="Fechar">✕</button><h2>Avisos</h2><div class="lista"></div></div>';
  document.body.append(bt, painel);
  const lista = painel.querySelector('.lista'), itens = [];
  const parar = (e) => e.stopPropagation();
  for (const ev of ['pointerdown', 'pointerup', 'click', 'touchstart']) { bt.addEventListener(ev, parar); painel.addEventListener(ev, parar); }
  for (const ev of ['keydown', 'keyup']) painel.addEventListener(ev, parar);   // digitar num campo do aviso não anda o pirata
  function desenhar() {
    const nao = itens.filter((i) => !i.lido).length;
    bt.classList.toggle('novo', nao > 0); bt.querySelector('.qt').textContent = nao ? (nao > 9 ? '9+' : nao) : '';
    if (!painel.classList.contains('aberto')) return;
    lista.innerHTML = itens.length ? '' : '<p class="vazio">Nenhum aviso por enquanto.</p>';
    for (const it of itens) {
      const d = document.createElement('div'); d.className = 'item' + (it.fechado ? ' fechado' : '');
      const t = document.createElement('b'); t.innerHTML = (it.lido ? '' : '<span class="ex">!</span>') + it.titulo;
      t.onclick = () => { it.fechado = !it.fechado; it.lido = true; desenhar(); };
      const c = document.createElement('div'); c.className = 'corpo';
      if (typeof it.corpo === 'string') c.innerHTML = it.corpo; else c.appendChild(it.corpo);
      d.append(t, c); lista.appendChild(d);
    }
  }
  function abrir() { painel.classList.add('aberto'); desenhar(); for (const i of itens) i.lido = true; setTimeout(desenhar, 1200); }
  function fechar() { painel.classList.remove('aberto'); desenhar(); }
  bt.onclick = () => (painel.classList.contains('aberto') ? fechar() : abrir());
  painel.querySelector('.fecharAv').onclick = fechar;
  painel.addEventListener('click', (e) => { if (e.target === painel) fechar(); });
  const api = {
    novo(id, titulo, corpo, { abrir: ja = false, fechado = false } = {}) {
      const velho = itens.findIndex((i) => i.id === id); if (velho >= 0) itens.splice(velho, 1);
      itens.unshift({ id, titulo, corpo, lido: false, fechado });
      if (itens.length > 30) itens.length = 30;
      desenhar(); if (ja) abrir();
    },
    remover(id) { const k = itens.findIndex((i) => i.id === id); if (k >= 0) { itens.splice(k, 1); desenhar(); } },
    abrir, fechar, aberto: () => painel.classList.contains('aberto'),
  };
  window.avisosJogo = api;
  return api;
}
