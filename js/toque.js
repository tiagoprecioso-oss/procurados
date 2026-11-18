// TOQUE: controles na tela para celular e tablet.
// Os botões "apertam" as mesmas teclas do computador (eventos de teclado sintéticos), então a lógica
// do jogo é uma só para todo mundo. O joystick flutuante move em qualquer direção (joy.x, joy.y)
// e também aperta W A S D (+ Shift ao empurrar até a borda).
export const ehToque = (() => {
  try { return matchMedia('(pointer: coarse)').matches || (navigator.maxTouchPoints > 0 && matchMedia('(hover: none)').matches); } catch { return false; }
})();

export const ehIOS = (() => {
  try { return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); } catch { return false; }
})();

const naCascaPropria = (() => {
  try { return window.top !== window && window.top.location.origin === location.origin && !!window.top.document.getElementById('jogo'); } catch { return false; }
})();
const naMolduraExterna = (() => {
  try { return window.top !== window && !naCascaPropria; } catch { return true; }
})();

export const instalado = (() => {
  try {
    const checar = (w) => w.matchMedia?.('(display-mode: fullscreen), (display-mode: standalone)').matches || w.navigator?.standalone === true;
    return checar(window) || (naCascaPropria && checar(window.top));
  } catch { return false; }
})();

// prompt de instalação nativo (Android Chrome): pode vir desta janela ou da casca index.html
let promptInstalar = null;
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); promptInstalar = e; dispatchEvent(new Event('cap-instalar-pronto')); });
export function obterPromptInstalacao() {
  if (promptInstalar) return promptInstalar;
  try { if (naCascaPropria && window.top.__instalarPrompt) return window.top.__instalarPrompt; } catch {}
  return null;
}
export async function instalarApp() {
  const p = obterPromptInstalacao(); if (!p) return false;
  try {
    p.prompt();
    const r = await p.userChoice;
    promptInstalar = null;
    try { if (naCascaPropria) window.top.__instalarPrompt = null; } catch {}
    return r?.outcome === 'accepted';
  } catch { return false; }
}

// Dimensões reais da área visível (no Safari do iPhone, visualViewport acompanha a barra do navegador)
export function medidasTela() {
  const vv = window.visualViewport;
  return { w: Math.round(vv?.width || innerWidth), h: Math.round(vv?.height || innerHeight) };
}
export function observarTela(fn) {
  let t1 = 0, t2 = 0;
  const chamar = () => {
    fn();
    clearTimeout(t1); clearTimeout(t2);
    t1 = setTimeout(fn, 180);
    t2 = setTimeout(fn, 420);
  };
  addEventListener('resize', chamar);
  addEventListener('orientationchange', chamar);
  window.visualViewport?.addEventListener('resize', chamar);
  return chamar;
}

