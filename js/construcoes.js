// CONSTRUÇÕES: fortes (nas fases da obra) e peças da cidade, no estilo dos objetos interativos do jogo:
// low-poly, cor chapada e contorno escuro (casca invertida no espaço do mundo, igual à terra.html).
// Medidas em metros do jogo (a terra usa casas de 1 m). Cada função devolve um THREE.Group com a base em y = 0
// e a frente (portão, porta) virada para +z.
import * as THREE from 'three';
import { mergeVertices } from '../lib/utils/BufferGeometryUtils.js';

const TRACO = '#2b1d0e';
// ---------- contorno (o mesmo da terra.html)
function matContorno(cor = TRACO, esp = 0.05) {
  const base = new THREE.ShaderMaterial({
    uniforms: { uCor: { value: new THREE.Color(cor) }, uEsp: { value: esp } }, side: THREE.BackSide,
    vertexShader: `uniform float uEsp; void main() {
      vec4 w = modelMatrix * vec4(position, 1.0); vec3 n = normalize(mat3(modelMatrix) * normal);
      gl_Position = projectionMatrix * viewMatrix * vec4(w.xyz + n * uEsp, 1.0); }`,
    fragmentShader: `uniform vec3 uCor; void main() { gl_FragColor = vec4(uCor, 1.0);
      #include <colorspace_fragment>
    }`,
  });
  const inv = new THREE.ShaderMaterial({ uniforms: base.uniforms, vertexShader: base.vertexShader, fragmentShader: base.fragmentShader, side: THREE.FrontSide });
  return { base, inv };
}
const casco = new Map();
function geoContorno(g) {
  if (!casco.has(g)) {
    let h = g.clone(); for (const n of Object.keys(h.attributes)) if (n !== 'position') h.deleteAttribute(n);
    h = mergeVertices(h); h.computeVertexNormals();
    h.computeBoundingBox(); const c = h.boundingBox.getCenter(new THREE.Vector3()), p = h.attributes.position, n = h.attributes.normal;
    let soma = 0; for (let i = 0; i < p.count; i++) soma += (p.getX(i) - c.x) * n.getX(i) + (p.getY(i) - c.y) * n.getY(i) + (p.getZ(i) - c.z) * n.getZ(i);
    if (soma < 0) { for (let i = 0; i < n.count; i++) n.setXYZ(i, -n.getX(i), -n.getY(i), -n.getZ(i)); h.userData.invertido = true; }
    casco.set(g, h);
  }
  return casco.get(g);
}
const mats = new Map();
const lambert = (cor) => { if (!mats.has(cor)) mats.set(cor, new THREE.MeshLambertMaterial({ color: cor, flatShading: true })); return mats.get(cor); };
function peca(pai, g, cor, c, contorno = true) {
  const m = new THREE.Mesh(g, lambert(cor)); pai.add(m);
  if (contorno) { const h = geoContorno(g); m.add(new THREE.Mesh(h, h.userData.invertido ? c.inv : c.base)); }
  return m;
}
// ---------- formas
const caixa = (l, a, p) => new THREE.BoxGeometry(l, a, p).translate(0, a / 2, 0);
const cilindro = (r1, r2, a, lados = 8) => new THREE.CylinderGeometry(r1, r2, a, lados).translate(0, a / 2, 0);
const cone = (r, a, lados = 4) => new THREE.ConeGeometry(r, a, lados).translate(0, a / 2, 0);
// parede extrudada para cima a partir de um contorno 2D (x, z), com buracos
function extrudar(fora, buracos, altura) {
  const s = new THREE.Shape(fora.map(([x, z]) => new THREE.Vector2(x, -z)));
  for (const b of buracos) s.holes.push(new THREE.Path(b.map(([x, z]) => new THREE.Vector2(x, -z))));
  return new THREE.ExtrudeGeometry(s, { depth: altura, bevelEnabled: false }).rotateX(-Math.PI / 2);
}
const quadrado = (h) => [[-h, -h], [h, -h], [h, h], [-h, h]];
// telhado de duas águas (prisma) com cumeeira no eixo x
function duasAguas(l, p, a) {
  const s = new THREE.Shape([new THREE.Vector2(-p / 2, 0), new THREE.Vector2(p / 2, 0), new THREE.Vector2(0, a)]);
  return new THREE.ExtrudeGeometry(s, { depth: l, bevelEnabled: false }).rotateY(Math.PI / 2).translate(-l / 2, 0, 0);
}
// telhado de quatro águas (pirâmide achatada)
const quatroAguas = (l, p, a) => new THREE.ConeGeometry(Math.SQRT1_2, 1, 4).rotateY(Math.PI / 4).translate(0, 0.5, 0).scale(l * 1.02, a, p * 1.02);
// ameias ao longo de um polígono (topo do muro)
function ameias(pai, pts, y, cor, c, passo = 1.6, recuo = 0.35) {
  for (let i = 0; i < pts.length; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[(i + 1) % pts.length], L = Math.hypot(bx - ax, bz - az), ang = Math.atan2(bz - az, bx - ax);
    const nx = -(bz - az) / L, nz = (bx - ax) / L;   // normal para dentro (polígono no sentido anti-horário em x,z com z para baixo)
    for (let d = passo / 2; d < L - 0.3; d += passo) {
      const m = peca(pai, caixa(0.7, 0.7, 0.45), cor, c); m.position.set(ax + (bx - ax) * d / L - nx * recuo, y, az + (bz - az) * d / L - nz * recuo); m.rotation.y = -ang;
    }
  }
}
function canhao(pai, x, z, ang, c) {
  const g = new THREE.Group(); pai.add(g); g.position.set(x, 0, z); g.rotation.y = ang;
  peca(g, caixa(0.9, 0.35, 1.0), '#6e4a2c', c);
  const cano = peca(g, new THREE.CylinderGeometry(0.16, 0.22, 1.6, 8).rotateX(Math.PI / 2), '#3a3a3a', c); cano.position.set(0, 0.55, 0.35);
  return g;
}
function bandeira(pai, x, y, z, cor, c, alt = 5) {
  peca(pai, cilindro(0.08, 0.1, alt, 6), '#5e3a1e', c).position.set(x, y, z);
  const b = peca(pai, caixa(1.6, 1.0, 0.06), cor, c); b.position.set(x + 0.85, y + alt - 1.1, z);
  return b;
}
function guarita(pai, x, y, z, cor, c) {
  peca(pai, cilindro(0.55, 0.6, 1.5, 8), cor, c).position.set(x, y, z);
  peca(pai, cone(0.75, 0.9, 8), '#8f887c', c).position.set(x, y + 1.5, z);
}
function janela(pai, x, y, z, rotY, c, l = 0.7, a = 1.0) { const m = peca(pai, caixa(l, a, 0.06), '#3a2a18', c); m.position.set(x, y, z); m.rotation.y = rotY; return m; }
let semente = 7;
const rnd = () => { semente = (semente * 16807) % 2147483647; return semente / 2147483647; };

