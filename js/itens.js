// CATÁLOGO DE ITENS E ESTÚDIO DE ÍCONES
// Cada item tem nome, nível (como os tiers do Grounded), tipo, descrição, onde achar,
// para que serve e um ícone 3D renderizado com o mesmo contorno escuro do jogo.
// "O que dá para fazer" sai das receitas, então nunca fica desatualizado.
import * as THREE from 'three';
import { GLTFLoader } from '../lib/loaders/GLTFLoader.js';
import { mergeVertices } from '../lib/utils/BufferGeometryUtils.js';

export const NIVEIS = {
  1: { nome: 'Nível 1', cor: '#a87b4f', fundo: '#efe0c2' },
  2: { nome: 'Nível 2', cor: '#5f8fb0', fundo: '#dbe8ef' },
  3: { nome: 'Nível 3', cor: '#c9a227', fundo: '#f5ebc4' },
};

export const ITENS = {
  pedra: { nome: 'Pedra', nivel: 1, tipo: 'Recurso', desc: 'Pedra solta da praia. A primeira ferramenta do náufrago.', onde: 'Praia e areia', serve: ['Combinar com um coco: abre o coco', 'Combinar com outra pedra: vira pedra lascada', 'Afiar a faca de concha (não se gasta)'] },
  concha: { nome: 'Concha', nivel: 1, tipo: 'Recurso', desc: 'Concha que a maré deixa na areia. Afiada, corta.', onde: 'Beira d\'água' },
  galho: { nome: 'Galho', nivel: 1, tipo: 'Recurso', desc: 'Galho seco caído no chão da mata.', onde: 'Grama e mata' },
  coco: { nome: 'Coco', nivel: 1, tipo: 'Comida', desc: 'Água e um pouco de comida, mas fechado: combine com uma pedra para abrir.', onde: 'Coqueiros da praia', serve: ['Combinar com uma pedra: vira coco aberto'] },
  cocoAberto: { nome: 'Coco aberto', nivel: 1, tipo: 'Comida', desc: 'Coco quebrado com uma pedra. É só beber.', onde: 'Combinar coco + pedra', efeito: 'Beber: sede +35, fome +8' },
  pedraLascada: { nome: 'Pedra lascada', nivel: 1, tipo: 'Ferramenta e arma', desc: 'Pedra batida em outra pedra até ganhar fio. Corta como uma faca simples.', onde: 'Combinar pedra + pedra', efeito: 'Arma: dano 8, 1 casa, golpe rápido', serve: ['Cortar cipó', 'Esfolar bichos abatidos'] },
  cipo: { nome: 'Cipó', nivel: 1, tipo: 'Recurso', desc: 'Corda da mata. Amarra ferramentas, armas e jangadas.', onde: 'Touceiras na mata (precisa de faca)' },
  tronco: { nome: 'Tronco', nivel: 1, tipo: 'Recurso', desc: 'Madeira de uma árvore derrubada.', onde: 'Árvores da mata (precisa de machado)' },
  cana: { nome: 'Cana', nivel: 1, tipo: 'Comida', desc: 'Cana-de-açúcar do canavial do engenho. Chupar a cana adoça a boca e mata um pouco da sede.', onde: 'Canavial do engenho (corte com algo afiado)', efeito: 'Chupar: sede +12, fome +6' },
  sururu: { nome: 'Sururu', nivel: 1, tipo: 'Comida', desc: 'Marisco do mangue. Cru faz mal; cozido sustenta.', onde: 'Lama do mangue', efeito: 'Comer cru: fome +8, vida −6' },
  vara: { nome: 'Vara de pesca', nivel: 1, tipo: 'Ferramenta', desc: 'Galho comprido, linha de cipó e anzol de concha.', onde: 'Oficina', serve: ['Pescar nas rodas de peixe da lagoa e na ponta do cais'] },
  peixe: { nome: 'Peixe', nivel: 1, tipo: 'Comida', desc: 'Peixe fresco da lagoa ou do mar. Cru faz mal; assado sustenta.', onde: 'Pescando com a vara', efeito: 'Comer cru: fome +6, vida −4' },
  peixeAssado: { nome: 'Peixe assado', nivel: 2, tipo: 'Comida', desc: 'Peixe assado na brasa. Comida de pescador.', onde: 'Fogueira ou fogão', efeito: 'Comer: fome +28, vida +6' },
  mariscos: { nome: 'Mariscos cozidos', nivel: 2, tipo: 'Comida', desc: 'Sururu cozido na fogueira.', onde: 'Fogueira', efeito: 'Comer: fome +30, vida +6' },
  faca: { nome: 'Faca de concha', nivel: 1, tipo: 'Ferramenta e arma', desc: 'Lâmina rápida feita de concha afiada.', onde: 'Oficina', efeito: 'Arma: dano 10, 1 casa, golpe rápido', serve: ['Cortar cipó', 'Esfolar bichos abatidos'] },
  machado: { nome: 'Machado de pedra', nivel: 1, tipo: 'Ferramenta do kit', desc: 'Fica no kit, fora da bolsa: o jogo usa sozinho quando você mira numa árvore.', onde: 'Oficina (uma vez só)', serve: ['Cortar árvores de nível 1'] },
  machadoPresa: { nome: 'Machado de presa', nivel: 2, tipo: 'Ferramenta do kit', desc: 'Lâmina de presa de cateto. Corta as árvores grandes do interior (dão 3 troncos).', onde: 'Oficina (substitui o de pedra)', serve: ['Cortar árvores de nível 1 e 2'] },
  picareta: { nome: 'Picareta de pedra', nivel: 1, tipo: 'Ferramenta do kit', desc: 'Quebra as rochas soltas da mata e do morro.', onde: 'Oficina (uma vez só)', serve: ['Quebrar rocha nível 1: pedras e pedra lascada'] },
  picaretaPresa: { nome: 'Picareta de presa', nivel: 2, tipo: 'Ferramenta do kit', desc: 'Quebra as rochas avermelhadas com ferro, no pé do Morro do Cavalão.', onde: 'Oficina (substitui a de pedra)', serve: ['Quebrar rocha nível 2: ferro'] },
  pa: { nome: 'Pá de concha', nivel: 1, tipo: 'Ferramenta do kit', desc: 'Cava a areia remexida da praia.', onde: 'Oficina (uma vez só)', serve: ['Cavar areia nível 1: minhoca (isca de pesca)'] },
  paTatu: { nome: 'Pá de casco de tatu', nivel: 2, tipo: 'Ferramenta do kit', desc: 'Cava fundo: desenterra os baús marcados com X.', onde: 'Oficina (substitui a de concha)', serve: ['Desenterrar baús (nível 2)'] },
  martelo: { nome: 'Martelo de pedra', nivel: 1, tipo: 'Ferramenta do kit', desc: 'Abre os caixotes que o mar traz para a praia.', onde: 'Oficina (uma vez só)', serve: ['Abrir caixote nível 1'] },
  marteloOsso: { nome: 'Martelo de osso', nivel: 2, tipo: 'Ferramenta do kit', desc: 'Arromba os barris reforçados da vila e do engenho.', onde: 'Oficina (substitui o de pedra)', serve: ['Arrombar barril nível 2'] },
  ferro: { nome: 'Minério de ferro', nivel: 2, tipo: 'Recurso', desc: 'Pedra pesada e avermelhada. Fundida na forja, vira barra de ferro.', onde: 'Rocha com ferro (picareta nível 2), barris e baús', serve: ['Fundir em barra de ferro na forja (com carvão)', 'Reivindicar Cais, Engenho e Fortaleza'] },
  carvao: { nome: 'Carvão vegetal', nivel: 1, tipo: 'Recurso', desc: 'Madeira queimada devagar na brasa. Esquenta a forja o bastante para derreter ferro.', onde: 'Oficina, perto de uma fogueira, fogão ou forja', serve: ['Fundir minério de ferro na forja'] },
  tabua: { nome: 'Tábua serrada', nivel: 2, tipo: 'Recurso', desc: 'Madeira aparelhada para obras firmes e sobrados.', onde: 'Oficina (a partir de tronco)', serve: ['Erguer o Sobrado no lote', 'Montar bancada e móveis reforçados'] },
  barraFerro: { nome: 'Barra de ferro', nivel: 3, tipo: 'Recurso', desc: 'Ferro puro fundido na forja. Abre a era do metal em Niterói.', onde: 'Oficina, perto de uma forja (minério de ferro + carvão)', serve: ['Forjar pregos, armas, armaduras, armadilhas e ferramentas nível 3'] },
  prego: { nome: 'Pregos de ferro', nivel: 3, tipo: 'Recurso', desc: 'Pregos batidos a martelo na forja. Seguram sobrados e armadilhas pesadas.', onde: 'Oficina, perto de uma forja (barra de ferro)', serve: ['Erguer o Sobrado no lote', 'Forjar armadilha de ferro e bancada'] },
  peleOnca: { nome: 'Pele de onça', nivel: 3, tipo: 'Recurso', desc: 'Pele pintada da onça-pintada da mata profunda. Leve, resistente e imponente.', onde: 'Esfolar onça-pintada (mata do interior, atrás do Engenho)', serve: ['Fazer o Manto de onça (armadura ágil)'] },
  garraOnca: { nome: 'Garra de onça', nivel: 3, tipo: 'Recurso', desc: 'Garra curva e afiada da rainha da mata.', onde: 'Esfolar onça-pintada (mata do interior)', serve: ['Fazer o Colar de garras de onça (+30% de dano)'] },
  denteRei: { nome: 'Dente do Rei', nivel: 3, tipo: 'Veste', veste: 'amuleto', dano: 0.15, curaGolpe: 2, desc: 'O maior dente do Jacaré-Açu, preso num cordão de couro. Raro: só o Rei da Lagoa solta, e no máximo uma vez por dia.', onde: 'Saque raro do Jacaré-Açu (25%, 1 vez por dia)', efeito: 'Amuleto: +15% de dano e cada golpe cura 2 de vida' },
  moldeCoroa: { nome: 'Molde da Coroa de Escamas', nivel: 3, tipo: 'Recurso', desc: 'Um molde de barro com o desenho de uma coroa, achado no bucho do Jacaré-Açu. Raro.', onde: 'Saque raro do Jacaré-Açu (25%, 1 vez por dia)', serve: ['Fazer a Coroa de Escamas na forja'] },
  coroaRei: { nome: 'Coroa de Escamas', nivel: 3, tipo: 'Veste', veste: 'cabeca', nivelMin: 8, defesa: 0.18, antiveneno: true, desc: 'Coroa de ferro cravejada de escamas do Rei da Lagoa. Quem usa não pega veneno.', onde: 'Forja (molde raro do Jacaré-Açu)', efeito: 'Cabeça: recebe 18% menos dano e não pega veneno' },
  trofeuRei: { nome: 'Troféu do Rei da Lagoa', nivel: 3, tipo: 'Recurso', desc: 'O Jacaré-Açu empalhado. Monte na sua casa (B, mobiliar) para todo mundo ver.', onde: 'Primeira vez que você derruba o Jacaré-Açu', serve: ['Móvel de troféu na casa'] },
  escamaRei: { nome: 'Escama do Rei da Lagoa', nivel: 3, tipo: 'Recurso', desc: 'Placa grossa e reluzente do Jacaré-Açu, o chefe raro da Lagoa de Piratininga.', onde: 'Derrotar e esfolar o Jacaré-Açu (lagoa)', serve: ['Forjar a Espada do Rei da Lagoa', 'Forjar o Escudo do Rei da Lagoa'] },
  machadoFerro: { nome: 'Machado de ferro', nivel: 3, tipo: 'Ferramenta do kit', desc: 'Lâmina de ferro forjado. Derruba qualquer árvore mais rápido e rende +1 tronco garantido.', onde: 'Oficina, perto de uma forja (substitui o de presa)', serve: ['Cortar árvores nível 1 e 2 com +1 tronco extra'] },
  picaretaFerro: { nome: 'Picareta de ferro', nivel: 3, tipo: 'Ferramenta do kit', desc: 'Ponta de ferro temperado. Quebra rochas em menos golpes e dobra o ferro extraído.', onde: 'Oficina, perto de uma forja (substitui a de presa)', serve: ['Quebrar rochas nível 1 e 2 com dobro de ferro'] },
  paFerro: { nome: 'Pá de ferro', nivel: 3, tipo: 'Ferramenta do kit', desc: 'Lâmina de ferro firme. Desenterra baús e areia em 1 golpe com saque extra.', onde: 'Oficina, perto de uma forja (substitui a de tatu)', serve: ['Cavar areia e baús nível 1 e 2 com tesouro extra'] },
  marteloFerro: { nome: 'Martelo de ferro', nivel: 3, tipo: 'Ferramenta do kit', desc: 'Marreta de ferro pesado. Abre caixotes e barris num golpe só com saque extra.', onde: 'Oficina, perto de uma forja (substitui o de osso)', serve: ['Abrir caixotes e barris nível 1 e 2 num golpe só'] },
  minhoca: { nome: 'Minhoca', nivel: 1, tipo: 'Recurso', desc: 'Isca de pesca: com minhoca na bolsa, o peixe morde bem mais rápido (gasta 1 por lançada).', onde: 'Areia remexida da praia (pá)', serve: ['Isca de pesca'] },
  carne: { nome: 'Carne crua', nivel: 1, tipo: 'Comida', desc: 'Carne de caça. Crua faz mal: asse na fogueira.', onde: 'Esfolar bichos abatidos', efeito: 'Comer crua: fome +10, vida −8' },
  carneAssada: { nome: 'Carne assada', nivel: 2, tipo: 'Comida', desc: 'Carne assada na fogueira. Sustenta bem.', onde: 'Fogueira', efeito: 'Comer: fome +35, vida +8' },
  couro: { nome: 'Couro', nivel: 2, tipo: 'Recurso', desc: 'Pele tirada de um bicho abatido.', onde: 'Esfolar bichos abatidos' },
  osso: { nome: 'Osso', nivel: 2, tipo: 'Recurso', desc: 'Osso duro e afiável.', onde: 'Esfolar bichos abatidos' },
  lanca: { nome: 'Lança de osso', nivel: 2, tipo: 'Arma', desc: 'Ponta de osso numa haste. Mantém o bicho longe.', onde: 'Oficina', efeito: 'Arma: dano 14, 2 casas em linha' },
  // ---- caça (bichos da terra de Niterói)
  banha: { nome: 'Banha', nivel: 1, tipo: 'Recurso', desc: 'Gordura de capivara ou de cateto. Base de unguento e, um dia, de tocha e sabão.', onde: 'Esfolar capivara ou cateto' },
  cascoTatu: { nome: 'Casco de tatu', nivel: 2, tipo: 'Recurso', desc: 'A carapaça de placas do tatu. Leve e dura.', onde: 'Esfolar tatu (mata)' },
  presa: { nome: 'Presa de cateto', nivel: 2, tipo: 'Recurso', desc: 'Dente curvo do cateto. Quem usa um colar delas mostra que encarou o bando.', onde: 'Esfolar cateto (mata do interior)' },
  peleCobra: { nome: 'Pele de jararaca', nivel: 2, tipo: 'Recurso', desc: 'Pele de cobra seca. Enrolada no cabo, a arma não escorrega da mão suada.', onde: 'Abater jararaca (mata)' },
  couroJacare: { nome: 'Couro de jacaré', nivel: 3, tipo: 'Recurso', desc: 'Couro grosso do jacaré-de-papo-amarelo da Lagoa de Piratininga. A melhor armadura que um náufrago consegue.', onde: 'Esfolar jacaré (beira da lagoa)' },
  denteJacare: { nome: 'Dente de jacaré', nivel: 3, tipo: 'Recurso', desc: 'Dente cônico e afiado. Vira lâmina, ou troféu no pescoço de quem venceu o bicho.', onde: 'Esfolar jacaré (beira da lagoa)' },
  caranguejo: { nome: 'Caranguejo-uçá', nivel: 1, tipo: 'Comida', desc: 'Caranguejo do mangue. Corre de lado e belisca, mas um golpe resolve. Cru faz mal.', onde: 'Lama do mangue', efeito: 'Comer cru: fome +6, vida −4' },
  caranguejoCozido: { nome: 'Caranguejo cozido', nivel: 2, tipo: 'Comida', desc: 'Caranguejo cozido na fogueira, como nas vilas de pescadores.', onde: 'Fogueira ou fogão', efeito: 'Comer: fome +22, vida +6' },
  tocha: { nome: 'Tocha de banha', nivel: 1, tipo: 'Ferramenta', desc: 'Galho com palha embebida em banha. À noite acende sozinha se estiver na bolsa e ilumina em volta. Dura 3 minutos de noite.', onde: 'Oficina', serve: ['Enxergar à noite na mata e na praia'] },
  cantil: { nome: 'Cantil de couro', nivel: 1, tipo: 'Ferramenta', desc: 'Couro costurado e amarrado com cipó. Vazio. Encha numa bica de água doce.', onde: 'Oficina', serve: ['Encher numa bica (pé do Morro do Cavalão) e levar água para a mata e para o mar'] },
  cantilCheio: { nome: 'Cantil cheio', nivel: 1, tipo: 'Comida', desc: 'Água doce da bica. Mata a sede longe da água.', onde: 'Encher o cantil numa bica', efeito: 'Beber: sede +35 (o cantil volta vazio)' },
  // ---- comida que dura (moqueada: assada devagar na fumaça, como no moquém dos tupinambás) e a que estragou
  carneSeca: { nome: 'Carne moqueada', nivel: 2, tipo: 'Comida', estraga: 0, desc: 'Carne seca na fumaça da fogueira, devagar, num jirau de galhos. Não estraga: é a comida de viagem.', onde: 'Oficina, perto de uma fogueira', efeito: 'Comer: fome +25, vida +5 · não estraga' },
  peixeSeco: { nome: 'Peixe moqueado', nivel: 2, tipo: 'Comida', estraga: 0, desc: 'Peixe aberto e seco na fumaça. Não estraga: dá para levar para o mar.', onde: 'Oficina, perto de uma fogueira', efeito: 'Comer: fome +20, vida +4 · não estraga' },
  podre: { nome: 'Comida estragada', nivel: 1, tipo: 'Comida', estraga: 0, desc: 'Comida que passou da hora. Comer faz mal. Um dia vai servir de isca e de adubo.', onde: 'Comida crua ou cozida esquecida na bolsa', efeito: 'Comer: fome +4, vida −12' },
  // ---- plantas
  palha: { nome: 'Palha de coqueiro', nivel: 1, tipo: 'Recurso', desc: 'Folha seca de coqueiro. Trançada, vira chapéu, esteira e telhado.', onde: 'Às vezes cai junto com o coco' },
  aroeira: { nome: 'Folha de aroeira', nivel: 1, tipo: 'Remédio', desc: 'Folha da aroeira, árvore da restinga e da mata. As rezadeiras usam contra inflamação e veneno.', onde: 'Moitas de aroeira (frutinhas vermelhas) na mata', efeito: 'Mastigar: vida +8 (remédio nível 1)' },
  moqueca: { nome: 'Moqueca de peixe', nivel: 3, tipo: 'Comida', desc: 'Peixe cozido no leite de coco com aroeira, na panela de barro. Comida de festa.', onde: 'Oficina, perto de uma fogueira', efeito: 'Comer: fome +60, sede +10, vida +20 · bônus Bem alimentado: a fome não cai por 6 min' },
  caldoSururu: { nome: 'Caldo de sururu', nivel: 3, tipo: 'Comida', desc: 'Caldo grosso de sururu com coco. Esquenta por dentro.', onde: 'Oficina, perto de uma fogueira', efeito: 'Tomar: fome +45, sede +25, vida +15 · bônus Aquecido: cura em dobro por 5 min' },
  pacoca: { nome: 'Paçoca de carne', nivel: 3, tipo: 'Comida', estraga: 0, desc: 'Carne moqueada socada no pilão com rapadura de cana. Comida de viagem, não estraga.', onde: 'Oficina, perto de uma fogueira', efeito: 'Comer: fome +50, vida +10 · bônus Forte: +15% de dano por 4 min · não estraga' },
  garrafada: { nome: 'Garrafada de aroeira', nivel: 3, tipo: 'Remédio', desc: 'Aroeira curtida com caldo de cana no cantil. Remédio forte das rezadeiras.', onde: 'Oficina, perto de uma fogueira (devolve o cantil)', efeito: 'Tomar: vida +70 e cura veneno · bônus Fechado: não pega veneno por 5 min' },
  unguento: { nome: 'Unguento de aroeira', nivel: 2, tipo: 'Remédio', desc: 'Folha de aroeira socada com banha. Fecha ferida e tira o veneno de cobra.', onde: 'Oficina', efeito: 'Usar: vida +30 e cura veneno' },
  // ---- armas novas
  borduna: { nome: 'Borduna', nivel: 2, tipo: 'Arma', desc: 'Clava de madeira dura com pedra amarrada na ponta. Lenta, mas derruba.', onde: 'Oficina', efeito: 'Arma: dano 21, arco de 3 casas, golpe lento' },
  facaDente: { nome: 'Faca de dente de jacaré', nivel: 3, tipo: 'Arma', desc: 'Dente de jacaré encabado em osso, com pele de cobra no cabo. A melhor lâmina antes do ferro.', onde: 'Oficina', efeito: 'Arma: dano 16, 1 casa, golpe rápido', serve: ['Cortar cipó e cana', 'Esfolar'] },
  adagaFerro: { nome: 'Adaga de ferro', nivel: 3, tipo: 'Arma', desc: 'Lâmina fina e letal forjada a ferro. Golpes velozes e corte limpo.', onde: 'Oficina, perto de uma forja', efeito: 'Arma: dano 22, golpe muito rápido', serve: ['Cortar cipó e cana', 'Esfolar'] },
  sabreFerro: { nome: 'Sabre de ferro', nivel: 3, tipo: 'Arma', desc: 'A primeira espada pirata de verdade. Equilibrada, com corte largo.', onde: 'Oficina, perto de uma forja', efeito: 'Arma: dano 28, arco largo e firme' },
  machadoLuta: { nome: 'Machado de abordagem', nivel: 3, tipo: 'Arma', desc: 'Machado pesado de ferro de duas mãos. Devastador no corpo a corpo.', onde: 'Oficina, perto de uma forja', efeito: 'Arma: dano 36, arco amplo, golpe pesado' },
  sabreRei: { nome: 'Espada do Rei da Lagoa', nivel: 3, tipo: 'Arma', nivelMin: 8, desc: 'Lâmina de ferro temperado com escamas do Jacaré-Açu. Uma arma lendária em Niterói.', onde: 'Oficina, perto de uma forja (pede Nv 8)', efeito: 'Arma lendária: dano 42, arco amplo e veloz' },
  besta: { nome: 'Besta de ferro', nivel: 3, tipo: 'Arma', desc: 'Arco de ferro montado em coronha de madeira. Dispara virotes de ferro com força e alcance.', onde: 'Oficina, perto de uma forja', efeito: 'Arma: dano 26 de longe (até 14 m), gasta 1 virote por tiro', serve: ['Caçar onça-pintada e enfrentar o Jacaré-Açu à distância'] },
  virote: { nome: 'Virote de ferro', nivel: 3, tipo: 'Munição', desc: 'Seta curta com ponta de ferro para a besta. Metade das vezes dá para recuperar do chão.', onde: 'Oficina, perto de uma forja (faz 8 de uma vez)', serve: ['Atirar com a besta de ferro'] },
  armadilhaFerro: { nome: 'Armadilha de ferro', nivel: 3, tipo: 'Armadilha', desc: 'Mordente de aço com mola forte. Segura até onça e jacaré.', onde: 'Oficina, perto de uma forja (monta à sua frente)', efeito: 'Bicho que pisa: dano 55 e preso por 7 s; E arma de novo', construcao: true },
  // ---- vestes (cabeça, corpo, pernas e amuleto). O que está vestido vale enquanto estiver na bolsa.
  chapeuPalha: { nome: 'Chapéu de palha', nivel: 1, tipo: 'Veste', veste: 'cabeca', sede: 0.25, desc: 'Palha de coqueiro trançada. Protege do sol de Icaraí. Dizem que um chapéu assim já foi promessa de um grande capitão.', onde: 'Oficina', efeito: 'Cabeça: a sede cai 25% mais devagar' },
  capaceteTatu: { nome: 'Capacete de casco de tatu', nivel: 2, tipo: 'Veste', veste: 'cabeca', defesa: 0.08, desc: 'Meia carapaça de tatu presa com cipó.', onde: 'Oficina', efeito: 'Cabeça: recebe 8% menos dano' },
  gibao: { nome: 'Gibão de couro', nivel: 2, tipo: 'Veste', veste: 'corpo', defesa: 0.2, desc: 'Colete de couro. Leve: não afunda quem cai no mar.', onde: 'Oficina', efeito: 'Corpo: recebe 20% menos dano, sem pesar' },
  couracaTatu: { nome: 'Couraça de tatu', nivel: 2, tipo: 'Veste', veste: 'corpo', defesa: 0.3, vel: -0.06, desc: 'Placas de casco de tatu costuradas num gibão. Dura, mas pesa.', onde: 'Oficina', efeito: 'Corpo: recebe 30% menos dano, anda 6% mais devagar' },
  couracaJacare: { nome: 'Couraça de jacaré', nivel: 3, tipo: 'Veste', veste: 'corpo', defesa: 0.4, vel: -0.08, desc: 'Couro de jacaré em camadas. Quem veste isso já venceu o bicho mais perigoso da lagoa.', onde: 'Oficina', efeito: 'Corpo: recebe 40% menos dano, anda 8% mais devagar' },
  caneleiras: { nome: 'Caneleiras de cipó', nivel: 1, tipo: 'Veste', veste: 'pernas', defesa: 0.03, antiveneno: true, desc: 'Cipó trançado bem apertado da canela ao joelho. A presa da jararaca não atravessa.', onde: 'Oficina', efeito: 'Pernas: picada de cobra não envenena · 3% menos dano' },
  perneiras: { nome: 'Perneiras de couro', nivel: 2, tipo: 'Veste', veste: 'pernas', defesa: 0.06, lama: true, desc: 'Couro grosso, que não encharca. Feitas para andar no mangue.', onde: 'Oficina', efeito: 'Pernas: a lama do mangue não atrasa · 6% menos dano' },
  colarPresas: { nome: 'Colar de presas', nivel: 2, tipo: 'Veste', veste: 'amuleto', dano: 0.1, desc: 'Presas de cateto num fio de cipó. Troféu de caçador: o bicho respeita, o homem também.', onde: 'Oficina', efeito: 'Amuleto: +10% de dano' },
  colarDentes: { nome: 'Colar de dentes de jacaré', nivel: 3, tipo: 'Veste', veste: 'amuleto', dano: 0.2, desc: 'Dentes de jacaré enfiados num cordão. A primeira marca de fama de um pirata.', onde: 'Oficina', efeito: 'Amuleto: +20% de dano' },
  elmoFerro: { nome: 'Elmo de ferro', nivel: 3, tipo: 'Veste', veste: 'cabeca', defesa: 0.18, desc: 'Capacete batido em chapa de ferro na forja. Protege bem contra botes.', onde: 'Oficina, perto de uma forja', efeito: 'Cabeça: recebe 18% menos dano' },
  peitoralFerro: { nome: 'Peitoral de ferro', nivel: 3, tipo: 'Veste', veste: 'corpo', defesa: 0.52, vel: -0.09, desc: 'Couraça de placas de ferro sobre couro. A maior proteção de Niterói, mas pesa no passo.', onde: 'Oficina, perto de uma forja', efeito: 'Corpo: recebe 52% menos dano, anda 9% mais devagar' },
  elmoOnca: { nome: 'Elmo de onça', nivel: 3, tipo: 'Veste', veste: 'cabeca', defesa: 0.15, desc: 'Cabeça da onça-pintada curtida sobre um gorro de couro. Completa o conjunto Predador da Mata.', onde: 'Oficina', efeito: 'Cabeça: recebe 15% menos dano' },
  mantoOnca: { nome: 'Manto de onça', nivel: 3, tipo: 'Veste', veste: 'corpo', defesa: 0.42, vel: 0.1, desc: 'Gibão forrado com pele de onça-pintada. Protege firme e deixa o passo mais leve.', onde: 'Oficina', efeito: 'Corpo: recebe 42% menos dano e anda 10% mais rápido' },
  colarOnca: { nome: 'Colar de garras de onça', nivel: 3, tipo: 'Veste', veste: 'amuleto', dano: 0.3, desc: 'Garras da onça-pintada num cordão trançado. Impõe respeito na mata e na cidade.', onde: 'Oficina', efeito: 'Amuleto: +30% de dano' },
  broquel: { nome: 'Broquel de ferro', nivel: 3, tipo: 'Veste', veste: 'escudo', defesa: 0.15, desc: 'Escudo redondo reforçado com aro de ferro. Fica no braço sem ocupar a mão da arma.', onde: 'Oficina, perto de uma forja', efeito: 'Escudo: recebe 15% menos dano' },
  escudoRei: { nome: 'Escudo do Rei da Lagoa', nivel: 3, tipo: 'Veste', veste: 'escudo', nivelMin: 8, defesa: 0.25, dano: 0.1, desc: 'Escudo cravado com escamas e dentes do Jacaré-Açu. Defesa e impacto lendários.', onde: 'Oficina, perto de uma forja (pede Nv 8)', efeito: 'Escudo lendário: 25% menos dano e +10% de dano' },
  // construções (não vão para a bolsa, mas aparecem na oficina)
  arco: { nome: 'Arco', nivel: 2, tipo: 'Arma', desc: 'Galho vergado com corda de cipó. Caça de longe o bicho que foge.', onde: 'Oficina', efeito: 'Arma: dano 13 de longe (até 11 m), gasta 1 flecha por tiro', serve: ['Caçar capivara, quati e tatu antes que fujam'] },
  flecha: { nome: 'Flecha', nivel: 1, tipo: 'Munição', desc: 'Haste de galho com ponta de pedra lascada. Metade das vezes dá para pegar de volta.', onde: 'Oficina (faz 4 de uma vez)', serve: ['Atirar com o arco'] },
  fojo: { nome: 'Fojo de estacas', nivel: 1, tipo: 'Armadilha', desc: 'Buraco coberto de palha com estacas no fundo. O bicho que pisa se fere e fica preso.', onde: 'Oficina (monta à sua frente)', efeito: 'Bicho que pisa: dano 30 e preso por 5 s; E arma de novo', construcao: true },
  fogueira: { nome: 'Fogueira', nivel: 1, tipo: 'Construção', desc: 'Fogo de pedras e lenha. Cozinha, aquece e recupera vida de quem fica perto.', onde: 'Oficina (monta à sua frente)', serve: ['Cozinhar sururu e assar carne', 'Recuperar vida ao lado do fogo'], construcao: true },
  jangada: { nome: 'Jangada', nivel: 1, tipo: 'Embarcação', desc: 'Troncos amarrados com cipó e uma vela de palha. Leva você para o mar.', onde: 'Oficina (na beira d\'água)', serve: ['Sair da praia para o mar da Guanabara'], construcao: true },
};
// combinações na bolsa: um item com outro (no celular, pela ficha do item; no computador, arrastando um sobre o outro)
export const COMBINACOES = [
  { a: 'coco', b: 'pedra', vira: 'cocoAberto', gasta: { coco: 1 }, como: 'quebra o coco com a pedra' },
  { a: 'pedra', b: 'pedra', vira: 'pedraLascada', gasta: { pedra: 1 }, como: 'bate uma pedra na outra até ganhar fio' },
];
// o que vira o que na fogueira
// ESTRAGA: minutos reais até 1 unidade estragar na bolsa (o baú conserva). Cru estraga rápido, cozido demora mais.
export const ESTRAGA = { carne: 5, peixe: 5, caranguejo: 5, sururu: 5, carneAssada: 12, peixeAssado: 12, mariscos: 12, caranguejoCozido: 12 , moqueca: 20, caldoSururu: 20 };
export const COZINHA = [{ de: 'sururu', vira: 'mariscos' }, { de: 'carne', vira: 'carneAssada' }, { de: 'peixe', vira: 'peixeAssado' }, { de: 'caranguejo', vira: 'caranguejoCozido' }];
// vestes: em que lugar do corpo cada uma vai
export const LUGARES_VESTE = { cabeca: 'Cabeça', corpo: 'Corpo', pernas: 'Pernas', escudo: 'Escudo', amuleto: 'Amuleto' };
// receitas em que o item entra como ingrediente
export const usosDe = (id, receitas) => receitas.filter((r) => r.pede[id]);