const CSS = `
  :root {
    --sa-top: env(safe-area-inset-top, 0px);
    --sa-right: env(safe-area-inset-right, 0px);
    --sa-bottom: env(safe-area-inset-bottom, 0px);
    --sa-left: env(safe-area-inset-left, 0px);
  }
  html.toque, html.toque body { touch-action: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; overscroll-behavior: none; height: 100%; height: 100dvh; }
  .tq { position: fixed; z-index: 8; pointer-events: none; }
  .tq * { -webkit-tap-highlight-color: transparent; }
  .tq-bt { pointer-events: auto; width: 54px; height: 54px; border-radius: 50%; border: 2.5px solid rgba(214,178,120,.8); background: rgba(24,15,7,.52);
    color: #f4e3bd; font: 20px var(--fonte-titulo, Georgia, serif); display: grid; place-items: center; line-height: 1; padding: 0; backdrop-filter: blur(2px);
    box-shadow: 0 3px 10px rgba(0,0,0,.38); transition: transform .08s, background .12s, border-color .15s, opacity .15s; touch-action: none; position: relative; }
  .tq-bt small { display: block; font: 9.5px/1.05 var(--fonte-texto, Georgia, serif); opacity: .9; margin-top: 1px; max-width: 58px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .tq-bt.on { background: rgba(214,178,120,.62); color: #2b1d0e; transform: scale(.93); }
  .tq-bt.apagado { opacity: .34; }
  .tq-bt.destaque { border-color: #ffd76a; background: rgba(168,118,32,.62); box-shadow: 0 0 14px rgba(255,215,106,.55), 0 3px 10px rgba(0,0,0,.4); }
  .tq-bt.grande { width: 68px; height: 68px; font-size: 25px; }
  .tq-bt.ataque { width: 76px; height: 76px; font-size: 28px; border-width: 3px; border-color: rgba(255,210,106,.88); background: rgba(120,34,20,.58); }
  .tq-bt.ataque.mirando { background: rgba(214,154,48,.65); border-color: #ffe89a; }
  .tq-bt.peq { width: 42px; height: 42px; font-size: 16px; }
  .tq-bt[hidden] { display: none !important; }
  .tq-bt .ponto-mira { position: absolute; left: 50%; top: 50%; width: 28px; height: 28px; margin: -14px 0 0 -14px; border-radius: 50%;
    background: rgba(255,228,132,.85); border: 2px solid #2b1d0e; pointer-events: none; display: none; }
  .tq-bt.mirando .ponto-mira { display: block; }

  /* Ações da direita: grade padrão (mar/carta) e arco ergonômico para o polegar (terra) */
  #tq-acoes { right: max(12px, var(--sa-right)); bottom: max(12px, var(--sa-bottom)); display: grid; grid-template-columns: repeat(2, auto); gap: 10px; align-items: end; justify-items: center; }
  #tq-acoes.arco { display: block; width: 158px; height: 158px; right: max(12px, var(--sa-right)); bottom: max(10px, var(--sa-bottom)); }
  #tq-acoes.arco .tq-bt { position: absolute; }
  #tq-acoes.arco [data-nome="atacar"] { right: 0; bottom: 0; }
  #tq-acoes.arco [data-nome="usar"] { right: 6px; bottom: 86px; }
  #tq-acoes.arco [data-nome="esquiva"] { right: 88px; bottom: 12px; }
  #tq-acoes.arco [data-nome="arma"] { right: 86px; bottom: 80px; }

  #tq-topo { right: max(10px, var(--sa-right)); top: max(8px, var(--sa-top)); display: flex; gap: 6px; }
  #tq-topo .tq-bt { width: 42px; height: 42px; font-size: 17px; }
  #tq-topo .tq-bt small { font-size: 8.5px; }
  #tq-esq { left: max(12px, var(--sa-left)); bottom: max(14px, var(--sa-bottom)); display: flex; gap: 12px; align-items: end; }
  html.tela-aberta #tq-acoes, html.tela-aberta #tq-joy-zona, html.tela-aberta #tq-meio, html.tela-aberta #tq-esq { display: none; }
  #tq-meio { left: 50%; transform: translateX(-50%); bottom: calc(max(12px, var(--sa-bottom)) + 64px); display: flex; gap: 8px; }

  /* Joystick flutuante: área invisível ampla à esquerda para nunca errar o polegar */
  #tq-joy-zona { left: 0; bottom: 0; width: min(230px, 38vw); height: min(230px, 58dvh); pointer-events: auto; touch-action: none; }
  #tq-joy { position: absolute; left: calc(max(14px, var(--sa-left)) + 4px); bottom: calc(max(12px, var(--sa-bottom)) + 4px); width: 118px; height: 118px; border-radius: 50%; pointer-events: none;
    background: radial-gradient(circle, rgba(24,15,7,.2) 52%, rgba(24,15,7,.46)); border: 2.5px solid rgba(214,178,120,.6); transition: border-color .15s, box-shadow .15s, opacity .2s; opacity: .78; }
  #tq-joy.ativo { opacity: 1; }
  #tq-joy.correndo { border-color: #ffd76a; box-shadow: 0 0 14px rgba(255,215,106,.5); }
  #tq-joy i { position: absolute; left: 50%; top: 50%; width: 50px; height: 50px; margin: -25px 0 0 -25px; border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, #f5dfb0, #c89f5c); border: 2px solid rgba(43,29,14,.7); box-shadow: 0 2px 6px rgba(0,0,0,.45); }

  #tq-gire { position: fixed; inset: 0; z-index: 50; display: none; place-items: center; text-align: center; padding: 30px; background: #1f2a33; color: #f4e3bd;
    font: 22px var(--fonte-titulo, Georgia, serif); }
  @media (orientation: portrait) { html.toque.deitado #tq-gire { display: grid; } }
  @media (max-height: 360px) {
    #tq-joy { width: 104px; height: 104px; }
    #tq-joy i { width: 44px; height: 44px; margin: -22px 0 0 -22px; }
    #tq-acoes.arco { width: 144px; height: 144px; }
    .tq-bt.ataque { width: 68px; height: 68px; font-size: 24px; }
    .tq-bt.grande { width: 60px; height: 60px; font-size: 22px; }
    #tq-acoes.arco [data-nome="usar"] { bottom: 76px; }
    #tq-acoes.arco [data-nome="esquiva"] { right: 78px; }
    #tq-acoes.arco [data-nome="arma"] { right: 76px; bottom: 72px; }
  }
`;