const PEDRA = '#c9c2ae', PEDRA2 = '#b3ab95', PEDRA_ESCURA = '#9a958a', CAL = '#efe6cf', TELHA = '#b5562f', MADEIRA = '#8a5a2b', MADEIRA2 = '#6e4a2c';

// =====================================================================
// FORTES (as fases da obra)
// =====================================================================
// RUÍNA: o que sobra de um forte de pedra abandonado. É onde a obra de um jogador começa.
function ruina() {
  semente = 11; const g = new THREE.Group(), c = matContorno();
  peca(g, caixa(20, 0.3, 20), '#a69b7c', c);
  const H = 9;
  for (const [ax, az, bx, bz] of [[-H, -H, H, -H], [H, -H, H, H], [H, H, 1.6, H], [-1.6, H, -H, H], [-H, H, -H, -H]]) {
    const L = Math.hypot(bx - ax, bz - az), n = Math.max(2, Math.round(L / 2.2));
    for (let k = 0; k < n; k++) {
      if (rnd() < 0.22) continue;                       // pedaço que caiu
      const t = (k + 0.5) / n, alt = 0.6 + rnd() * 3.2, m = peca(g, caixa(L / n + 0.05, alt, 1.5), rnd() < 0.5 ? PEDRA : PEDRA2, c);
      m.position.set(ax + (bx - ax) * t, 0.2, az + (bz - az) * t); m.rotation.y = -Math.atan2(bz - az, bx - ax);
    }
  }
  for (const [x, z] of [[-H, -H], [H, -H], [-H, H], [H, H]]) peca(g, cilindro(1.9, 2.2, 0.8 + rnd() * 2.5, 9), PEDRA2, c).position.set(x, 0.2, z);
  for (let k = 0; k < 26; k++) { const m = peca(g, new THREE.DodecahedronGeometry(0.3 + rnd() * 0.45, 0), PEDRA_ESCURA, c); m.position.set((rnd() - 0.5) * 22, 0.25, (rnd() - 0.5) * 22); m.rotation.set(rnd() * 3, rnd() * 3, 0); }
  for (let k = 0; k < 10; k++) { const m = peca(g, new THREE.IcosahedronGeometry(0.6 + rnd() * 0.6, 0), rnd() < 0.5 ? '#4f9a4a' : '#3c8244', c); m.position.set((rnd() - 0.5) * 20, 0.4, (rnd() - 0.5) * 20); m.scale.y = 0.7; }
  const placa = peca(g, caixa(1.4, 1.0, 0.1), '#ead9a4', c); placa.position.set(3.2, 1.0, H + 1.2);   // "escritura" à venda
  peca(g, cilindro(0.06, 0.07, 1.1, 5), MADEIRA2, c).position.set(3.2, 0, H + 1.15);
  return g;
}
// FASE 1 · PALIÇADA: troncos apontados, torre de vigia e portão. Rápido de erguer, fácil de queimar.
function palicada(corBandeira = '#a8221a') {
  const g = new THREE.Group(), c = matContorno(), H = 7.5;
  peca(g, caixa(17, 0.25, 17), '#a69b7c', c);
  const tora = cilindro(0.22, 0.24, 3.0, 6), ponta = cone(0.24, 0.6, 6);
  const lados = [[-H, -H, H, -H], [H, -H, H, H], [H, H, 1.5, H], [-1.5, H, -H, H], [-H, H, -H, -H]];
  for (const [ax, az, bx, bz] of lados) {
    const L = Math.hypot(bx - ax, bz - az), n = Math.round(L / 0.46);
    for (let k = 0; k <= n; k++) { const t = k / n, x = ax + (bx - ax) * t, z = az + (bz - az) * t, a = 2.6 + (k % 3) * 0.2;
      const m = peca(g, tora, k % 2 ? '#7a5a36' : '#8a6a44', c); m.position.set(x, 0, z); m.scale.y = a / 3;
      peca(g, ponta, '#6e4a2c', c).position.set(x, a, z); }
  }
  for (const x of [-1.6, 1.6]) peca(g, cilindro(0.28, 0.3, 3.8, 6), MADEIRA2, c).position.set(x, 0, H);   // portão
  peca(g, caixa(3.8, 0.4, 0.4), MADEIRA2, c).position.set(0, 3.4, H);
  // torre de vigia num canto
  const tx = H - 2.2, tz = -H + 2.2;
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) peca(g, cilindro(0.16, 0.18, 6, 6), MADEIRA2, c).position.set(tx + dx, 0, tz + dz);
  peca(g, caixa(2.8, 0.25, 2.8), MADEIRA, c).position.set(tx, 4.6, tz);
  peca(g, cone(2.4, 1.4, 4), '#c9a24f', c).position.set(tx, 6.0, tz);
  bandeira(g, tx, 7.0, tz, corBandeira, c, 2.8);
  // barraca e fogueira dentro
  peca(g, duasAguas(3.2, 2.6, 1.8), '#d8c9a0', c).position.set(-2.5, 0, -2.5);
  peca(g, cilindro(0.5, 0.6, 0.25, 7), PEDRA_ESCURA, c).position.set(1.5, 0, 1.2);
  return g;
}
// FASE 2 · FORTE DE PEDRA: muralha quadrada com torres redondas, ameias e portão.
function fortePedra(corBandeira = '#a8221a') {
  const g = new THREE.Group(), c = matContorno(), H = 9, E = 1.5, A = 4.2;
  peca(g, caixa(22, 0.3, 22), '#a69b7c', c);
  const muro = peca(g, extrudar(quadrado(H), [quadrado(H - E)], A), PEDRA, c); muro.position.y = 0.2;
  ameias(g, quadrado(H), A + 0.2, PEDRA2, c, 1.5, 0.3);
  for (const [x, z] of [[-H, -H], [H, -H], [-H, H], [H, H]]) {
    peca(g, cilindro(2.0, 2.3, A + 1.6, 10), PEDRA2, c).position.set(x, 0.2, z);
    peca(g, cone(2.3, 2.0, 10), TELHA, c).position.set(x, A + 1.8, z);
  }
  // portão na frente (+z)
  peca(g, caixa(2.6, 3.0, 0.3), '#3a2a18', c).position.set(0, 0.2, H + 0.05);
  peca(g, caixa(3.6, 1.0, 0.6), PEDRA2, c).position.set(0, 3.2, H + 0.1);
  // pátio: quartel e paiol
  peca(g, caixa(7, 2.8, 3.2), CAL, c).position.set(-2, 0.2, -4.5);
  peca(g, duasAguas(7.2, 3.6, 1.4), TELHA, c).position.set(-2, 3.0, -4.5);
  peca(g, caixa(2.6, 2.0, 2.6), PEDRA_ESCURA, c).position.set(4.5, 0.2, 4.0);
  for (const [x, z, a] of [[-4, -H + 0.9, Math.PI], [4, -H + 0.9, Math.PI], [H - 0.9, 0, -Math.PI / 2], [-H + 0.9, 0, Math.PI / 2]]) canhao(g, x, z, a, c).position.y = A + 0.2;
  bandeira(g, 0, 0.2, 0, corBandeira, c, 6);
  return g;
}
// FASE 3 · FORTALEZA EM ESTRELA: baluartes nos cantos (como Santa Cruz), guaritas, canhões, capela e quartel.
function fortaleza(corBandeira = '#a8221a') {
  const g = new THREE.Group(), c = matContorno(), H = 12, b = 4, f = 3.2, t = 6.5, A = 5;
  const rot = ([x, z], k) => { let p = [x, z]; for (let i = 0; i < k; i++) p = [p[1], -p[0]]; return p; };
  const base = [[H, H - b], [H + f, H - b], [H + t, H + t], [H - b, H + f], [H - b, H]];
  const fora = []; for (let k = 0; k < 4; k++) for (const p of base) fora.push(rot(p, k));
  peca(g, caixa(40, 0.3, 40), '#a69b7c', c);
  const rampa = peca(g, extrudar(fora.map(([x, z]) => [x * 1.06, z * 1.06]), [], 0.9), PEDRA_ESCURA, c); rampa.position.y = 0.2;   // sapata
  const muro = peca(g, extrudar(fora, [quadrado(H - 2.4)], A), PEDRA, c); muro.position.y = 0.2;
  ameias(g, fora, A + 0.2, PEDRA2, c, 1.7, 0.35);
  for (let k = 0; k < 4; k++) { const [x, z] = rot([H + t - 1.4, H + t - 1.4], k); guarita(g, x, A + 0.2, z, PEDRA2, c); }
  for (let k = 0; k < 4; k++) for (const s of [-1, 1]) {   // canhões nas faces dos baluartes
    const [x, z] = rot([H + t * 0.45 + (s < 0 ? 1.5 : -1.5), H + t * 0.45 + (s < 0 ? -1.5 : 1.5)], k), ang = Math.atan2(x, z);
    canhao(g, x * 0.97, z * 0.97, ang, c).position.y = A + 0.2;
  }
  // portão monumental na frente (+z)
  peca(g, caixa(3.2, 3.6, 0.3), '#3a2a18', c).position.set(0, 0.2, H + 0.05);
  peca(g, caixa(5.0, 1.6, 0.8), CAL, c).position.set(0, 3.8, H + 0.1);
  peca(g, duasAguas(5.2, 1.2, 0.9), PEDRA2, c).position.set(0, 5.4, H + 0.1);
  // pátio
  peca(g, caixa(2 * (H - 2.4), 0.2, 2 * (H - 2.4)), '#d8cfb8', c, false).position.y = 0.2;
  peca(g, caixa(12, 3.4, 4), CAL, c).position.set(-2, 0.4, -6.5);                  // quartel
  peca(g, duasAguas(12.3, 4.6, 1.6), TELHA, c).position.set(-2, 3.8, -6.5);
  for (let k = 0; k < 5; k++) janela(g, -6.5 + k * 2.2, 1.6, -4.45, 0, c, 0.8, 1.2);
  peca(g, caixa(4, 4, 6), CAL, c).position.set(6, 0.4, 1);                         // capela
  peca(g, duasAguas(6.2, 4.2, 1.8).rotateY(Math.PI / 2), TELHA, c).position.set(6, 4.4, 1);
  peca(g, caixa(1.6, 6.2, 1.6), CAL, c).position.set(6, 0.4, 4.6);
  peca(g, cone(1.2, 1.4, 4), TELHA, c).position.set(6, 6.6, 4.6);
  peca(g, caixa(0.12, 0.9, 0.12), '#3a2a18', c).position.set(6, 8.0, 4.6);
  peca(g, caixa(3, 2.2, 3), PEDRA_ESCURA, c).position.set(-6, 0.4, 4.5);           // paiol de pólvora
  bandeira(g, 0, 0.4, 2, corBandeira, c, 8);
  return g;
}

