// TOQUE: controles na tela para celular e tablet.
// Os botões "apertam" as mesmas teclas do computador (eventos de teclado sintéticos), então a lógica
// do jogo é uma só para todo mundo. O joystick vira W A S D (+ Shift quando empurrado até o fim).
export const ehToque = (() => {
  try { return matchMedia('(pointer: coarse)').matches || (navigator.maxTouchPoints > 0 && matchMedia('(hover: none)').matches); } catch { return false; }
})();

const CSS = `
  html.toque, html.toque body { touch-action: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; overscroll-behavior: none; }
  .tq { position: fixed; z-index: 8; pointer-events: none; }
  .tq * { -webkit-tap-highlight-color: transparent; }
  .tq-bt { pointer-events: auto; width: 58px; height: 58px; border-radius: 50%; border: 3px double rgba(214,178,120,.75); background: rgba(28,18,8,.45);
    color: #f4e3bd; font: 22px var(--fonte-titulo, Georgia, serif); display: grid; place-items: center; line-height: 1; padding: 0; backdrop-filter: blur(2px); }
  .tq-bt small { display: block; font: 10px var(--fonte-texto, Georgia, serif); opacity: .85; margin-top: 1px; }
  .tq-bt.on { background: rgba(214,178,120,.55); color: #2b1d0e; transform: scale(.94); }
  .tq-bt.apagado { opacity: .35; }
  .tq-bt.grande { width: 74px; height: 74px; font-size: 28px; }
  .tq-bt.peq { width: 44px; height: 44px; font-size: 17px; }
  .tq-bt[hidden] { display: none; }
  #tq-acoes { right: max(14px, env(safe-area-inset-right)); bottom: 16px; display: grid; grid-template-columns: repeat(2, auto); gap: 10px; align-items: end; justify-items: center; }
  #tq-topo { right: max(10px, env(safe-area-inset-right)); top: 10px; display: flex; gap: 8px; }
  #tq-esq { left: max(14px, env(safe-area-inset-left)); bottom: 16px; display: flex; gap: 12px; align-items: end; }
  html.tela-aberta #tq-acoes, html.tela-aberta #tq-joy, html.tela-aberta #tq-meio, html.tela-aberta #tq-esq { display: none; }
  #tq-meio { left: 50%; transform: translateX(-50%); bottom: 108px; display: flex; gap: 10px; }
  #tq-joy { left: max(18px, env(safe-area-inset-left)); bottom: 18px; width: 128px; height: 128px; border-radius: 50%; pointer-events: auto;
    background: radial-gradient(circle, rgba(28,18,8,.25) 55%, rgba(28,18,8,.45)); border: 3px double rgba(214,178,120,.6); }
  #tq-joy i { position: absolute; left: 50%; top: 50%; width: 54px; height: 54px; margin: -27px 0 0 -27px; border-radius: 50%;
    background: rgba(214,178,120,.7); border: 2px solid rgba(43,29,14,.6); }
  #tq-gire { position: fixed; inset: 0; z-index: 50; display: none; place-items: center; text-align: center; padding: 30px; background: #1f2a33; color: #f4e3bd;
    font: 22px var(--fonte-titulo, Georgia, serif); }
  @media (orientation: portrait) { html.toque.deitado #tq-gire { display: grid; } }
`;

// tecla sintética: o jogo escuta keydown/keyup na janela
const tecla = (tipo, key) => dispatchEvent(new KeyboardEvent(tipo, { key, bubbles: true, cancelable: true }));
// joystick analógico: direção livre (x para a direita, y para cima, de -1 a 1). A terra anda por aqui;
// o mar continua usando as teclas que o joystick também aperta.
export const joy = { x: 0, y: 0, ativo: false };
const aperto = (el, key) => {   // segurar = tecla apertada; soltar = tecla solta
  const des = () => { if (!el.classList.contains('on')) return; el.classList.remove('on'); tecla('keyup', key); };
  el.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); try { el.setPointerCapture(e.pointerId); } catch {} el.classList.add('on'); tecla('keydown', key); });
  el.addEventListener('pointerup', des); el.addEventListener('pointercancel', des); el.addEventListener('lostpointercapture', des);
};
const clique = (el, f) => {
  el.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); el.classList.add('on'); });
  const fim = () => el.classList.remove('on');
  el.addEventListener('pointerup', (e) => { if (el.classList.contains('on')) { fim(); f(e); } }); el.addEventListener('pointercancel', fim);
};

