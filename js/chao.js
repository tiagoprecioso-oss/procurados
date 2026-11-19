// CHÃO EM PEDAÇOS (19/11, DESIGN 4b, etapa 1): o chão deixa de ser uma malha única do mapa inteiro e passa a ser
// montado em pedaços quadrados (32 m) só em volta de quem joga; os que ficam longe são desmontados. Assim a terra pode
// crescer para os bairros todos sem pesar no celular. Quem diz o que há em cada ponto é o arquivo do mundo da cidade
// (tipoChao e altura, em js/mundo-niteroi.js). Cada casa de 1 m vira um ladrilho com a cor do tipo de chão, com uma
// variação pequena que depende só da posição (o mesmo ladrilho tem sempre a mesma cor).
import * as THREE from 'three';

export function criarChao(cena, { tipoChao, altura, cores, limites, tile = 32, raio = 64, porQuadro = 2 }) {
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const pedacos = new Map(), c = new THREE.Color();
  const hash = (i, j) => { let h = Math.imul(i, 374761393) + Math.imul(j, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const chave = (ti, tj) => ti + ',' + tj;

  function montar(ti, tj) {
    const pos = [], cor = [], i0 = ti * tile, j0 = tj * tile;
    for (let j = j0; j < j0 + tile; j++) for (let i = i0; i < i0 + tile; i++) {
      if (i < limites.x0 || i >= limites.x1 || j < limites.z0 || j >= limites.z1) continue;
      const t = tipoChao(i + 0.5, j + 0.5); if (!cores[t]) continue;
      c.set(cores[t]).offsetHSL((hash(i, j) - 0.5) * 0.02, 0, (hash(j + 7, i - 3) - 0.5) * 0.04);
      for (const [x, z] of [[i, j], [i, j + 1], [i + 1, j], [i + 1, j], [i, j + 1], [i + 1, j + 1]]) { pos.push(x, altura(x, z), z); cor.push(c.r, c.g, c.b); }
    }
    if (!pos.length) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(cor, 3)); g.computeVertexNormals();
    const m = new THREE.Mesh(g, mat); m.matrixAutoUpdate = false; cena.add(m); return m;
  }
  function desmontar(k) { const m = pedacos.get(k); if (m) { cena.remove(m); m.geometry.dispose(); } pedacos.delete(k); }

  // quais pedaços ficam perto de (x, z): o centro do pedaço a menos de raio + meia diagonal
  function perto(x, z) {
    const r = Math.ceil(raio / tile) + 1, ci = Math.floor(x / tile), cj = Math.floor(z / tile), lista = [];
    for (let tj = cj - r; tj <= cj + r; tj++) for (let ti = ci - r; ti <= ci + r; ti++) {
      const d = Math.hypot((ti + 0.5) * tile - x, (tj + 0.5) * tile - z);
      if (d < raio + tile * 0.71) lista.push([d, ti, tj]);
    }
    return lista.sort((a, b) => a[0] - b[0]);   // os mais perto primeiro
  }
  // a cada quadro: monta até `porQuadro` pedaços que faltam (todos de uma vez, se ainda não há nenhum) e desmonta os longe
  function atualizar(x, z) {
    const quer = perto(x, z), novos = new Set();
    let feitos = 0, limite = pedacos.size ? porQuadro : Infinity;
    for (const [, ti, tj] of quer) {
      const k = chave(ti, tj); novos.add(k);
      if (!pedacos.has(k) && feitos < limite) { pedacos.set(k, montar(ti, tj)); feitos++; }
    }
    for (const k of [...pedacos.keys()]) if (!novos.has(k)) {
      const [ti, tj] = k.split(',').map(Number);
      if (Math.hypot((ti + 0.5) * tile - x, (tj + 0.5) * tile - z) > raio + tile * 1.5) desmontar(k);   // folga: não fica montando e desmontando na borda
    }
  }
  return { atualizar, get quantos() { return [...pedacos.values()].filter(Boolean).length; } };
}