// tecla sintética: o jogo escuta keydown/keyup na janela
const tecla = (tipo, key) => dispatchEvent(new KeyboardEvent(tipo, { key, bubbles: true, cancelable: true }));
// joystick analógico: direção livre (x para a direita, y para cima, de -1 a 1). A terra anda por aqui;
// o mar continua usando as teclas que o joystick também aperta.
export const joy = { x: 0, y: 0, ativo: false, correndo: false };
// mira manual no botão de ataque (segurar e arrastar ⚔ para apontar o arco ou golpe)
export const mira = { ativo: false, x: 0, y: 0, forca: 0 };

const aperto = (el, key) => {   // segurar = tecla apertada; soltar = tecla solta
  const des = () => { if (!el.classList.contains('on')) return; el.classList.remove('on'); tecla('keyup', key); };
  el.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); try { el.setPointerCapture(e.pointerId); } catch {} el.classList.add('on'); tecla('keydown', key); });
  el.addEventListener('pointerup', des); el.addEventListener('pointercancel', des); el.addEventListener('lostpointercapture', des);
};
const clique = (el, f, nativo = false) => {
  if (nativo) {
    // click nativo preserva a "ativação de usuário" exigida por requestFullscreen() no Android/iPad
    el.addEventListener('pointerdown', (e) => { e.stopPropagation(); el.classList.add('on'); });
    const fim = () => el.classList.remove('on');
    el.addEventListener('pointerup', fim); el.addEventListener('pointercancel', fim);
    el.addEventListener('click', (e) => { e.stopPropagation(); f(e); });
    return;
  }
  el.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); el.classList.add('on'); });
  const fim = () => el.classList.remove('on');
  el.addEventListener('pointerup', (e) => { e.stopPropagation(); if (el.classList.contains('on')) { fim(); f(e); } });
  el.addEventListener('pointercancel', fim);
};
const botaoMira = (el, onToque, onSoltar) => {
  const ponto = document.createElement('i'); ponto.className = 'ponto-mira'; el.appendChild(ponto);
  let dedo = null, cx = 0, cy = 0, arrastou = false;
  const R = 48;
  el.addEventListener('pointerdown', (e) => {
    e.preventDefault(); e.stopPropagation();
    dedo = e.pointerId; arrastou = false;
    try { el.setPointerCapture(dedo); } catch {}
    const r = el.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2;
    el.classList.add('on');
  });
  el.addEventListener('pointermove', (e) => {
    if (e.pointerId !== dedo) return;
    let dx = e.clientX - cx, dy = e.clientY - cy; const d = Math.hypot(dx, dy);
    if (d > 14) arrastou = true;
    if (!arrastou) return;
    const k = d > R ? R / d : 1;
    ponto.style.transform = `translate(${dx * k}px,${dy * k}px)`;
    el.classList.add('mirando');
    mira.ativo = true; mira.x = dx / Math.max(1, d); mira.y = -dy / Math.max(1, d); mira.forca = Math.min(1, d / R);
  });
  const fim = (e) => {
    if (e.pointerId !== dedo) return;
    dedo = null; el.classList.remove('on', 'mirando'); ponto.style.transform = '';
    const eraMira = arrastou && mira.ativo, mx = mira.x, my = mira.y;
    mira.ativo = false; mira.x = 0; mira.y = 0; mira.forca = 0;
    if (e.type !== 'pointerup') return;
    if (eraMira) onSoltar?.(mx, my);
    else onToque?.(e);
  };
  el.addEventListener('pointerup', fim); el.addEventListener('pointercancel', fim);
};

function botao(pai, { nome, rotulo, legenda, key, f, classe = '', clickNativo = false, miraArraste = false, onSoltarMira = null }) {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'tq-bt ' + classe;
  if (nome) b.dataset.nome = nome;
  b.innerHTML = `<span class="rot">${rotulo}</span>${legenda ? `<small class="leg">${legenda}</small>` : ''}`;
  if (miraArraste) botaoMira(b, f, onSoltarMira);
  else if (key) aperto(b, key);
  else clique(b, f, clickNativo);
  pai.appendChild(b); return b;
}
function area(id, classe = '') { const d = document.createElement('div'); d.id = id; d.className = 'tq' + (classe ? ' ' + classe : ''); document.body.appendChild(d); return d; }

