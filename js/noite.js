// NOITE E DIA
// O relógio do mundo é o mesmo para todos os jogadores: sai da hora real (Date.now), sem servidor.
// Um dia do jogo dura 24 minutos reais (1 hora do jogo = 1 minuto). Dia claro das 7h às 17h,
// pôr do sol das 17h às 19h, noite das 19h às 5h, amanhecer das 5h às 7h.
// A escuridão é um véu 2D por cima da tela, com "buracos" de luz em volta das fogueiras, da tocha
// e do próprio jogador: assim escurece tudo junto (chão 3D, bichos e gente 2D, mar), sem mexer nos materiais.
export const DIA_MS = 24 * 60 * 1000;
const AJUSTE = (() => { try { const v = new URLSearchParams(location.search).get('hora'); return v === null ? NaN : +v; } catch { return NaN; } })();   // ?hora=22 para testar
const INICIO = Date.now();
export function hora() {
  if (Number.isFinite(AJUSTE)) return (AJUSTE + (Date.now() - INICIO) / DIA_MS * 24) % 24;   // teste: começa na hora pedida e anda normal
  return ((Date.now() / DIA_MS) % 1) * 24;
}
// 0 = dia claro, 1 = noite fechada
export function escuro(h = hora()) {
  if (h >= 7 && h < 17) return 0;
  if (h >= 19 || h < 5) return 1;
  return h >= 17 ? (h - 17) / 2 : 1 - (h - 5) / 2;
}
export const ehNoite = (h = hora()) => escuro(h) > 0.5;
export function textoHora(h = hora()) {
  const hh = Math.floor(h), mm = Math.floor((h % 1) * 60);
  return `${ehNoite(h) ? '☾' : '☀'} ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}
// cor do véu: laranja no pôr do sol e no amanhecer, azul-escuro na noite
function corVeu(h) {
  const e = escuro(h);
  const crepusculo = (h >= 16 && h < 19) || (h >= 5 && h < 8) ? Math.max(0, 1 - Math.abs(e - 0.35) * 2.2) : 0;
  return { e, crepusculo };
}
// véu: canvas por cima do jogo. luzes = [{ x, y (px na tela), r (px), ry (px, raio de cima a baixo: a luz deitada no chão vira elipse), forca 0..1 }]
export function criarVeu(z = 5) {
  const cv = document.createElement('canvas');
  cv.style.cssText = `position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:${z}`;
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d');
  let ultimo = '';
  function desenhar(luzes = [], h = hora()) {
    const { e, crepusculo } = corVeu(h);
    const L = Math.round(innerWidth / 2), A = Math.round(innerHeight / 2);   // meia resolução: o véu é borrado mesmo
    if (cv.width !== L || cv.height !== A) { cv.width = L; cv.height = A; }
    const chave = e.toFixed(3) + crepusculo.toFixed(3) + luzes.map((l) => `${l.x | 0},${l.y | 0},${l.r | 0},${(l.ry || l.r) | 0},${(l.forca || 1).toFixed(2)}`).join(';');
    if (chave === ultimo) return; ultimo = chave;
    ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, L, A);
    if (crepusculo > 0.01) { ctx.fillStyle = `rgba(255, 120, 50, ${0.16 * crepusculo})`; ctx.fillRect(0, 0, L, A); }
    if (e < 0.01) return;
    ctx.fillStyle = `rgba(8, 16, 42, ${0.72 * e})`; ctx.fillRect(0, 0, L, A);
    ctx.globalCompositeOperation = 'destination-out';
    luzes = luzes.filter((l) => Number.isFinite(l.x) && Number.isFinite(l.y) && Number.isFinite(l.r) && l.r > 0);
    for (const l of luzes) {   // a luz é um disco no chão: na tela vira elipse (achatada pela inclinação da câmera)
      const x = l.x / 2, y = l.y / 2, r = l.r / 2, k = (l.ry || l.r) / l.r, f = Math.min(1, l.forca ?? 1);
      ctx.save(); ctx.translate(x, y); ctx.scale(1, k);
      const g = ctx.createRadialGradient(0, 0, r * 0.15, 0, 0, r);
      g.addColorStop(0, `rgba(0,0,0,${f})`); g.addColorStop(0.55, `rgba(0,0,0,${f * 0.75})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    // brilho quente por cima dos buracos de fogo (fogueira e tocha)
    ctx.globalCompositeOperation = 'source-over';
    for (const l of luzes) if (l.fogo) {
      const x = l.x / 2, y = l.y / 2, r = l.r / 2, k = (l.ry || l.r) / l.r;
      ctx.save(); ctx.translate(x, y); ctx.scale(1, k);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.8);
      g.addColorStop(0, `rgba(255, 170, 70, ${0.22 * e})`); g.addColorStop(1, 'rgba(255, 170, 70, 0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  }
  return { desenhar, elemento: cv };
}
