// NITERÓI REAL NO JOGO (19/11, DESIGN 4b, etapa 2). Liga com terra.html?mundo=real (por enquanto, só para teste).
// O mapa real (dados/niteroi/mapa.png, gerado por ferramentas/mapa/gerar-niteroi.js) é girado e encaixado para que a
// praia de Icaraí real caia sobre a praia do jogo. Dentro da "caixa" da Niterói feita à mão (XMIN..XMAX, ZMIN..ZMAX)
// tudo continua exatamente como era (cidade, lotes, taverna, morro, lagoa, engenho, Fortaleza): é um carimbo.
// Fora dela, o chão, a altura, a água e o bairro vêm do mapa real. O motor usa as mesmas funções de js/mundo-niteroi.js.
import * as V from './mundo-niteroi.js';
export * from './mundo-niteroi.js';

export const REAL = true;
const M = await (await fetch(new URL('../dados/niteroi/niteroi.json', import.meta.url))).json();
const img = await createImageBitmap(await (await fetch(new URL('../dados/niteroi/mapa.png', import.meta.url))).blob(), { colorSpaceConversion: 'none', premultiplyAlpha: 'none' });
const W = M.largura, H = M.altura;
const px = (() => { const c = new OffscreenCanvas(W, H).getContext('2d', { willReadFrequently: true }); c.drawImage(img, 0, 0); return c.getImageData(0, 0, W, H).data; })();
const T_AGUA = M.tipos.indexOf('agua'), T_LAGOA = M.tipos.indexOf('lagoa');

// ---------- encaixe: mapa do jogo (x, z) -> mapa real (X, Z), em metros de jogo. A praia de Icaraí real corre de
// noroeste para sudeste com o mar a sudoeste; a do jogo corre de norte para sul com o mar a oeste: gira ~46°.
const C = 0.690, S = 0.724, TX = 324.3, TZ = 784.4;
const paraReal = (x, z) => [C * x + S * z + TX, -S * x + C * z + TZ];
const doReal = (X, Z) => { const a = X - TX, b = Z - TZ; return [C * a - S * b, S * a + C * b]; };
// até onde se anda: o retângulo do mapa real, levado para as coordenadas do jogo
export const LIM = (() => {
  const cs = [[0, 0], [W, 0], [0, H], [W, H]].map(([X, Z]) => doReal(X, Z));
  return { x0: Math.min(...cs.map((c) => c[0])), x1: Math.max(...cs.map((c) => c[0])), z0: Math.min(...cs.map((c) => c[1])), z1: Math.max(...cs.map((c) => c[1])) };
})();

// ---------- profundidade real: distância (m) até a beira, positiva no mar e negativa na terra (chanfro 3-4, duas passadas)
const dist = (() => {
  const d = new Float32Array(W * H), mar = (i) => px[i * 4] === T_AGUA, INF = 1e6;
  for (let i = 0; i < W * H; i++) d[i] = INF;
  // borda: pixel com vizinho do outro lado vale 0,5
  for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) { const i = z * W + x, m = mar(i); if ((x > 0 && mar(i - 1) !== m) || (z > 0 && mar(i - W) !== m) || (x < W - 1 && mar(i + 1) !== m) || (z < H - 1 && mar(i + W) !== m)) d[i] = 0.5; }
  for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) { const i = z * W + x; let v = d[i]; if (x > 0) v = Math.min(v, d[i - 1] + 1); if (z > 0) { v = Math.min(v, d[i - W] + 1); if (x > 0) v = Math.min(v, d[i - W - 1] + 1.414); if (x < W - 1) v = Math.min(v, d[i - W + 1] + 1.414); } d[i] = v; }
  for (let z = H - 1; z >= 0; z--) for (let x = W - 1; x >= 0; x--) { const i = z * W + x; let v = d[i]; if (x < W - 1) v = Math.min(v, d[i + 1] + 1); if (z < H - 1) { v = Math.min(v, d[i + W] + 1); if (x < W - 1) v = Math.min(v, d[i + W + 1] + 1.414); if (x > 0) v = Math.min(v, d[i + W - 1] + 1.414); } d[i] = v; }
  for (let i = 0; i < W * H; i++) if (!mar(i)) d[i] = -d[i];
  return d;
})();
const dentroReal = (X, Z) => X >= 0 && Z >= 0 && X < W - 1 && Z < H - 1;
function bilinear(get, X, Z) {
  const x = Math.floor(X - 0.5), z = Math.floor(Z - 0.5), u = X - 0.5 - x, v = Z - 0.5 - z;
  const g = (a, b) => get(Math.max(0, Math.min(W - 1, a)), Math.max(0, Math.min(H - 1, b)));
  return (g(x, z) * (1 - u) + g(x + 1, z) * u) * (1 - v) + (g(x, z + 1) * (1 - u) + g(x + 1, z + 1) * u) * v;
}
const altReal = (X, Z) => dentroReal(X, Z) ? bilinear((a, b) => px[(b * W + a) * 4 + 1] / 4, X, Z) : 0;
const profReal = (X, Z) => dentroReal(X, Z) ? bilinear((a, b) => dist[b * W + a], X, Z) : 20;
const pixel = (X, Z, k) => px[(Math.floor(Z) * W + Math.floor(X)) * 4 + k];

