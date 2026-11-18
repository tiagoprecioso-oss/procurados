// Pergaminho queimado: desenhado num canvas ao abrir a página e guardado na variável CSS --pergaminho,
// que a classe .pergaminho usa como moldura (border-image). Usado pela terra e pelo mar.
(() => {
  const S = 360, cv = document.createElement('canvas'); cv.width = cv.height = S; const c = cv.getContext('2d');
  let semente = 7; const rnd = () => ((semente = (semente * 16807) % 2147483647) / 2147483647);
  const m = 16, pts = [], N = 160;
  for (let i = 0; i < N; i++) {
    const t = i / N * 4, lado = Math.floor(t), f = t - lado, j = (rnd() - 0.3) * 9 + Math.sin(i * 0.7) * 3;
    const p = [[m + f * (S - 2 * m), m + j], [S - m - j, m + f * (S - 2 * m)], [S - m - f * (S - 2 * m), S - m - j], [m + j, S - m - f * (S - 2 * m)]][lado]; pts.push(p);
  }
  const borda = () => { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); };
  c.save(); borda(); c.clip();
  const g = c.createRadialGradient(S / 2, S / 2, S * 0.1, S / 2, S / 2, S * 0.62); g.addColorStop(0, '#f6e8c6'); g.addColorStop(0.7, '#ead2a0'); g.addColorStop(1, '#c99d5c');
  c.fillStyle = g; c.fillRect(0, 0, S, S);
  for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(110,70,30,${rnd() * 0.07})`; c.fillRect(rnd() * S, rnd() * S, 1 + rnd() * 2, 1 + rnd() * 2); }
  for (let i = 0; i < 6; i++) { const x = rnd() * S, y = rnd() * S, r = 10 + rnd() * 30; const mg = c.createRadialGradient(x, y, r * 0.4, x, y, r); mg.addColorStop(0, 'rgba(150,100,40,0)'); mg.addColorStop(0.85, 'rgba(150,100,40,.10)'); mg.addColorStop(1, 'rgba(150,100,40,0)'); c.fillStyle = mg; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
  c.filter = 'blur(7px)'; c.lineWidth = 34; c.strokeStyle = 'rgba(105,55,15,.55)'; borda(); c.stroke(); c.filter = 'none';
  c.restore();
  c.shadowColor = 'rgba(40,15,0,.9)'; c.shadowBlur = 6; c.lineWidth = 3.5; c.strokeStyle = '#1e0f05'; borda(); c.stroke();
  c.shadowBlur = 0; c.lineWidth = 1; c.strokeStyle = 'rgba(230,120,30,.55)'; borda(); c.stroke();
  document.documentElement.style.setProperty('--pergaminho', `url(${cv.toDataURL()})`);
})();