// =====================================================================
// PEÇAS DA CIDADE
// =====================================================================
function sobrado(cor = CAL) {
  const g = new THREE.Group(), c = matContorno(), L = 6, P = 5;
  peca(g, caixa(L, 3.2, P), cor, c);
  peca(g, caixa(L + 0.2, 0.25, P + 0.2), '#d8cfb8', c).position.y = 3.2;
  peca(g, caixa(L, 2.9, P), cor, c).position.y = 3.45;
  peca(g, quatroAguas(L + 0.8, P + 0.8, 1.9), TELHA, c).position.y = 6.35;
  // térreo: portas; andar: janelas e sacada de madeira
  for (const x of [-1.8, 0, 1.8]) { janela(g, x, 0, P / 2 + 0.01, 0, c, 0.9, 2.2); janela(g, x, 4.1, P / 2 + 0.01, 0, c, 0.8, 1.5); }
  peca(g, caixa(L - 0.6, 0.15, 0.9), MADEIRA, c).position.set(0, 3.9, P / 2 + 0.45);
  for (let x = -L / 2 + 0.4; x <= L / 2 - 0.3; x += 0.55) peca(g, caixa(0.07, 0.8, 0.07), MADEIRA2, c).position.set(x, 4.05, P / 2 + 0.85);
  peca(g, caixa(L - 0.6, 0.1, 0.1), MADEIRA2, c).position.set(0, 4.85, P / 2 + 0.85);
  for (const z of [-1.2, 1.2]) { janela(g, L / 2 + 0.01, 1.0, z, Math.PI / 2, c, 0.8, 1.4); janela(g, L / 2 + 0.01, 4.1, z, Math.PI / 2, c, 0.8, 1.5); }
  return g;
}
function igreja() {
  const g = new THREE.Group(), c = matContorno();
  peca(g, caixa(6, 5, 10), CAL, c).position.z = -1;
  peca(g, duasAguas(10.4, 6.4, 2.4).rotateY(Math.PI / 2), TELHA, c).position.set(0, 5, -1);
  // fachada mais alta, com frontão
  peca(g, caixa(7, 7, 0.8), CAL, c).position.z = 4.2;
  const fr = new THREE.Shape([new THREE.Vector2(-3.5, 0), new THREE.Vector2(3.5, 0), new THREE.Vector2(0, 2.2)]);
  peca(g, new THREE.ExtrudeGeometry(fr, { depth: 0.8, bevelEnabled: false }).translate(0, 0, -0.4), CAL, c).position.set(0, 7, 4.2);
  janela(g, 0, 0, 4.61, 0, c, 1.6, 3.0); janela(g, 0, 4.4, 4.61, 0, c, 1.0, 1.0);
  for (const x of [-2.4, 2.4]) peca(g, caixa(0.5, 7, 0.3), '#d8cfb8', c).position.set(x, 0, 4.7);
  // torre sineira
  peca(g, caixa(2.4, 10.5, 2.4), CAL, c).position.set(4.6, 0, 3.6);
  janela(g, 4.6, 8.3, 4.81, 0, c, 1.0, 1.4);
  peca(g, quatroAguas(2.8, 2.8, 2.2), TELHA, c).position.set(4.6, 10.5, 3.6);
  peca(g, caixa(0.14, 1.2, 0.14), '#3a2a18', c).position.set(4.6, 12.6, 3.6);
  peca(g, caixa(0.7, 0.14, 0.14), '#3a2a18', c).position.set(4.6, 13.3, 3.6);
  peca(g, caixa(0.14, 1.2, 0.14), '#3a2a18', c).position.set(0, 9.0, 4.2);
  peca(g, caixa(0.7, 0.14, 0.14), '#3a2a18', c).position.set(0, 9.7, 4.2);
  return g;
}
function taverna() {
  const g = new THREE.Group(), c = matContorno();
  peca(g, caixa(7, 3.4, 6), '#e9d49a', c);
  peca(g, duasAguas(7.6, 6.8, 2.2), TELHA, c).position.y = 3.4;
  janela(g, -1.5, 0, 3.01, 0, c, 1.2, 2.3); janela(g, 1.5, 1.1, 3.01, 0, c, 1.2, 1.0);
  for (const x of [-3.5, 3.5]) peca(g, caixa(0.25, 3.4, 0.25), MADEIRA2, c).position.set(x, 0, 3.0);
  // placa pendurada e barris
  peca(g, caixa(0.1, 0.1, 1.4), MADEIRA2, c).position.set(3.4, 2.9, 3.6);
  peca(g, caixa(1.2, 0.8, 0.1), '#ead9a4', c).position.set(3.4, 2.0, 4.2);
  for (const [x, z] of [[-3.2, 4.0], [-2.4, 4.3], [-2.8, 3.6]]) peca(g, cilindro(0.38, 0.38, 0.9, 9), MADEIRA, c).position.set(x, 0, z);
  return g;
}
function barraca(cor = '#c0281c') {
  const g = new THREE.Group(), c = matContorno();
  for (const [x, z, a] of [[-1.4, -1, 2.6], [1.4, -1, 2.6], [-1.4, 1, 2.2], [1.4, 1, 2.2]]) peca(g, cilindro(0.07, 0.08, a, 5), MADEIRA2, c).position.set(x, 0, z);
  const teto = peca(g, caixa(3.2, 0.08, 2.6), cor, c); teto.position.y = 2.4; teto.rotation.x = 0.16;
  for (const x of [-0.8, 0.8]) { const f = peca(g, caixa(0.8, 0.09, 2.62), '#f3ead8', c); f.position.set(x, 2.42, 0); f.rotation.x = 0.16; }
  peca(g, caixa(2.6, 0.9, 1.0), MADEIRA, c).position.set(0, 0, 0.4);
  const frutas = ['#e0702a', '#d8b24a', '#5d9a3a', '#a8221a'];
  for (let k = 0; k < 8; k++) peca(g, new THREE.IcosahedronGeometry(0.17, 0), frutas[k % 4], c).position.set(-1 + (k % 4) * 0.65, 1.05, 0.2 + Math.floor(k / 4) * 0.4);
  for (const x of [-1.6, 1.7]) peca(g, caixa(0.6, 0.5, 0.6), '#9a7550', c).position.set(x, 0, 1.6);
  return g;
}
function cais() {
  const g = new THREE.Group(), c = matContorno(), L = 12, P = 3;
  peca(g, caixa(L, 0.25, P), MADEIRA, c).position.y = 0.9;
  for (let x = -L / 2 + 0.5; x < L / 2; x += 2.2) for (const z of [-P / 2 + 0.2, P / 2 - 0.2]) peca(g, cilindro(0.18, 0.18, 2.4, 6), MADEIRA2, c).position.set(x, -1.3, z);
  for (const x of [-4, 0, 4]) peca(g, cilindro(0.2, 0.25, 0.6, 7), '#3a3a3a', c).position.set(x, 1.15, P / 2 - 0.3);
  for (const [x, z] of [[3.5, -0.6], [4.3, -0.6], [3.9, -0.6]]) peca(g, caixa(0.7, 0.7, 0.7), '#9a7550', c).position.set(x, 1.15 + (x === 3.9 ? 0.7 : 0), z);
  peca(g, cilindro(0.35, 0.35, 0.8, 9), MADEIRA, c).position.set(-3.6, 1.15, -0.6);
  return g;
}
function casaSimples(cor = '#e4b9a0') {
  const g = new THREE.Group(), c = matContorno();
  peca(g, caixa(4, 2.6, 3.6), cor, c);
  peca(g, duasAguas(4.4, 4.2, 1.5), TELHA, c).position.y = 2.6;
  janela(g, -0.8, 0, 1.81, 0, c, 0.8, 1.9); janela(g, 1.0, 1.0, 1.81, 0, c, 0.8, 0.8);
  return g;
}