// ---------------------------------------------------------------------
// ESTÚDIO DE ÍCONES: renderiza cada item em 3D (3/4 de cima) com contorno
// ---------------------------------------------------------------------
const TRACO = '#2b1d0e';
const K = new URL('../modelos/kenney/', import.meta.url).href, PP = new URL('../modelos/polypizza/', import.meta.url).href, KK = new URL('../modelos/kaykit-adventurers/acessorios/', import.meta.url).href;
const MODELOS = {   // itens que usam modelo pronto da Kenney (CC0), Poly Pizza e KayKit (CC0)
  pedra: K + 'nature-kit/Models/GLTF format/stone_smallA.json',
  tronco: K + 'survival-kit/Models/GLB format/resource-wood.json',
  machado: K + 'survival-kit/Models/GLB format/tool-axe.json',
  fogueira: K + 'survival-kit/Models/GLB format/campfire-pit.json',
  // modelos prontos do Poly Pizza (créditos em modelos/polypizza/CREDITOS.json)
  gibao: PP + 'armaduraCouro.json', chapeuPalha: PP + 'chapeuBambu.json', colarPresas: PP + 'colar.json', colarDentes: PP + 'colar.json',
  borduna: PP + 'clava.json', unguento: PP + 'pote.json', carne: PP + 'carne.json', denteJacare: PP + 'denteTubarao.json', presa: PP + 'denteTubarao.json',
  aroeira: PP + 'planta.json',
  tocha: PP + 'tocha.json',
  picareta: K + 'survival-kit/Models/GLB format/tool-pickaxe.json', pa: K + 'survival-kit/Models/GLB format/tool-shovel.json', martelo: K + 'survival-kit/Models/GLB format/tool-hammer.json',
  machadoPresa: K + 'survival-kit/Models/GLB format/tool-axe-upgraded.json', picaretaPresa: K + 'survival-kit/Models/GLB format/tool-pickaxe-upgraded.json',
  paTatu: K + 'survival-kit/Models/GLB format/tool-shovel-upgraded.json', marteloOsso: K + 'survival-kit/Models/GLB format/tool-hammer-upgraded.json',
  ferro: K + 'nature-kit/Models/GLTF format/rock_smallC.json',
  arco: PP + 'arco.json', fojo: PP + 'fojo.json', armadilhaFerro: PP + 'armadilhaFerro.json',
  flecha: KK + 'arrow_bundle.json',
  adagaFerro: KK + 'dagger.json', sabreFerro: KK + 'sword_1handed.json', machadoLuta: KK + 'axe_2handed.json',
  denteRei: PP + 'denteTubarao.json', trofeuRei: PP + 'jacare.json',
  sabreRei: KK + 'sword_2handed_color.json', besta: KK + 'crossbow_2handed.json',
  broquel: KK + 'shield_round.json', escudoRei: KK + 'shield_spikes_color.json',
  cantil: K + 'pirate-kit/Models/GLB format/bottle.json', cantilCheio: K + 'pirate-kit/Models/GLB format/bottle.json',
};
const lam = (cor) => new THREE.MeshLambertMaterial({ color: cor, flatShading: true });
function malha(g, cor, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) { const m = new THREE.Mesh(g, lam(cor)); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); return m; }
// itens sem modelo pronto: montados aqui com peças simples
const FEITOS = {
  jangada: () => [...[-0.6, -0.3, 0, 0.3, 0.6].map((z, k) => malha(new THREE.CylinderGeometry(0.15, 0.16, 2.2, 7), k % 2 ? '#8a6a44' : '#7a5a36', 0, 0, z, 0, 0, Math.PI / 2)),
    malha(new THREE.CylinderGeometry(0.04, 0.05, 1.6, 5), '#6e4a2c', -0.3, 0.8, 0), malha(new THREE.ConeGeometry(0.55, 1.1, 3).scale(1, 1, 0.12), '#7fa64a', 0.05, 0.95, 0, 0, Math.PI / 2, 0)],
  concha: () => { const s = new THREE.Shape(); s.moveTo(0, 0); for (let i = 0; i <= 10; i++) { const a = Math.PI * (0.15 + 0.7 * i / 10), r = i % 2 ? 0.9 : 1; s.lineTo(Math.cos(a) * r, Math.sin(a) * r); } s.closePath();
    return [malha(new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.08, bevelSegments: 1 }), '#f3c9b4', 0, -0.4, 0, -0.5)]; },
  galho: () => [malha(new THREE.CylinderGeometry(0.07, 0.1, 2, 6), '#7a5230', 0, 0, 0, 0, 0, 1.1), malha(new THREE.CylinderGeometry(0.04, 0.06, 0.7, 5), '#7a5230', 0.2, 0.3, 0, 0, 0, 0.3),
    malha(new THREE.OctahedronGeometry(0.16, 0).scale(1.6, 0.5, 1), '#5d9a3a', 0.35, 0.65, 0), malha(new THREE.OctahedronGeometry(0.14, 0).scale(1.6, 0.5, 1), '#4f8a34', -0.6, 0.45, 0.1)],
  cocoAberto: () => [malha(new THREE.SphereGeometry(0.85, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), '#6b4423', 0, 0.3, 0), malha(new THREE.CylinderGeometry(0.78, 0.78, 0.06, 14), '#f3efe2', 0, 0.3, 0), malha(new THREE.CylinderGeometry(0.6, 0.6, 0.07, 14), '#cfe9ef', 0, 0.32, 0)],
  pedraLascada: () => [malha(new THREE.OctahedronGeometry(0.75, 0).scale(1.5, 0.5, 0.75), '#8f887c', 0, 0, 0, 0, 0, -0.5), malha(new THREE.OctahedronGeometry(0.3, 0).scale(1.4, 0.3, 0.6), '#c9c2ae', 0.55, 0.32, 0.12, 0, 0, -0.5)],
  coco: () => [malha(new THREE.IcosahedronGeometry(0.8, 1), '#6b4423'), ...[[-0.25, 0.35], [0.25, 0.35], [0, 0.05]].map(([x, y]) => malha(new THREE.SphereGeometry(0.1, 6, 4), '#2b1d0e', x, y, 0.72))],
  cipo: () => [0, 1, 2].map((k) => malha(new THREE.TorusGeometry(0.62 - k * 0.04, 0.09, 5, 14), k % 2 ? '#6f7f34' : '#5f6f2c', 0, k * 0.12 - 0.1, 0, Math.PI / 2 + k * 0.15, 0, k * 0.4)).concat([malha(new THREE.OctahedronGeometry(0.18, 0).scale(1.6, 0.5, 1), '#5d9a3a', 0.6, 0.15, 0.2)]),
  cana: () => [[-0.35, '#b8b44e'], [0, '#c9c45a'], [0.35, '#a9a648']].flatMap(([x, cor]) => [malha(new THREE.CylinderGeometry(0.11, 0.12, 2.1, 6), cor, x, 0, 0, 0, 0, x * 0.5), ...[-0.5, 0.2].map((y) => malha(new THREE.CylinderGeometry(0.14, 0.14, 0.06, 6), '#8a8a3a', x - y * x * 0.25, y, 0, 0, 0, x * 0.5))]).concat([malha(new THREE.ConeGeometry(0.25, 1.1, 4).scale(1, 1, 0.3), '#5d9a3a', 0.2, 1.2, 0, 0, 0, -0.6)]),
  vara: () => [malha(new THREE.CylinderGeometry(0.05, 0.08, 2.8, 6), '#7a5230', 0, 0, 0, 0, 0, -0.7), malha(new THREE.TorusGeometry(0.5, 0.025, 4, 12, Math.PI * 1.3), '#e8e2cf', 0.75, 0.1, 0, 0, 0, -1.2), malha(new THREE.ConeGeometry(0.12, 0.3, 5), '#f3c9b4', 0.85, -0.55, 0, 0, 0, Math.PI)],
  peixe: () => [malha(new THREE.SphereGeometry(0.75, 10, 6).scale(1.2, 0.55, 0.35), '#7fa6b8'), malha(new THREE.ConeGeometry(0.45, 0.6, 3).scale(1, 1, 0.3), '#5f879a', -1.05, 0, 0, 0, 0, Math.PI / 2), malha(new THREE.SphereGeometry(0.09, 6, 4), '#2b1d0e', 0.6, 0.12, 0.25)],
  peixeAssado: () => [malha(new THREE.SphereGeometry(0.75, 10, 6).scale(1.2, 0.55, 0.35), '#b0703a'), malha(new THREE.ConeGeometry(0.45, 0.6, 3).scale(1, 1, 0.3), '#8a4a2a', -1.05, 0, 0, 0, 0, Math.PI / 2), malha(new THREE.CylinderGeometry(0.05, 0.05, 2.8, 5), '#6e4a2c', 0, 0, 0.3, 0, 0, Math.PI / 2)],
  minhoca: () => [malha(new THREE.TorusGeometry(0.55, 0.13, 6, 16, Math.PI * 1.4), '#d98a8a', 0, 0, 0, 0.3, 0, 0.4), malha(new THREE.TorusGeometry(0.3, 0.12, 6, 12, Math.PI), '#d98a8a', 0.55, -0.15, 0, 0.3, 0, 3.4)],
  moqueca: () => [malha(new THREE.SphereGeometry(0.95, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), '#8a4a2a', 0, 0.2, 0), malha(new THREE.CylinderGeometry(0.85, 0.85, 0.05, 12), '#e0a040', 0, 0.12, 0),
    ...[[-0.3, 0.2], [0.25, -0.2], [0.1, 0.35]].map(([x, z]) => malha(new THREE.SphereGeometry(0.22, 7, 4).scale(1.6, 0.5, 0.8), '#f1ead8', x, 0.2, z)), malha(new THREE.OctahedronGeometry(0.14, 0).scale(1.6, 0.4, 1), '#5d9a3a', -0.1, 0.24, -0.3)],
  caldoSururu: () => [malha(new THREE.SphereGeometry(0.95, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), '#6b4423', 0, 0.2, 0), malha(new THREE.CylinderGeometry(0.85, 0.85, 0.05, 12), '#d8c08a', 0, 0.12, 0),
    ...[[-0.3, 0.2], [0.25, -0.15], [0.1, 0.35], [-0.2, -0.3]].map(([x, z]) => malha(new THREE.SphereGeometry(0.2, 7, 4).scale(1, 0.45, 0.6), '#2a2f3a', x, 0.2, z))],
  sururu: () => [[-0.35, 0, 0.3], [0.3, 0.05, 0.2], [0, 0.1, -0.3]].map(([x, y, r]) => malha(new THREE.SphereGeometry(0.5, 8, 5).scale(1, 0.45, 0.6), r > 0 ? '#2a2f3a' : '#3a3546', x, y, 0, 0, r * 2, 0.2)),
  mariscos: () => [malha(new THREE.SphereGeometry(0.95, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), '#8a5a2b', 0, 0.2, 0), malha(new THREE.CylinderGeometry(0.85, 0.85, 0.05, 12), '#e9c48a', 0, 0.12, 0),
    ...[[-0.3, 0.2], [0.25, -0.15], [0.1, 0.35]].map(([x, z]) => malha(new THREE.SphereGeometry(0.3, 7, 4).scale(1, 0.45, 0.6), '#2a2f3a', x, 0.22, z, 0, x * 3, 0))],
  faca: () => [malha(new THREE.CylinderGeometry(0.12, 0.12, 0.8, 6), '#6e4a2c', -0.55, -0.35, 0, 0, 0, 0.8), malha(new THREE.ConeGeometry(0.28, 1.4, 4).scale(1, 1, 0.35), '#f1d4c2', 0.3, 0.3, 0, 0, 0, -0.75)],
  carne: () => [malha(new THREE.DodecahedronGeometry(0.75, 0).scale(1.2, 0.8, 0.9), '#c0504a'), malha(new THREE.CylinderGeometry(0.1, 0.1, 0.6, 6), '#f1ead8', 0.95, 0.1, 0, 0, 0, 1.5), malha(new THREE.SphereGeometry(0.14, 6, 4), '#f1ead8', 1.25, 0.1, 0)],
  carneAssada: () => [malha(new THREE.DodecahedronGeometry(0.75, 0).scale(1.2, 0.8, 0.9), '#8a4a2a'), malha(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 5), '#6e4a2c', 0, 0, 0, 0, 0, 1.5)],
  couro: () => { const s = new THREE.Shape(); const p = [[-1, -0.4], [-0.7, -0.8], [-0.2, -0.6], [0.3, -0.85], [0.9, -0.5], [1, 0.1], [0.7, 0.6], [0.2, 0.5], [-0.3, 0.8], [-0.9, 0.4]]; s.moveTo(...p[0]); p.slice(1).forEach((q) => s.lineTo(...q)); s.closePath();
    return [malha(new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: false }), '#b98a5a', 0, 0, 0, -1.1)]; },
  osso: () => [malha(new THREE.CylinderGeometry(0.13, 0.13, 1.6, 7), '#f1ead8', 0, 0, 0, 0, 0, 1.2), ...[[-0.72, -0.48], [0.72, 0.48]].flatMap(([x, y]) => [malha(new THREE.SphereGeometry(0.2, 7, 5), '#f1ead8', x - 0.1, y + 0.12, 0), malha(new THREE.SphereGeometry(0.2, 7, 5), '#f1ead8', x + 0.1, y - 0.12, 0)])],
  lanca: () => [malha(new THREE.CylinderGeometry(0.06, 0.07, 2.6, 6), '#7a5230', 0, 0, 0, 0, 0, -0.8), malha(new THREE.ConeGeometry(0.16, 0.6, 5), '#f1ead8', 0.98, 0.95, 0, 0, 0, -0.8), malha(new THREE.TorusGeometry(0.09, 0.04, 4, 8), '#5f6f2c', 0.7, 0.68, 0, 0, Math.PI / 2, -0.8)],
  gibao: () => { const s = new THREE.Shape(); s.moveTo(-0.8, -1); s.lineTo(0.8, -1); s.lineTo(0.85, 0.5); s.lineTo(0.45, 0.95); s.lineTo(0.15, 0.95); s.lineTo(0, 0.2); s.lineTo(-0.15, 0.95); s.lineTo(-0.45, 0.95); s.lineTo(-0.85, 0.5); s.closePath();
    return [malha(new THREE.ExtrudeGeometry(s, { depth: 0.3, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 1 }), '#9a6a3a'), malha(new THREE.BoxGeometry(1.5, 0.12, 0.42), '#6e4a2c', 0, -0.45, 0.15)]; },
};
// ícones dos itens de caça, plantas, armas novas e vestes
const pena = (cor, x, y, z, s = 1, rz = 0) => malha(new THREE.OctahedronGeometry(0.22 * s, 0).scale(1.7, 0.45, 1), cor, x, y, z, 0, 0, rz);
const colar = (cor, n, forma) => [malha(new THREE.TorusGeometry(0.85, 0.035, 4, 24, Math.PI), '#6f7f34', 0, 0.2, 0, 0, 0, Math.PI),
  ...Array.from({ length: n }, (_, k) => { const a = Math.PI * (1.15 + 0.7 * k / (n - 1)); return malha(forma(), cor, Math.cos(a) * 0.85, 0.2 + Math.sin(a) * 0.85, 0, 0, 0, a + Math.PI / 2); })];
