// FÁBRICA DE PERSONAGENS
// O náufrago acorda sem nada: o jogador escolhe só o corpo (sexo, tom de pele),
// o cabelo e a barba. Base: Universal Base Characters + Universal Animation Library
// da Quaternius (CC0, em modelos/quaternius-*). A fábrica toca as animações e
// "fotografa" cada quadro em 8 direções no ângulo isométrico do jogo, com contorno:
// no jogo o personagem continua 2D (regra do DESIGN), nascido de um modelo 3D.
import * as THREE from 'three';
import { GLTFLoader } from '../lib/loaders/GLTFLoader.js';

const PASTA = new URL('../modelos/quaternius-personagens/', import.meta.url).href;
const ANIM = new URL('../modelos/quaternius-animacoes/UAL1_Standard.json', import.meta.url).href;
// ROUPAS (vestes do jogo): parte gratuita do Modular Character Outfits: Fantasy (Quaternius, CC0), em modelos/quaternius-roupas.
// As roupas foram feitas para outro corpo; por isso, vestido, o náufrago mostra só a CABEÇA do corpo dele
// (os triângulos abaixo do pescoço somem) e as peças de roupa formam o resto. Sem roupa, o corpo inteiro aparece.
const ROUPA = new URL('../modelos/quaternius-roupas/', import.meta.url).href;
const CHAPEU = new URL('../modelos/polypizza/chapeuBambu.json', import.meta.url).href;
const PECAS_ROUPA = {
  m: { peasant: { corpo: 'Male_Peasant_Body', bracos: 'Male_Peasant_Arms', pernas: 'Male_Peasant_Legs', pes: 'Male_Peasant_Feet' },
       ranger: { corpo: 'Male_Ranger_Body', bracos: 'Male_Ranger_Arms', pernas: 'Male_Ranger_Legs', pes: 'Male_Ranger_Feet_Boots', ombro: 'Male_Ranger_Acc_Pauldron', capuz: 'Male_Ranger_Head_Hood' } },
  f: { peasant: { corpo: 'Female_Peasant_Body', bracos: 'Female_Peasant_Arms', pernas: 'Female_Peasant_Legs', pes: 'Female_Peasant_Feet' },
       ranger: { corpo: 'Female_Ranger_Body', bracos: 'Female_Ranger_Arms', pernas: 'Female_Ranger_Legs', pes: 'Female_Ranger_Feet', ombro: 'Female_Ranger_Acc_Pauldrons', capuz: 'Female_Ranger_Head_Hood' } },
};
const CORTE_PESCOCO = 0.84;   // fração da altura do corpo (pose de ligação) abaixo da qual o corpo some quando está vestido
const TRACO = '#2b1d0e';

// ---------- opções da criação (sem roupa de classe: todo mundo começa náufrago)
export const SEXOS = [['m', 'Masculino'], ['f', 'Feminino']];
// tons de pele: a textura do pacote é recolorida (só os pixels de pele; a bermuda fica igual)
export const AMOSTRA_PELE = ['#f6d6bb', '#e2b38f', '#b9855e', '#8d5c3e', '#5f3c28'];
export const CABELOS = {
  m: [['Hair_Buzzed', 'Raspado'], ['Hair_SimpleParted', 'Repartido'], ['Hair_Long', 'Comprido'], [null, 'Careca']],
  f: [['Hair_Long', 'Comprido'], ['Hair_Buns', 'Coque'], ['Hair_SimpleParted', 'Repartido'], ['Hair_BuzzedFemale', 'Raspado']],
};
export const CORES_CABELO = ['#2a211b', '#5a3a24', '#9a4a26', '#d6b06a', '#b9b4ab'];
export const COMPOSICAO_PADRAO = { sexo: 'm', pele: 1, cabelo: 0, corCabelo: 1, barba: true };

export const OFF = new THREE.Vector3(20, 20 * 0.816, 20);   // mesmo ângulo 2:1 do jogo
const SOL = new THREE.Vector3(-0.5, 1, 0.35).normalize();
const ALTURA = 1.8;
export const QUADRO = { l: 128, a: 160, meiaL: 1.04, meiaA: 1.3, alvoY: 0.95 };
export const DIRECOES = 8;
// nomes usados pelo jogo -> animação da biblioteca da Quaternius
const CLIPES = { Idle: 'Idle_Loop', Walking_A: 'Walk_Loop', Running_A: 'Jog_Fwd_Loop', PickUp: 'Fixing_Kneeling', Interact: 'Interact', '1H_Melee_Attack_Chop': 'Sword_Attack', Death_A: 'Death01', Sentado: 'Sitting_Idle_Loop' };
export const ANIMS = [['Idle', 4], ['Walking_A', 8], ['Running_A', 8], ['PickUp', 6], ['Interact', 6], ['1H_Melee_Attack_Chop', 6], ['Death_A', 6], ['Sentado', 2]];