export const MODELOS = {
  'Ruína de forte': { criar: ruina, grupo: 'Fortes', desc: 'onde a obra de um jogador começa' },
  'Fase 1 · Paliçada': { criar: palicada, grupo: 'Fortes', desc: 'troncos, vigia e portão' },
  'Fase 2 · Forte de pedra': { criar: fortePedra, grupo: 'Fortes', desc: 'muralha, torres e canhões' },
  'Fase 3 · Fortaleza em estrela': { criar: fortaleza, grupo: 'Fortes', desc: 'baluartes, guaritas, capela e quartel' },
  'Sobrado colonial': { criar: sobrado, grupo: 'Cidade', desc: 'térreo de loja, sacada de madeira' },
  'Igreja': { criar: igreja, grupo: 'Cidade', desc: 'fachada com frontão e torre sineira' },
  'Taverna': { criar: taverna, grupo: 'Cidade', desc: 'onde se contrata tripulação' },
  'Barraca do mercado': { criar: barraca, grupo: 'Cidade', desc: 'frutas, peixe e mariscos' },
  'Cais': { criar: cais, grupo: 'Cidade', desc: 'onde os barcos atracam' },
  'Casa simples': { criar: casaSimples, grupo: 'Cidade', desc: 'casa de taipa e telha' },
};
export { ruina, palicada, fortePedra, fortaleza, sobrado, igreja, taverna, barraca, cais, casaSimples };