function botao(pai, { rotulo, legenda, key, f, classe = '' }) {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'tq-bt ' + classe;
  b.innerHTML = `<span>${rotulo}${legenda ? `<small>${legenda}</small>` : ''}</span>`;
  if (key) aperto(b, key); else clique(b, f);
  pai.appendChild(b); return b;
}
function area(id) { const d = document.createElement('div'); d.id = id; d.className = 'tq'; document.body.appendChild(d); return d; }

// aviso curto na tela (para quando o celular não deixa fazer algo)
export function avisoToque(txt, seg = 6) {
  if (window.avisosJogo) { window.avisosJogo.novo('aviso-' + Date.now(), 'Aviso', txt, { abrir: true }); return; }   // na central de avisos, sem caixa solta
  let el = document.getElementById('tq-aviso');
  if (!el) { el = document.createElement('div'); el.id = 'tq-aviso'; el.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:60;max-width:80vw;padding:14px 18px;border-radius:10px;background:rgba(15,10,5,.88);color:#f3e6c8;font:16px var(--fonte-texto, Georgia, serif);text-align:center;line-height:1.4;box-shadow:0 6px 20px rgba(0,0,0,.5)'; el.onclick = () => (el.style.display = 'none'); document.body.appendChild(el); }
  el.innerHTML = txt; el.style.display = 'block'; clearTimeout(el._t); el._t = setTimeout(() => (el.style.display = 'none'), seg * 1000);
}
// TECLADO NA TELA CHEIA: no itch.io o jogo roda dentro de uma moldura (iframe). Quando a tela cheia é ligada
// pelo botão do itch.io ou pelo F11, o teclado às vezes fica com a página de fora e o jogo para de ouvir as teclas.
// Aqui o jogo pega o foco de volta ao entrar ou sair da tela cheia, ao mudar de tamanho e a cada clique.
{
  const focar = () => { try { window.focus(); document.body?.focus?.({ preventScroll: true }); } catch {} };
  if (document.body && !document.body.hasAttribute('tabindex')) document.body.tabIndex = -1;
  addEventListener('pointerdown', focar, true);
  for (const ev of ['fullscreenchange', 'webkitfullscreenchange']) document.addEventListener(ev, () => { focar(); setTimeout(focar, 120); });
  addEventListener('resize', () => setTimeout(focar, 60));
  addEventListener('load', focar);
}
// Tela cheia. No Android funciona; no iPhone (Safari) o navegador não deixa uma página entrar em tela cheia,
// e dentro do itch.io o jogo roda numa moldura: aí o botão explica o caminho que funciona.
export function telaCheia() {
  const d = document.documentElement, doc = document;
  if (doc.fullscreenElement || doc.webkitFullscreenElement) { (doc.exitFullscreen || doc.webkitExitFullscreen)?.call(doc); return; }
  const pedir = d.requestFullscreen || d.webkitRequestFullscreen;
  // dentro do itch.io o jogo roda numa moldura que às vezes não deixa ficar em tela cheia: aí abre o jogo numa aba só dele,
  // onde a tela cheia funciona (no Android) ou o navegador some ao deitar e rolar (no iPhone)
  const naMoldura = (() => { try { return window.top !== window; } catch { return true; } })();
  const semTelaCheia = () => {
    if (naMoldura) { const w = window.open(location.href, '_blank'); if (w) return; }
    avisoToque('Este celular não deixa o jogo ficar em tela cheia por aqui.<br><b>No itch.io:</b> use o botão <b>⛶</b> no canto de baixo do quadro do jogo.<br><b>No iPhone:</b> deite o celular e role a página um pouco para esconder a barra do navegador, ou use Compartilhar → Adicionar à Tela de Início.');
  };
  if (!pedir || !(doc.fullscreenEnabled || doc.webkitFullscreenEnabled)) return semTelaCheia();
  try {
    const p = pedir.call(d);
    if (p && p.then) p.then(() => screen.orientation?.lock?.('landscape').catch(() => {})).catch(semTelaCheia);
  } catch { semTelaCheia(); }
}

// Monta os controles. cfg = { joystick: true|false, acoes: [...], topo: [...], meio: [...], esquerda: [...], deitado: true }
// Cada botão: { nome, rotulo, legenda, key } (segura a tecla) ou { nome, rotulo, legenda, f } (toque simples).
// Devolve { mostrar(nome, sim), apagar(nome, sim) } para o jogo mostrar botões conforme o momento.
export function criarControles(cfg) {
  if (!ehToque) return { mostrar() {}, apagar() {}, ativo: false };
  document.documentElement.classList.add('toque'); if (cfg.deitado !== false) document.documentElement.classList.add('deitado');
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  const gire = document.createElement('div'); gire.id = 'tq-gire'; gire.innerHTML = '<div>Gire o celular<br><small style="font-size:15px;opacity:.8">o jogo é na tela deitada</small></div>'; document.body.appendChild(gire);
  const bts = {};
  for (const [lugar, lista] of [['tq-acoes', cfg.acoes], ['tq-topo', cfg.topo], ['tq-meio', cfg.meio], ['tq-esq', cfg.esquerda]]) {
    if (!lista?.length) continue; const a = area(lugar);
    for (const b of lista) bts[b.nome] = botao(a, b);
  }
  if (cfg.joystick) {
    const j = area('tq-joy'), pino = document.createElement('i'); j.appendChild(pino);
    let dedo = null; const apertadas = new Set();
    const ajustar = (quer) => { for (const k of ['w', 'a', 's', 'd', 'shift']) { if (quer.has(k) && !apertadas.has(k)) { apertadas.add(k); tecla('keydown', k); } else if (!quer.has(k) && apertadas.has(k)) { apertadas.delete(k); tecla('keyup', k); } } };
    const mover = (e) => {
      const r = j.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, R = r.width / 2;
      let dx = e.clientX - cx, dy = e.clientY - cy; const d = Math.hypot(dx, dy); if (d > R) { dx *= R / d; dy *= R / d; }
      pino.style.transform = `translate(${dx}px,${dy}px)`;
      joy.ativo = d > R * 0.18; joy.x = joy.ativo ? dx / R : 0; joy.y = joy.ativo ? -dy / R : 0;
      const quer = new Set();
      if (d > R * 0.25) {   // 8 direções, como no teclado
        const a = Math.atan2(-dy, dx), s = Math.round(a / (Math.PI / 4));
        const dir = [['d'], ['d', 'w'], ['w'], ['w', 'a'], ['a'], ['a', 's'], ['s'], ['s', 'd'], ['d']][(s + 8) % 8];
        dir.forEach((k) => quer.add(k)); if (d > R * 0.92) quer.add('shift');
      }
      ajustar(quer);
    };
    j.addEventListener('pointerdown', (e) => { e.preventDefault(); dedo = e.pointerId; try { j.setPointerCapture(dedo); } catch {} mover(e); });
    j.addEventListener('pointermove', (e) => { if (e.pointerId === dedo) mover(e); });
    const solta = (e) => { if (e.pointerId !== dedo) return; dedo = null; pino.style.transform = ''; joy.ativo = false; joy.x = joy.y = 0; ajustar(new Set()); };
    j.addEventListener('pointerup', solta); j.addEventListener('pointercancel', solta);
  }
  addEventListener('contextmenu', (e) => e.preventDefault());
  return {
    ativo: true,
    mostrar(nome, sim) { if (bts[nome] && bts[nome].hidden === !!sim) bts[nome].hidden = !sim; },
    apagar(nome, sim) { bts[nome]?.classList.toggle('apagado', !!sim); },
  };
}

// APLICATIVO: registra o service worker (só onde é permitido: https ou localhost; no itch.io não faz diferença),
// para o celular oferecer "instalar" e abrir o jogo em tela cheia, sem a barra do navegador.
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
export const instalado = matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone === true;