const placas = (cor, w, n) => Array.from({ length: n }, (_, k) => malha(new THREE.CylinderGeometry(0.9, 0.9, 0.22, 10, 1, false, 0, Math.PI).scale(w, 1, 0.75), k % 2 ? cor : '#8a7a62', 0, 0, (k - (n - 1) / 2) * 0.24, Math.PI / 2, 0, 0));
const garras = (cor, perna) => [-1, 1].flatMap((l) => [malha(new THREE.SphereGeometry(0.28, 7, 5).scale(1.2, 0.7, 0.8), cor, l * 1.0, 0.1, 0.5),
  ...[0, 1, 2].map((k) => malha(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 4), perna, l * 0.95, -0.15, -0.35 + k * 0.3, 0, 0, l * 1.1))]);
Object.assign(FEITOS, {
  banha: () => [malha(new THREE.CylinderGeometry(0.6, 0.7, 0.8, 9), '#9a6a3a', 0, -0.2, 0), malha(new THREE.SphereGeometry(0.58, 9, 5, 0, Math.PI * 2, 0, Math.PI / 2), '#f3ead0', 0, 0.2, 0)],
  cascoTatu: () => placas('#a8946e', 1, 5),
  presa: () => [malha(new THREE.ConeGeometry(0.22, 1.5, 6), '#f1ead8', 0, 0, 0, 0, 0, -0.6), malha(new THREE.ConeGeometry(0.18, 1.1, 6), '#e6dcc2', 0.45, -0.1, 0.2, 0, 0, -0.9)],
  peleCobra: () => [0, 1, 2, 3, 4].map((k) => malha(new THREE.TorusGeometry(0.3, 0.1, 5, 10, Math.PI), k % 2 ? '#8a7a3a' : '#5a4a24', -0.9 + k * 0.45, 0, 0, 0, 0, k % 2 ? Math.PI : 0)),
  couroJacare: () => [malha(new THREE.BoxGeometry(1.9, 0.08, 1.3), '#4f5a2c'), ...[-0.6, -0.2, 0.2, 0.6].flatMap((x) => [-0.3, 0.1, 0.45].map((z) => malha(new THREE.BoxGeometry(0.3, 0.12, 0.28), '#3a4420', x, 0.08, z - 0.1)))],
  denteJacare: () => [malha(new THREE.ConeGeometry(0.3, 1.6, 7), '#f3ecd6', 0, 0, 0, 0, 0, 0.25)],
  caranguejo: () => [malha(new THREE.SphereGeometry(0.7, 10, 6).scale(1.2, 0.5, 0.9), '#5a6a8a'), ...garras('#c0603a', '#4a5a7a')],
  caranguejoCozido: () => [malha(new THREE.SphereGeometry(0.7, 10, 6).scale(1.2, 0.5, 0.9), '#d8552e'), ...garras('#e0703a', '#c84a2a')],
  palha: () => [0, 1, 2, 3].map((k) => malha(new THREE.BoxGeometry(2.0, 0.04, 0.2), k % 2 ? '#d9c27a' : '#c9ae62', 0, k * 0.05, (k - 1.5) * 0.18, 0, (k - 1.5) * 0.12, 0)),
  aroeira: () => [malha(new THREE.CylinderGeometry(0.04, 0.05, 1.8, 5), '#6e4a2c', 0, 0, 0, 0, 0, 0.9), ...[-0.6, -0.2, 0.2, 0.6].flatMap((x) => [pena('#4f8a34', x * 0.75 - 0.1, x * 0.5 + 0.25, 0.1, 1, 0.5), pena('#5d9a3a', x * 0.75 + 0.15, x * 0.5 - 0.05, -0.1, 1, -0.4)]),
    ...[[0.55, 0.65], [0.7, 0.5], [0.45, 0.48]].map(([x, y]) => malha(new THREE.SphereGeometry(0.08, 6, 4), '#c0281c', x, y, 0.15))],
  unguento: () => [malha(new THREE.CylinderGeometry(0.65, 0.55, 0.6, 10), '#8a5a2b', 0, -0.2, 0), malha(new THREE.CylinderGeometry(0.58, 0.58, 0.08, 10), '#6f9c3e', 0, 0.12, 0), malha(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 5), '#6e4a2c', 0.25, 0.5, 0, 0, 0, -0.4)],
  borduna: () => [malha(new THREE.CylinderGeometry(0.12, 0.08, 2.2, 6), '#5e3a1e', 0, 0, 0, 0, 0, -0.7), malha(new THREE.DodecahedronGeometry(0.35, 0), '#8f887c', 0.75, 0.55, 0), malha(new THREE.TorusGeometry(0.2, 0.05, 4, 8), '#5f6f2c', 0.55, 0.38, 0, 0, Math.PI / 2, -0.7)],
  facaDente: () => [malha(new THREE.CylinderGeometry(0.13, 0.13, 0.8, 6), '#f1ead8', -0.55, -0.35, 0, 0, 0, 0.8), malha(new THREE.CylinderGeometry(0.15, 0.15, 0.35, 6), '#6a5a2a', -0.4, -0.2, 0, 0, 0, 0.8), malha(new THREE.ConeGeometry(0.24, 1.3, 7), '#f3ecd6', 0.3, 0.3, 0, 0, 0, -0.75)],
  chapeuPalha: () => [malha(new THREE.CylinderGeometry(1.15, 1.15, 0.08, 18), '#e2c46a'), malha(new THREE.CylinderGeometry(0.55, 0.6, 0.55, 14), '#e2c46a', 0, 0.3, 0), malha(new THREE.CylinderGeometry(0.61, 0.61, 0.14, 14), '#c0281c', 0, 0.12, 0)],
  capaceteTatu: () => [malha(new THREE.SphereGeometry(0.85, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), '#a8946e'), ...[0.25, 0.5, 0.72].map((y) => malha(new THREE.TorusGeometry(Math.sqrt(0.85 * 0.85 - y * y), 0.04, 4, 16), '#7a6a4e', 0, y, 0, Math.PI / 2))],
  couracaTatu: () => { const g = FEITOS.gibao(); g[0].material.color.set('#8a6a3a'); return [...g, ...[-0.55, -0.15, 0.25].map((y) => malha(new THREE.BoxGeometry(1.45, 0.24, 0.12), '#a8946e', 0, y, 0.38))]; },
  couracaJacare: () => { const g = FEITOS.gibao(); g[0].material.color.set('#4f5a2c'); return [...g, ...[-0.5, -0.1, 0.3].flatMap((y) => [-0.45, 0, 0.45].map((x) => malha(new THREE.BoxGeometry(0.32, 0.25, 0.12), '#3a4420', x, y, 0.38)))]; },
  caneleiras: () => [-0.45, 0.45].flatMap((x) => [0, 1, 2, 3, 4].map((k) => malha(new THREE.TorusGeometry(0.3, 0.07, 5, 10), k % 2 ? '#6f7f34' : '#5f6f2c', x, -0.7 + k * 0.32, 0, Math.PI / 2))),
  perneiras: () => [-0.45, 0.45].flatMap((x) => [malha(new THREE.CylinderGeometry(0.32, 0.26, 1.6, 8), '#b98a5a', x, 0, 0), malha(new THREE.TorusGeometry(0.3, 0.05, 4, 10), '#6e4a2c', x, 0.4, 0, Math.PI / 2), malha(new THREE.TorusGeometry(0.28, 0.05, 4, 10), '#6e4a2c', x, -0.3, 0, Math.PI / 2)]),
  colarPresas: () => colar('#f1ead8', 5, () => new THREE.ConeGeometry(0.11, 0.45, 5)),
  colarDentes: () => colar('#f3ecd6', 7, () => new THREE.ConeGeometry(0.1, 0.5, 6)),
  carvao: () => [malha(new THREE.DodecahedronGeometry(0.6, 0).scale(1.2, 0.7, 0.9), '#2b2826', -0.25, -0.1, 0), malha(new THREE.DodecahedronGeometry(0.48, 0), '#1f1d1c', 0.45, 0.15, 0.2), malha(new THREE.DodecahedronGeometry(0.35, 0), '#d95a24', 0.1, 0.28, -0.15)],
  tabua: () => [0, 1, 2].map((k) => malha(new THREE.BoxGeometry(2.1, 0.22, 0.65), k % 2 ? '#b88a54' : '#a07442', 0, -0.35 + k * 0.3, (k - 1) * 0.12, 0, (k - 1) * 0.08, 0)),
  barraFerro: () => [malha(new THREE.BoxGeometry(1.75, 0.45, 0.72), '#7e8e9c', 0, -0.1, 0, 0, 0.25, 0), malha(new THREE.BoxGeometry(1.5, 0.16, 0.52), '#a8b8c6', 0, 0.2, 0, 0, 0.25, 0)],
  prego: () => [-0.4, 0, 0.4].flatMap((x, k) => [malha(new THREE.CylinderGeometry(0.06, 0.02, 1.5, 5), '#6e7c88', x, 0, k * 0.08, 0, 0, -0.35 + k * 0.12), malha(new THREE.CylinderGeometry(0.18, 0.18, 0.08, 6), '#9aa8b4', x - 0.22 + k * 0.08, 0.7, k * 0.08, 0, 0, -0.35 + k * 0.12)]),
  peleOnca: () => [malha(new THREE.BoxGeometry(1.85, 0.08, 1.35), '#d99a3a'), ...[[-0.5, -0.3], [0, -0.2], [0.5, -0.35], [-0.35, 0.25], [0.25, 0.3], [0.6, 0.1]].map(([x, z]) => malha(new THREE.CylinderGeometry(0.15, 0.15, 0.1, 7), '#2b1d0e', x, 0.03, z))],
  garraOnca: () => [-0.35, 0.35].map((x) => malha(new THREE.ConeGeometry(0.22, 1.35, 6), '#f2e8d0', x, 0, 0, 0, 0, x * -0.9)),
  moldeCoroa: () => [malha(new THREE.CylinderGeometry(0.9, 0.95, 0.35, 12), '#9a6a3a'), ...[0, 1, 2, 3, 4].map((k) => malha(new THREE.ConeGeometry(0.16, 0.45, 4), '#7a4a2a', Math.cos(k * 1.256) * 0.62, 0.35, Math.sin(k * 1.256) * 0.62))],
  coroaRei: () => [malha(new THREE.CylinderGeometry(0.75, 0.8, 0.45, 12, 1, true), '#d9b23c'), ...[0, 1, 2, 3, 4, 5].map((k) => malha(new THREE.ConeGeometry(0.15, 0.55, 4), k % 2 ? '#2e6b3e' : '#d9b23c', Math.cos(k * 1.047) * 0.74, 0.45, Math.sin(k * 1.047) * 0.74))],
  escamaRei: () => [malha(new THREE.OctahedronGeometry(0.95, 0).scale(1.1, 0.35, 1.35), '#2e6b3e'), malha(new THREE.OctahedronGeometry(0.55, 0).scale(1.1, 0.4, 1.2), '#d9b23c', 0, 0.16, 0)],
  elmoFerro: () => [malha(new THREE.SphereGeometry(0.88, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.56), '#7e8e9c', 0, -0.05, 0), malha(new THREE.BoxGeometry(0.18, 0.55, 1.55), '#a8b8c6', 0, 0.55, 0), malha(new THREE.BoxGeometry(0.16, 0.65, 0.16), '#5a6874', 0, -0.2, 0.85)],
});
// elmo de onça: o desenho do elmo de ferro, em couro dourado com rosetas
FEITOS.elmoOnca = () => FEITOS.elmoFerro().map((m) => { m.material = lam('#d99a3a'); return m; }).concat([[-0.4, 0.35, 0.6], [0.3, 0.5, 0.65], [0, 0.65, 0.55], [0.5, 0.2, 0.6], [-0.2, 0.15, 0.78]].map(([x, y, z]) => malha(new THREE.SphereGeometry(0.11, 6, 4), '#2b1d0e', x, y, z)));
// itens que reaproveitam o ícone de outro, só com outra cor (sem modelar nada novo)
const TINGIR = {
  carneSeca: ['carne', '#8a4a2a'], peixeSeco: ['peixe', '#b08a5a'], podre: ['carne', '#7f8a3e'], pacoca: ['carne', '#c9a06a'], garrafada: ['cantil', '#6fae46'],
  machadoFerro: ['machadoPresa', '#8aa2b8'], picaretaFerro: ['picaretaPresa', '#8aa2b8'], paFerro: ['paTatu', '#8aa2b8'], marteloFerro: ['marteloOsso', '#8aa2b8'],
  virote: ['flecha', '#8aa2b8'], peitoralFerro: ['gibao', '#7c8b99'], mantoOnca: ['gibao', '#d89b3c'], colarOnca: ['colarDentes', '#e6a93c'],
};
const casco = new Map();
function contorno(g) {
  if (!casco.has(g)) { let h = g.clone(); for (const n of Object.keys(h.attributes)) if (n !== 'position') h.deleteAttribute(n); h = mergeVertices(h); h.computeVertexNormals(); casco.set(g, h); }
  return casco.get(g);
}
const matContorno = new THREE.ShaderMaterial({
  uniforms: { uEsp: { value: 0.045 } }, side: THREE.BackSide,
  vertexShader: `uniform float uEsp; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vec3 n = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * vec4(w.xyz + n * uEsp, 1.0); }`,
  fragmentShader: `void main() { gl_FragColor = vec4(0.169, 0.114, 0.055, 1.0); }`,
});