// Guia visual de tela cheia (especialmente para iPhone Safari, onde a Apple só esconde a barra
// quando o site é aberto pelo ícone da Tela de Início).
export function abrirGuiaTelaCheia() {
  let el = document.getElementById('tq-guia-tela');
  if (!el) {
    const st = document.createElement('style');
    st.textContent = `
      #tq-guia-tela { position: fixed; inset: 0; z-index: 70; display: none; place-items: center; background: rgba(12,8,4,.72); padding: 14px; }
      #tq-guia-tela.aberto { display: grid; }
      #tq-guia-tela .cx { position: relative; width: min(460px, 94vw); max-height: calc(100dvh - 24px); overflow-y: auto; -webkit-overflow-scrolling: touch; touch-action: pan-y;
        background: #f4e8cd; color: #2b1d0e; border: 3px solid #5e3a1e; border-radius: 12px; padding: 14px 18px 16px;
        font: 15px/1.45 var(--fonte-texto, Georgia, serif); box-shadow: 0 10px 30px rgba(0,0,0,.55); }
      #tq-guia-tela h3 { margin: 0 38px 8px 0; font: 24px var(--fonte-titulo, Georgia, serif); font-weight: normal; color: #5e3a1e; }
      #tq-guia-tela .passos { margin: 8px 0 12px; padding-left: 20px; }
      #tq-guia-tela .passos li { margin: 6px 0; }
      #tq-guia-tela .ic-comp { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 6px; background: #1e6fb8; color: #fff; vertical-align: -5px; margin: 0 2px; }
      #tq-guia-tela .nota { font-size: 13px; opacity: .82; background: rgba(94,58,30,.1); padding: 7px 10px; border-radius: 6px; margin: 8px 0 12px; }
      #tq-guia-tela .acoes { display: flex; gap: 8px; justify-content: flex-end; }
      #tq-guia-tela button { padding: 8px 16px; border-radius: 6px; border: 2px solid #5e3a1e; background: #5e3a1e; color: #f4e8cd; font: 16px var(--fonte-texto, Georgia, serif); cursor: pointer; }
      #tq-guia-tela .fecharG { position: absolute; right: 8px; top: 8px; width: 38px; height: 38px; padding: 0; border-radius: 50%; display: grid; place-items: center; font: bold 18px sans-serif; }
    `;
    document.head.appendChild(st);
    el = document.createElement('div'); el.id = 'tq-guia-tela';
    const icShare = '<span class="ic-comp"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg></span>';
    const corpo = ehIOS
      ? `<p>No iPhone, o Safari só esconde de vez a barra de endereços quando você abre o jogo como <b>App na Tela de Início</b> (leva 10 segundos, sem baixar da loja):</p>
         <ol class="passos">
           <li>Toque no botão <b>Compartilhar</b> ${icShare} na barra do Safari.</li>
           <li>Role para baixo e toque em <b>Adicionar à Tela de Início</b> → <b>Adicionar</b>.</li>
           <li>Feche o Safari e abra o <b>Procurados</b> pelo ícone na sua tela inicial.</li>
         </ol>
         <div class="nota">Seu progresso continua salvo. Se já tinha um pirata no Safari, anote o <b>Código de Pirata</b> na Pausa para trazê-lo para o App se precisar.</div>`
      : `<p>Para jogar sem a barra do navegador:</p>
         <ol class="passos">
           <li>Toque no menu do navegador (<b>⋮</b>) e escolha <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>.</li>
           <li>Abra o <b>Procurados</b> pelo ícone novo: fica 100% em tela cheia.</li>
         </ol>`;
    el.innerHTML = `<div class="cx"><button class="fecharG" aria-label="Fechar">✕</button><h3>Jogar em Tela Cheia</h3>${corpo}<div class="acoes"><button class="okG">Entendi</button></div></div>`;
    for (const ev of ['pointerdown', 'pointerup', 'click', 'touchstart']) el.addEventListener(ev, (e) => e.stopPropagation());
    const fechar = () => el.classList.remove('aberto');
    el.querySelector('.fecharG').onclick = fechar;
    el.querySelector('.okG').onclick = fechar;
    el.addEventListener('click', (e) => { if (e.target === el) fechar(); });
    document.body.appendChild(el);
  }
  el.classList.add('aberto');
}