// ---------- a caixa feita à mão: dentro dela vale o mundo antigo, sem nenhuma mudança. A EMENDA fica do lado de fora:
// numa faixa de 20 m em volta da caixa, a costa (profundidade), a altura e o chão passam aos poucos do mundo antigo
// (as fórmulas dele continuam valendo fora da caixa) para o real. Onde a terra encontra o mar na faixa, vira areia.
const naCaixa = (x, z) => x > V.XMIN && x < V.XMAX && z > V.ZMIN && z < V.ZMAX;
const FAIXA = 20;
const pesoAntigo = (x, z) => {   // 1 dentro da caixa, cai até 0 a 20 m dela
  const dx = Math.max(V.XMIN - x, 0, x - V.XMAX), dz = Math.max(V.ZMIN - z, 0, z - V.ZMAX), d = Math.hypot(dx, dz);
  return d <= 0 ? 1 : 1 - V.sstep(0, FAIXA, d);
};
export const prof = (x, z) => {
  const w = pesoAntigo(x, z); if (w >= 1) return V.prof(x, z);
  const [X, Z] = paraReal(x, z), r = profReal(X, Z); return w <= 0 ? r : V.prof(x, z) * w + r * (1 - w);
};
export function altura(x, z) {
  const w = pesoAntigo(x, z); if (w >= 1) return V.altura(x, z);
  const [X, Z] = paraReal(x, z), r = altReal(X, Z); return w <= 0 ? r : V.altura(x, z) * w + r * (1 - w);
};
export const chaoY = (x, z) => altura(x, z);
export const naLagoa = (x, z) => { if (naCaixa(x, z)) return V.naLagoa(x, z); const [X, Z] = paraReal(x, z); return dentroReal(X, Z) && pixel(X, Z, 0) === T_LAGOA; };
export const seco = (x, z) => !naLagoa(x, z);
const NATURAL = new Set(['grama', 'mata', 'quintal', 'morro', 'serra', 'comunidade', 'rua']);
// VIELAS das comunidades (19/11): numa grade fixa de 3 m do mundo, uma faixa a cada 9 m nos dois sentidos fica livre de
// casas e ganha chão de cimento. O povoador (terra.html) usa a mesma regra para pôr as casinhas e as escadarias.
const m3 = (v) => ((Math.floor(v / 3) % 3) + 3) % 3;
export const ehViela = (x, z) => m3(x) === 0 || m3(z) === 0;
export function tipoChao(x, z) { const t = tipoChaoBase(x, z); return t === 'comunidade' && ehViela(x, z) ? 'viela' : t; }
function tipoChaoBase(x, z) {
  const w = pesoAntigo(x, z); if (w >= 1) return V.tipoChao(x, z);
  const [X, Z] = paraReal(x, z); if (!dentroReal(X, Z)) return 'agua';
  const real = M.tipos[pixel(X, Z, 0)] || 'grama'; if (w <= 0) return real;
  const p = prof(x, z); if (p > 0) return 'agua';   // a costa da faixa segue a profundidade misturada
  let t = w > 0.5 ? V.tipoChao(x, z) : real; if (t === 'agua' || t === 'lagoa') t = w > 0.5 ? real : 'areia';
  if (t === 'agua' || t === 'lagoa') t = 'areia';
  return p > -2.5 && NATURAL.has(t) ? 'areia' : t;   // terra encostada no mar vira praia
}
// ---------- bairros: o nome do bairro real em cada ponto (fora e dentro da caixa)
export const BAIRROS = M.bairros;
export function bairroDe(x, z) { const [X, Z] = paraReal(x, z); if (!dentroReal(X, Z)) return null; const id = pixel(X, Z, 2); return id ? M.bairros[id - 1] : null; }
export const CREDITOS = M.creditos;
export const naCaixaFeitaAMao = naCaixa;