// gera os ícones de todos os itens: devolve { id: dataURL }
export async function criarIcones(tam = 96) {
  const leitor = new GLTFLoader(), prontos = {};
  await Promise.all(Object.entries(MODELOS).map(async ([id, url]) => { try { prontos[id] = (await leitor.loadAsync(url)).scene; } catch (e) { console.warn('ícone sem modelo:', id, e); } }));
  const tela = document.createElement('canvas'); tela.width = tela.height = tam * 2;
  const r = new THREE.WebGLRenderer({ canvas: tela, alpha: true, antialias: true, preserveDrawingBuffer: true }); r.setPixelRatio(1); r.setClearColor(0, 0);
  const cena = new THREE.Scene();
  const sol = new THREE.DirectionalLight('#fff4dd', 2.4); sol.position.set(-2, 4, 3); cena.add(sol);
  cena.add(new THREE.HemisphereLight('#e8f6ff', '#8a7f5a', 1.7));
  const cam = new THREE.PerspectiveCamera(28, 1, 0.1, 50); cam.position.set(0, 2.2, 4.6); cam.lookAt(0, 0, 0);
  const saida = document.createElement('canvas'); saida.width = saida.height = tam; const sctx = saida.getContext('2d');
  const icones = {};
  for (const id of Object.keys(ITENS)) {
    const grupo = new THREE.Group();
    const tinge = TINGIR[id]; if (tinge && !prontos[id] && !FEITOS[id]) { const [base, cor] = tinge; if (prontos[base]) { const m = prontos[base].clone(true); m.traverse((o) => { if (o.isMesh) o.material = new THREE.MeshLambertMaterial({ map: o.material.map || null, color: cor, flatShading: true }); }); grupo.add(m); } else if (FEITOS[base]) for (const p of FEITOS[base]()) { p.material = p.material.clone(); p.material.color.set(cor); grupo.add(p); } }
    else if (prontos[id]) {
      const m = prontos[id].clone(true);
      m.traverse((o) => { if (o.isMesh) o.material = new THREE.MeshLambertMaterial({ map: o.material.map || null, color: o.material.color || 0xffffff, flatShading: true }); });
      grupo.add(m);
    } else if (FEITOS[id]) for (const p of FEITOS[id]()) grupo.add(p);
    else continue;
    grupo.rotation.y = 0.55;
    // enquadra: centraliza e escala para caber
    const caixa = new THREE.Box3().setFromObject(grupo), tamanho = caixa.getSize(new THREE.Vector3()), centro = caixa.getCenter(new THREE.Vector3());
    const s = 1.9 / Math.max(tamanho.x, tamanho.y, tamanho.z);
    const enq = new THREE.Group(); enq.add(grupo); grupo.position.sub(centro); enq.scale.setScalar(s); cena.add(enq);
    enq.updateMatrixWorld(true);
    const malhas = []; enq.traverse((o) => { if (o.isMesh) malhas.push(o); });
    for (const o of malhas) o.add(new THREE.Mesh(contorno(o.geometry), matContorno));
    matContorno.uniforms.uEsp.value = 0.05;
    r.render(cena, cam);
    sctx.clearRect(0, 0, tam, tam); sctx.drawImage(tela, 0, 0, tam, tam);
    icones[id] = saida.toDataURL('image/png');
    cena.remove(enq);
  }
  r.dispose();
  return icones;
}

// PREÇO NA FEIRA (patacos por unidade): recurso vale pouco, comida feita vale mais, ferramentas, armas e vestes valem bem mais.
// Comida estragada e construções não se vendem.
export function precoDe(id) {
  const it = ITENS[id]; if (!it || it.construcao || id === 'podre') return 0;
  const base = { 1: 1, 2: 4, 3: 12 }[it.nivel] || 1;
  if (COZINHA.some((c) => c.vira === id)) return base * 4;
  if (/Comida|Remédio/.test(it.tipo)) return base * (ESTRAGA[id] === undefined && it.estraga === 0 ? 5 : 2);
  if (/Arma|Veste|Ferramenta/.test(it.tipo)) return base * 6;
  return base;
}