// aviso curto na tela (para quando o celular não deixa fazer algo)
export function avisoToque(txt, seg = 6) {
  if (window.avisosJogo) { window.avisosJogo.novo('aviso-' + Date.now(), 'Aviso', txt, { abrir: true }); return; }
  let el = document.getElementById('tq-aviso');
  if (!el) { el = document.createElement('div'); el.id = 'tq-aviso'; el.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:60;max-width:80vw;padding:14px 18px;border-radius:10px;background:rgba(15,10,5,.88);color:#f3e6c8;font:16px var(--fonte-texto, Georgia, serif);text-align:center;line-height:1.4;box-shadow:0 6px 20px rgba(0,0,0,.5)'; el.onclick = () => (el.style.display = 'none'); document.body.appendChild(el); }
  el.innerHTML = txt; el.style.display = 'block'; clearTimeout(el._t); el._t = setTimeout(() => (el.style.display = 'none'), seg * 1000);
}

// TECLADO NA TELA CHEIA: no itch.io o jogo roda dentro de uma moldura (iframe). Quando a tela cheia é ligada
// pelo botão do itch.io ou pelo F11, o teclado às vezes fica com a página de fora e o jogo para de ouvir as teclas.
{
  const focar = () => { try { window.focus(); document.body?.focus?.({ preventScroll: true }); } catch {} };
  if (document.body && !document.body.hasAttribute('tabindex')) document.body.tabIndex = -1;
  addEventListener('pointerdown', focar, true);
  for (const ev of ['fullscreenchange', 'webkitfullscreenchange']) document.addEventListener(ev, () => { focar(); setTimeout(focar, 120); });
  addEventListener('resize', () => setTimeout(focar, 60));
  addEventListener('load', focar);
}

// Tela cheia.
// - Na nossa casca (index.html do GitHub Pages), pede tela cheia na janela de fora para NÃO sair ao trocar entre menu/terra/mar/carta.
// - No iPhone Safari fora do App: abre o guia visual de 2 passos (a Apple bloqueia requestFullscreen no iPhone).
// - No itch.io se o iframe bloquear: abre em aba própria.
export function telaCheia() {
  const doc = naCascaPropria ? window.top.document : document;
  const d = doc.documentElement;
  if (doc.fullscreenElement || doc.webkitFullscreenElement) { (doc.exitFullscreen || doc.webkitExitFullscreen)?.call(doc); return; }
  const pedir = d.requestFullscreen || d.webkitRequestFullscreen;
  const semTelaCheia = () => {
    if (naMolduraExterna) { const w = window.open(location.href, '_blank'); if (w) return; }
    abrirGuiaTelaCheia();
  };
  if (!pedir || !(doc.fullscreenEnabled || doc.webkitFullscreenEnabled)) return semTelaCheia();
  try {
    const p = pedir.call(d);
    if (p && p.then) p.then(() => screen.orientation?.lock?.('landscape').catch(() => {})).catch(semTelaCheia);
  } catch { semTelaCheia(); }
}

// Monta os controles. cfg = { joystick: true|false, arco: true|false, acoes: [...], topo: [...], meio: [...], esquerda: [...], deitado: true }
// Cada botão: { nome, rotulo, legenda, key } (segura a tecla) ou { nome, rotulo, legenda, f } (toque simples).
// Devolve { mostrar, apagar, destacar, texto, ativo }.
export function criarControles(cfg) {
  if (!ehToque) return { mostrar() {}, apagar() {}, destacar() {}, texto() {}, ativo: false };
  document.documentElement.classList.add('toque');
  if (cfg.deitado !== false) document.documentElement.classList.add('deitado');
  if (instalado) document.documentElement.classList.add('instalado');
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  const gire = document.createElement('div'); gire.id = 'tq-gire';
  gire.innerHTML = '<div>Gire o celular<br><small style="font-size:15px;opacity:.8">o jogo é na tela deitada</small></div>';
  document.body.appendChild(gire);
  const bts = {};
  for (const [lugar, lista, extraClasse] of [
    ['tq-acoes', cfg.acoes, cfg.arco ? 'arco' : ''],
    ['tq-topo', cfg.topo, ''],
    ['tq-meio', cfg.meio, ''],
    ['tq-esq', cfg.esquerda, ''],
  ]) {
    if (!lista?.length) continue;
    const a = area(lugar, extraClasse);
    for (const b of lista) {
      const ehBotaoTela = b.nome === 'cheia';
      const opt = ehBotaoTela ? { ...b, clickNativo: true, legenda: ehIOS && !instalado ? 'app' : b.legenda } : b;
      const el = botao(a, opt);
      if (ehBotaoTela && instalado) el.hidden = true;   // já está aberto como App sem barra do navegador
      bts[b.nome] = el;
    }
  }
  if (cfg.joystick) {
    const zona = area('tq-joy-zona');
    const j = document.createElement('div'); j.id = 'tq-joy';
    const pino = document.createElement('i'); j.appendChild(pino); zona.appendChild(j);
    let dedo = null, cx = 0, cy = 0, R = 59;
    const apertadas = new Set();
    const ajustarTeclas = (quer) => {
      for (const k of ['w', 'a', 's', 'd', 'shift']) {
        if (quer.has(k) && !apertadas.has(k)) { apertadas.add(k); tecla('keydown', k); }
        else if (!quer.has(k) && apertadas.has(k)) { apertadas.delete(k); tecla('keyup', k); }
      }
    };
    const mover = (e) => {
      let dx = e.clientX - cx, dy = e.clientY - cy; const d = Math.hypot(dx, dy);
      if (d > R) { dx *= R / d; dy *= R / d; }
      pino.style.transform = `translate(${dx}px,${dy}px)`;
      const mag = d / R;
      joy.ativo = mag > 0.16;
      joy.correndo = mag > 0.86;
      joy.x = joy.ativo ? dx / R : 0;
      joy.y = joy.ativo ? -dy / R : 0;
      j.classList.toggle('correndo', joy.correndo);
      const quer = new Set();
      if (mag > 0.22) {   // 8 direções (para o mar/carta), a terra usa joy.x / joy.y livres
        const a = Math.atan2(-dy, dx), s = Math.round(a / (Math.PI / 4));
        const dir = [['d'], ['d', 'w'], ['w'], ['w', 'a'], ['a'], ['a', 's'], ['s'], ['s', 'd'], ['d']][(s + 8) % 8];
        dir.forEach((k) => quer.add(k));
        if (joy.correndo) quer.add('shift');
      }
      ajustarTeclas(quer);
    };
    zona.addEventListener('pointerdown', (e) => {
      if (dedo !== null) return;
      e.preventDefault(); e.stopPropagation();
      dedo = e.pointerId; try { zona.setPointerCapture(dedo); } catch {}
      const zr = zona.getBoundingClientRect(), jr = j.getBoundingClientRect();
      R = jr.width / 2;
      // centraliza o joystick onde o polegar encostou (preso dentro da zona segura)
      const lx = Math.max(R + 6, Math.min(zr.width - R - 6, e.clientX - zr.left));
      const ly = Math.max(R + 6, Math.min(zr.height - R - 6, e.clientY - zr.top));
      j.style.left = (lx - R) + 'px'; j.style.top = (ly - R) + 'px'; j.style.bottom = 'auto';
      j.classList.add('ativo');
      cx = zr.left + lx; cy = zr.top + ly;
      mover(e);
    });
    zona.addEventListener('pointermove', (e) => { if (e.pointerId === dedo) mover(e); });
    const solta = (e) => {
      if (e.pointerId !== dedo) return;
      dedo = null;
      pino.style.transform = '';
      j.style.left = ''; j.style.top = ''; j.style.bottom = '';
      j.classList.remove('ativo', 'correndo');
      joy.ativo = false; joy.correndo = false; joy.x = 0; joy.y = 0;
      ajustarTeclas(new Set());
    };
    zona.addEventListener('pointerup', solta); zona.addEventListener('pointercancel', solta);
  }
  addEventListener('contextmenu', (e) => e.preventDefault());
  return {
    ativo: true,
    mostrar(nome, sim) { if (bts[nome] && bts[nome].hidden === !!sim) bts[nome].hidden = !sim; },
    apagar(nome, sim) { bts[nome]?.classList.toggle('apagado', !!sim); },
    destacar(nome, sim) { bts[nome]?.classList.toggle('destaque', !!sim); },
    texto(nome, legenda, rotulo) {
      const b = bts[nome]; if (!b) return;
      if (legenda !== undefined) { const l = b.querySelector('.leg'); if (l && l.textContent !== legenda) l.textContent = legenda; }
      if (rotulo !== undefined) { const r = b.querySelector('.rot'); if (r && r.textContent !== rotulo) r.textContent = rotulo; }
    },
  };
}

// APLICATIVO: registra o service worker (só onde é permitido: https ou localhost),
// para o celular oferecer "instalar" e abrir o jogo sem a barra do navegador.
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
