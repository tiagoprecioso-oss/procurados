// FORMA DO MUNDO DE NITERÓI (19/11, DESIGN 4b): costa, relevo, cidade, lagoa, estradas e o tipo de chão de cada ponto.
// Separado da terra.html para virar o "arquivo de dados" da cidade: o motor (terra.html) só pergunta altura(x, z),
// tipoChao(x, z) etc. Na etapa 2 isto passa a ser gerado do OpenStreetMap; outras cidades terão o próprio arquivo.
export const XMIN = -30, XMAX = 210, ZMIN = -72, ZMAX = 112;
// a costa: ondulada, com o morro da fortaleza avançando no mar perto de z = 100
export const costaX = (z) => 9 + 2.2 * Math.sin(z * 0.21) + 1.2 * Math.sin(z * 0.53 + 1) - 24 * Math.exp(-(((z - 100) / 13) ** 2));
export const prof = (x, z) => costaX(z) - x;                       // > 0 é água
export const ehMangue = (x, z) => z > 26 && z < 80 && x > costaX(z) + 2 && x < costaX(z) + 17;
// ---------- NITERÓI: a planta da cidade. Ruas, avenida da praia e praça são públicas (DESIGN, seção 5).
export const CID = { z0: -70, z1: -3, x1: 114 };   // o centro vai até x = 62; dali ao Morro do Cavalão é o bairro novo (17/11)
export const TRAVESSAS = [[-13, -10], [-27, -24], [-41, -38], [-55, -52], [-69, -66]];
export const RUAS_X = [[35, 38], [56, 59], [77, 80], [98, 101]];
export const PRACA = { x0: 38, x1: 56, z0: -38, z1: -27 };
export const naCidade = (x, z) => z > CID.z0 && z < CID.z1 && x < CID.x1;
// o cais de Niterói sai da avenida para o mar: dá para andar nele
export const CAIS_Z = -32, CAIS_X0 = costaX(-32) - 11, CAIS_X1 = costaX(-32) + 2;
export const noCais = (x, z) => x > CAIS_X0 && x < CAIS_X1 && z > CAIS_Z - 1.3 && z < CAIS_Z + 1.3;
export const FORTE = { x: 2, z: 100, r: 10.5 };
// ---------- ARREDORES (17/11). A leste de Icaraí, o Morro do Cavalão é uma serra que separa a costa do interior.
// A Estrada do Engenho sai da travessa da praça, cruza o morro num passo e chega ao Engenho, com o canavial ao norte.
// Do engenho, uma trilha desce para a Lagoa de Piratininga e a vila de pescadores; outra trilha vem do mangue direto à lagoa.
export const SERRA = { x0: 116, x1: 134 };
export const ESTRADAS = [{ x0: 59, x1: 176, z0: -27, z1: -24 }, { x0: 158, x1: 161, z0: -27, z1: 46 }, { x0: 96, x1: 149, z0: 69.5, z1: 72.5 }];
export const naEstrada = (x, z) => ESTRADAS.some((e) => x > e.x0 && x < e.x1 && z > e.z0 && z < e.z1);
export const LAGOA = { x: 170, z: 66, rx: 22, rz: 13 };
export const elipLagoa = (x, z) => ((x - LAGOA.x) / LAGOA.rx) ** 2 + ((z - LAGOA.z) / LAGOA.rz) ** 2;
export const naLagoa = (x, z) => elipLagoa(x, z) < 1 + 0.1 * Math.sin(x * 0.35) * Math.cos(z * 0.45);
export const CANAVIAL = { x0: 140, x1: 198, z0: -66, z1: -30 };
export const noCanavial = (x, z) => x > CANAVIAL.x0 && x < CANAVIAL.x1 && z > CANAVIAL.z0 && z < CANAVIAL.z1;
export const ENGENHO = { x: 172, z: -15 };
export const VILA = { x: 168, z: 42 };   // margem norte da lagoa
export const sstep = (a, b, t) => { const u = Math.max(0, Math.min(1, (t - a) / (b - a))); return u * u * (3 - 2 * u); };
// altura do chão: só o morro sobe; as estradas que cruzam a serra abrem um passo no meio dele
export function altura(x, z) {
  const meio = (SERRA.x0 + SERRA.x1) / 2, meia = (SERRA.x1 - SERRA.x0) / 2, u = 1 - Math.abs(x - meio) / meia;
  if (u <= 0) return 0;
  let h = 6 * Math.sin(u * Math.PI / 2) ** 1.4 * (0.85 + 0.2 * Math.sin(z * 0.15) + 0.1 * Math.sin(z * 0.43 + 2));
  for (const e of ESTRADAS) if (e.x0 < SERRA.x0 && e.x1 > SERRA.x1) { const hw = (e.z1 - e.z0) / 2; h *= sstep(hw + 0.3, hw + 6, Math.abs(z - (e.z0 + e.z1) / 2)); }
  return h;
}
// RELEVO ANDÁVEL (19/11, DESIGN 4b): todo chão firme se pisa, inclusive o morro. Quem anda, os bichos e as coisas
// pousam na altura do chão (chaoY); subir ladeira é mais lento e cansa (ver o movimento do pirata).
export const seco = (x, z) => !naLagoa(x, z);   // dá para pisar (fora da lagoa; o mar é conferido à parte, por prof)
export const chaoY = (x, z) => altura(x, z);
// a TRILHA DO CAVALÃO: sobe pelo lado da cidade, passa pelo Mirante lá em cima e desce para o interior (sem árvores)
export const TRILHA_Z = 29, naTrilha = (x, z) => x > SERRA.x0 - 3 && x < SERRA.x1 + 3 && Math.abs(z - TRILHA_Z - 1.6 * Math.sin(x * 0.35)) < 1.3;
export const MIRANTE = { x: (SERRA.x0 + SERRA.x1) / 2, z: TRILHA_Z };
export function tipoCidade(x, z, d) {
  if (!naCidade(x, z) || d < 4.5) return null;
  if (d < 8.5) return 'rua';   // avenida da praia
  if (TRAVESSAS.some(([a, b]) => z > a && z < b) || RUAS_X.some(([a, b]) => x > a && x < b)) return 'rua';
  if (x > PRACA.x0 && x < PRACA.x1 && z > PRACA.z0 && z < PRACA.z1) return 'praca';
  return 'quintal';
}
export function tipoChao(x, z) {
  const d = x - costaX(z);
  if (d < 0) return 'agua';
  const tc = tipoCidade(x, z, d); if (tc) return tc;
  if (naLagoa(x, z)) return 'lagoa';
  if (naEstrada(x, z)) return 'estrada';
  if (naTrilha(x, z)) return 'estrada';
  if (altura(x, z) > 0.35) return 'serra';
  if (x > SERRA.x1 - 2) {
    const e = elipLagoa(x, z);
    if (e < 1.55 && x > LAGOA.x + 6 && z > LAGOA.z - 2) return 'lama';   // um pouco de mangue no fundo da lagoa
    if (e < 1.25) return 'areia';
    if (noCanavial(x, z)) return 'canavial';
    if (Math.hypot(x - ENGENHO.x, z - ENGENHO.z) < 13 || (Math.abs(x - VILA.x) < 20 && z > VILA.z - 8 && z < LAGOA.z)) return 'grama';
    return 'mata';
  }
  if (z > 84 && d > 3) return 'morro';
  if (ehMangue(x, z)) return 'lama';
  if (d < 4.5 + Math.sin(z * 0.7) * 0.8) return 'areia';
  if (d < 11) return 'grama';
  return 'mata';
}

// até onde se anda, se é o mapa real e os bairros (o js/mundo-real.js troca tudo isto pelo mapa de verdade)
export const LIM = { x0: XMIN, x1: XMAX, z0: ZMIN, z1: ZMAX };
export const REAL = false, BAIRROS = [], CREDITOS = [];
export const bairroDe = () => null, naCaixaFeitaAMao = () => true;
export const ehViela = () => false;