export async function criarFabrica() {
  const leitor = new GLTFLoader();
  const cabelos = [...new Set([...CABELOS.m, ...CABELOS.f].map((c) => c[0]).filter(Boolean)), 'Hair_Beard'];
  const [anim, corpoM, corpoF, ...cabs] = await Promise.all([
    leitor.loadAsync(ANIM), leitor.loadAsync(PASTA + 'Superhero_Male_FullBody.json'), leitor.loadAsync(PASTA + 'Superhero_Female_FullBody.json'),
    ...cabelos.map((c) => leitor.loadAsync(PASTA + c + '.json')),
  ]);
  // texturas de pele: uma por sexo e tom. Pixel de pele (avermelhado) ganha o tom novo mantendo o claro-escuro;
  // pixel cinza (bermuda) não muda.
  const texPele = {};
  for (const [sx, arq] of [['m', 'T_Superhero_Male_Ligh.png'], ['f', 'T_Superhero_Female_Light_BaseColor.png']]) {
    const img = new Image(); img.src = PASTA + arq; await img.decode();
    const L = 512, base = document.createElement('canvas'); base.width = base.height = L; const bctx = base.getContext('2d'); bctx.drawImage(img, 0, 0, L, L);
    const orig = bctx.getImageData(0, 0, L, L);
    AMOSTRA_PELE.forEach((hex, i) => {
      const alvo = new THREE.Color(hex), d = new ImageData(new Uint8ClampedArray(orig.data), L, L), p = d.data;
      for (let k = 0; k < p.length; k += 4) {
        const r = p[k], g = p[k + 1], b = p[k + 2];
        if (r > b + 22 && r >= g) { const lum = Math.min(1.6, (r + g + b) / 3 / 120); p[k] = Math.min(255, alvo.r * 255 * lum); p[k + 1] = Math.min(255, alvo.g * 255 * lum); p[k + 2] = Math.min(255, alvo.b * 255 * lum); }
      }
      const c = document.createElement('canvas'); c.width = c.height = L; c.getContext('2d').putImageData(d, 0, 0);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.flipY = false; texPele[sx + i] = t;
    });
  }
  // cabelo: as duas texturas do pacote são cinzas; cada cor gera uma versão recolorida (mantendo os fios claros e escuros)
  const texCabelo = {};
  for (const n of ['1', '2']) {
    const img = new Image(); img.src = PASTA + `T_Hair_${n}_BaseColor.png`; await img.decode();
    const L = 256, base = document.createElement('canvas'); base.width = base.height = L; const bctx = base.getContext('2d'); bctx.drawImage(img, 0, 0, L, L);
    const orig = bctx.getImageData(0, 0, L, L);
    CORES_CABELO.forEach((hex, i) => {
      const alvo = new THREE.Color(hex), d = new ImageData(new Uint8ClampedArray(orig.data), L, L), p = d.data;
      for (let k = 0; k < p.length; k += 4) { const lum = Math.min(1.7, (p[k] + p[k + 1] + p[k + 2]) / 3 / 142); p[k] = Math.min(255, alvo.r * 255 * lum); p[k + 1] = Math.min(255, alvo.g * 255 * lum); p[k + 2] = Math.min(255, alvo.b * 255 * lum); }
      const c = document.createElement('canvas'); c.width = c.height = L; c.getContext('2d').putImageData(d, 0, 0);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.flipY = false; texCabelo[n + '-' + i] = t;
    });
  }
  const clipe = (nome) => THREE.AnimationClip.findByName(anim.animations, CLIPES[nome] || nome);

  const cena = new THREE.Scene();
  const sol = new THREE.DirectionalLight('#fff4dd', 2.7); sol.position.copy(SOL).multiplyScalar(10); cena.add(sol);
  cena.add(new THREE.HemisphereLight('#e8f6ff', '#8a7f5a', 2.1));
  const raiz = new THREE.Group(); cena.add(raiz);
  // cada peça (corpo ou cabelo) tem o próprio esqueleto com os mesmos nomes: todas tocam o mesmo clipe juntas
  const pecas = {};
  function preparar(nome, gltf) {
    const s = gltf.scene; s.visible = false; raiz.add(s);
    const malhas = [];
    s.traverse((o) => { if (!o.isMesh) return; o.frustumCulled = false; o.material = new THREE.MeshLambertMaterial({ map: o.material.map, color: 0xffffff, transparent: !!o.material.transparent, alphaTest: o.material.alphaTest || 0.3, side: THREE.DoubleSide }); o.material.userData.fio = /Hair_2/.test(o.material.map?.name || '') ? '2' : /Hair_1/.test(o.material.map?.name || '') ? '1' : null; malhas.push(o); });
    pecas[nome] = { cena: s, malhas, mixer: new THREE.AnimationMixer(s) };
  }
  preparar('corpo-m', corpoM); preparar('corpo-f', corpoF);
  // índices do corpo: inteiro e só a cabeça (para vestir)
  for (const sx of ['m', 'f']) for (const m of pecas['corpo-' + sx].malhas) {
    if (!/^SuperHero/i.test(m.name)) continue;
    const p = m.geometry.attributes.position, ix = m.geometry.index; let y0 = 1e9, y1 = -1e9;
    for (let k = 0; k < p.count; k++) { const y = p.getY(k); if (y < y0) y0 = y; if (y > y1) y1 = y; }
    const corte = y0 + (y1 - y0) * CORTE_PESCOCO, so = [];
    for (let k = 0; k < ix.count; k += 3) { const a = ix.getX(k), b = ix.getX(k + 1), c = ix.getX(k + 2); if (Math.min(p.getY(a), p.getY(b), p.getY(c)) > corte) so.push(a, b, c); }
    m.userData.indiceInteiro = ix; m.userData.indiceCabeca = new THREE.BufferAttribute(new Uint32Array(so), 1);
  }
  // roupas: carregadas só quando alguém veste algo (garantirRoupas), para o menu não esperar
  let roupasProntas = null, chapeu = null;
  const tons = {};   // texturas de roupa recoloridas, por cor
  function recolorir(tex, hex) {   // pinta o que é verde (o tecido do Ranger) com a cor da veste, mantendo o claro-escuro
    const chave = tex.uuid + hex; if (tons[chave]) return tons[chave];
    const img = tex.image, L = 512, c = document.createElement('canvas'); c.width = c.height = L; const x = c.getContext('2d'); x.drawImage(img, 0, 0, L, L);
    const d = x.getImageData(0, 0, L, L), p = d.data, alvo = new THREE.Color(hex);
    for (let k = 0; k < p.length; k += 4) { const r = p[k], g = p[k + 1], b = p[k + 2]; if (g > r + 8 && g > b + 4) { const lum = Math.min(1.8, (r + g + b) / 3 / 70); p[k] = Math.min(255, alvo.r * 255 * lum); p[k + 1] = Math.min(255, alvo.g * 255 * lum); p[k + 2] = Math.min(255, alvo.b * 255 * lum); } }
    x.putImageData(d, 0, 0); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.flipY = false; return (tons[chave] = t);
  }
  const peleRegular = {};   // mãos e braços das roupas usam outra textura de pele: recolore no mesmo tom do jogador
  function texPeleRegular(tex, i) {
    const chave = tex.uuid + '-' + i; if (peleRegular[chave]) return peleRegular[chave];
    const L = 512, c = document.createElement('canvas'); c.width = c.height = L; const x = c.getContext('2d'); x.drawImage(tex.image, 0, 0, L, L);
    const d = x.getImageData(0, 0, L, L), p = d.data, alvo = new THREE.Color(AMOSTRA_PELE[i] || AMOSTRA_PELE[1]);
    let soma = 0, n = 0; for (let k = 0; k < p.length; k += 4) if (p[k] > p[k + 2] + 12 && p[k] >= p[k + 1]) { soma += (p[k] + p[k + 1] + p[k + 2]) / 3; n++; }
    const media = n ? soma / n : 100;
    for (let k = 0; k < p.length; k += 4) { const r = p[k], g = p[k + 1], b = p[k + 2]; if (r > b + 12 && r >= g) { const lum = Math.min(1.6, (r + g + b) / 3 / media); p[k] = Math.min(255, alvo.r * 255 * lum); p[k + 1] = Math.min(255, alvo.g * 255 * lum); p[k + 2] = Math.min(255, alvo.b * 255 * lum); } }
    x.putImageData(d, 0, 0); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.flipY = false; return (peleRegular[chave] = t);
  }
  async function garantirRoupas() {
    if (!roupasProntas) roupasProntas = (async () => {
      const nomes = [...new Set(Object.values(PECAS_ROUPA).flatMap((s) => Object.values(s).flatMap((o) => Object.values(o))))];
      const gl = await Promise.all(nomes.map((n) => leitor.loadAsync(ROUPA + n + '.json')));
      nomes.forEach((n, i) => { preparar(n, gl[i]); for (const m of pecas[n].malhas) { m.material.userData.mapa = m.material.map; m.material.userData.pele = /Regular/i.test(m.material.map?.name || ''); } });
      try {   // chapéu de palha: modelo pronto preso ao osso da cabeça de cada corpo
        const ch = (await leitor.loadAsync(CHAPEU)).scene;
        ch.traverse((o) => { if (o.isMesh) o.material = new THREE.MeshLambertMaterial({ color: '#e2c46a', side: THREE.DoubleSide }); });
        const cx = new THREE.Box3().setFromObject(ch), tm = cx.getSize(new THREE.Vector3()), ct = cx.getCenter(new THREE.Vector3());
        const e = 0.42 / Math.max(tm.x, tm.z); ch.scale.setScalar(e); ch.position.set(-ct.x * e, -cx.min.y * e, -ct.z * e);
        chapeu = {};
        for (const sx of ['m', 'f']) { const osso = pecas['corpo-' + sx].cena.getObjectByName('Head'); const g = new THREE.Group(); g.add(ch.clone(true)); g.position.set(0, 0.155, 0.01); g.rotation.x = 0.13; g.visible = false; osso.add(g); chapeu[sx] = g; }
      } catch (e) { console.warn('chapéu não carregou', e); }
    })();
    return roupasProntas;
  }
  cabelos.forEach((c, i) => preparar(c, cabs[i]));
  // escala: mede o corpo masculino parado e leva a 1,8 m
  { const p = pecas['corpo-m']; p.cena.visible = true; p.mixer.clipAction(clipe('Idle')).play(); p.mixer.setTime(0); raiz.updateMatrixWorld(true);
    const caixa = new THREE.Box3().setFromObject(p.cena, true); raiz.scale.setScalar(ALTURA / (caixa.max.y - caixa.min.y)); p.mixer.stopAllAction(); p.cena.visible = false; }

  const camera = new THREE.OrthographicCamera(-QUADRO.meiaL, QUADRO.meiaL, QUADRO.meiaA, -QUADRO.meiaA, 0.1, 100);
  camera.position.copy(OFF).normalize().multiplyScalar(30).add(new THREE.Vector3(0, QUADRO.alvoY, 0)); camera.lookAt(0, QUADRO.alvoY, 0);
  const SUPER = 2;
  const tela = document.createElement('canvas'); tela.width = QUADRO.l * SUPER; tela.height = QUADRO.a * SUPER;
  const renderer = new THREE.WebGLRenderer({ canvas: tela, alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setClearColor(0x000000, 0);
  const foto = document.createElement('canvas'); foto.width = QUADRO.l; foto.height = QUADRO.a; const fctx = foto.getContext('2d');
  const silh = document.createElement('canvas'); silh.width = QUADRO.l; silh.height = QUADRO.a; const sctx = silh.getContext('2d');

  let ativas = [];
  function aplicar(comp) {
    comp = { ...COMPOSICAO_PADRAO, ...comp };
    const sexo = comp.sexo === 'f' ? 'f' : 'm', ic = comp.corCabelo in CORES_CABELO ? comp.corCabelo : 1;
    const pintaFio = (m) => { if (m.material.userData.fio) { m.material.map = texCabelo[m.material.userData.fio + '-' + ic]; m.material.needsUpdate = true; } };
    for (const p of Object.values(pecas)) p.cena.visible = false;
    const corpo = pecas['corpo-' + sexo]; corpo.cena.visible = true; ativas = [corpo];
    // roupa: { corpo: 'peasant'|'ranger'|null, tomCorpo, pernas, ombro, capuz, tomCapuz, chapeu }. Só vale com as roupas carregadas.
    const R = roupasProntas && comp.roupa ? comp.roupa : null, vestido = R && (R.corpo || R.pernas);
    if (chapeu) for (const g of Object.values(chapeu)) g.visible = false;
    for (const m of corpo.malhas) if (m.userData.indiceInteiro) m.geometry.setIndex(vestido ? m.userData.indiceCabeca : m.userData.indiceInteiro);
    if (vestido) {
      const kit = PECAS_ROUPA[sexo], de = (estilo, parte) => kit[estilo || 'peasant'][parte];
      const usar = [[de(R.corpo, 'corpo'), R.corpo === 'ranger' ? R.tomCorpo : null], [de(R.corpo, 'bracos'), R.corpo === 'ranger' ? R.tomCorpo : null],
        [de(R.pernas, 'pernas'), R.pernas === 'ranger' ? R.tomPernas : null], [de(R.pernas, 'pes'), null]];
      if (R.ombro) usar.push([kit.ranger.ombro, R.tomCorpo]);
      if (R.capuz) usar.push([kit.ranger.capuz, R.tomCapuz]);
      for (const [nome, tom] of usar) {
        const p = pecas[nome]; if (!p) continue; p.cena.visible = true; ativas.push(p);
        for (const m of p.malhas) { const base = m.material.userData.mapa; if (!base) continue;
          m.material.map = m.material.userData.pele ? texPeleRegular(base, comp.pele) : tom ? recolorir(base, tom) : base; m.material.needsUpdate = true; }
      }
    }
    if (R?.chapeu && chapeu && !R.capuz) chapeu[sexo].visible = true;
    for (const m of corpo.malhas) {
      if (/^SuperHero/i.test(m.name)) { m.material.map = texPele[sexo + (comp.pele in AMOSTRA_PELE ? comp.pele : 1)]; m.material.needsUpdate = true; }
      else pintaFio(m);   // sobrancelhas acompanham o cabelo
    }
    const cab = (CABELOS[sexo][comp.cabelo] || CABELOS[sexo][0])[0];
    for (const nome of [R?.capuz || R?.chapeu ? null : cab, sexo === 'm' && comp.barba ? 'Hair_Beard' : null]) {
      if (!nome) continue; const p = pecas[nome]; p.cena.visible = true; ativas.push(p);
      for (const m of p.malhas) pintaFio(m);
    }
  }
  function pose(nome, t) {
    const c = clipe(nome);
    for (const p of ativas) { p.mixer.stopAllAction(); const a = p.mixer.clipAction(c); a.reset().play(); p.mixer.setTime(t); }
  }
  const duracao = (nome) => clipe(nome).duration;
  function fotografar(k, ctx, x, y) {
    raiz.rotation.y = k * Math.PI / 4 + Math.PI / 2;   // o modelo olha para +Z; o jogo usa (cos a, -sin a)
    renderer.render(cena, camera);
    fctx.clearRect(0, 0, foto.width, foto.height); fctx.drawImage(tela, 0, 0, foto.width, foto.height);
    sctx.globalCompositeOperation = 'source-over'; sctx.clearRect(0, 0, silh.width, silh.height); sctx.drawImage(foto, 0, 0);
    sctx.globalCompositeOperation = 'source-in'; sctx.fillStyle = TRACO; sctx.fillRect(0, 0, silh.width, silh.height);
    for (let d = 0; d < 8; d++) { const a = d * Math.PI / 4; ctx.drawImage(silh, x + Math.round(Math.cos(a) * 2), y + Math.round(Math.sin(a) * 2)); }
    ctx.drawImage(foto, x, y);
  }
  function assar(comp) {
    aplicar(comp);
    const total = ANIMS.reduce((s, [, n]) => s + n, 0);
    const folha = document.createElement('canvas'); folha.width = QUADRO.l * total; folha.height = QUADRO.a * DIRECOES;
    const ctx = folha.getContext('2d'), quadros = {};
    let col = 0;
    for (const [nome, n] of ANIMS) {
      quadros[nome] = { inicio: col, n }; const dur = duracao(nome);
      for (let f = 0; f < n; f++, col++) { pose(nome, dur * f / n); for (let k = 0; k < DIRECOES; k++) fotografar(k, ctx, col * QUADRO.l, k * QUADRO.a); }
    }
    return { canvas: folha, colunas: total, linhas: DIRECOES, quadros };
  }
  function retrato(comp, ctx, x = 0, y = 0, k = 7) { aplicar(comp); pose('Idle', 0); fotografar(k, ctx, x, y); }
  return { aplicar, assar, retrato, garantirRoupas };
}
