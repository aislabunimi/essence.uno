const seedrandom = require('seedrandom');

const Deck = require('../utils/Deck');

const simLib = require('./simLib');

const Random = require('./algorithms/Random');
const RandomPlay = require('./algorithms/RandomPlay');
const Greedy = require('./algorithms/Greedy');
const Greedy2 = require('./algorithms/Greedy2');
const GreedyMiniMax = require('./algorithms/GreedyMiniMax');
const GreedyMiniMax2 = require('./algorithms/GreedyMiniMax2');
const MM = require('./algorithms/MM');
const ABMM = require('./algorithms/ABMM');
const ABMMT = require('./algorithms/ABMMT');
const ABMMT2 = require('./algorithms/ABMMT2');
const ABMMT3 = require('./algorithms/ABMMT3');

const GameState = require('./gamestate/gameState');
const Evaluate = require('./gamestate/evaluate');

const alpha05 = Evaluate.setAlpha(0.5);
const alpha075 = Evaluate.setAlpha(0.75);
const alpha1 = Evaluate.setAlpha(1);

/* const modulesNormal = [
  new Random(simSeed),
  new RandomPlay(simSeed),
  new Greedy2(simSeed),
  new GreedyMiniMax2(simSeed, 2, alpha05, true),
];
const cm1 = confusionMatrix(modulesNormal, simSeed, 100);
printConfusionMatrix(cm1, modulesNormal.map(m => m.name), 3); */

/* const modulesNormal2 = [
  new Random(simSeed),
  new GreedyMiniMax2(simSeed, 2, alpha075, true),
  new GreedyMiniMax2(simSeed, 2, Evaluate.evalAdaptive, true),
];
const cm2 = confusionMatrix(modulesNormal2, simSeed, 100);
printConfusionMatrix(cm2, modulesNormal2.map(m => m.name), 3); */
/* const GMM2 = new GreedyMiniMax2(simSeed, 3, alpha075, false);
const R = new Random(simSeed);
const RPlay = new RandomPlay(simSeed);
const MiniMax = new MM(simSeed, 3, alpha075, false);
const AlphaBeta = new ABMM(simSeed, 3, alpha075, false);

const start1 = process.hrtime();
const res1 = runSimulation(GMM2, MiniMax, simSeed, 100);
elapsed_time(start1, `${res1.winsPerc} - ${res1.turnsAvg} - ${res1.counterP1} - ${res1.counterP2}`);

const start2 = process.hrtime();
const res2 = runSimulation(AlphaBeta, AlphaBeta, simSeed, 100);
elapsed_time(start2, `${res2.winsPerc} - ${res2.turnsAvg} - ${res2.counterP1} - ${res2.counterP2}`);

const start = process.hrtime();
const res = runSimulation(MiniMax, AlphaBeta, simSeed, 100);
elapsed_time(start, `${res.winsPerc} - ${res.turnsAvg} - ${res.counterP1} - ${res.counterP2}`); */

/* const ks = [0.0, 0.05, 0.1, 0.15, 0.2, 0.25,
  0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65,
  0.7, 0.75, 0.80, 0.85, 0.9, 0.95, 1, 1.05,
  1.1, 1.15, 1.2, 1.25, 1.3, 1.35, 1.4, 1.45, 1.5,
];
const depth = 3;
for (const k of ks) {
  const P1 = new ABMM(simSeed, depth, alpha075);
  const P2 = new ABMM(simSeed, depth, Evaluate.setK(k));
  const start = process.hrtime();
  const res = runSimulation(P1, P2, simSeed, 100);
  elapsed_time(start, `${k.toFixed(2)} -> win%:${res.winsPerc.toFixed(2)} turnAvg:${res.turnsAvg.toFixed(2)}`);
} */

/* const modules = [
  new GreedyMiniMax(simSeed, 2),
  new GreedyMiniMax2(simSeed, 2),
];
const cm2 = confusionMatrix(modules, simSeed, 100);
printConfusionMatrix(cm2, modules.map(m => m.name), 3); */

/* const modulesAlpha = [
  new GreedyMiniMax2(simSeed, 2, alpha1),
  new GreedyMiniMax2(simSeed, 2, alpha05),
  new GreedyMiniMax2(simSeed, 2, alpha075),
];
const names = ['Alpha1', 'Alpha05', 'Alpha075'];
const cm3 = confusionMatrix(modulesAlpha, simSeed, 100);
printConfusionMatrix(cm3, names, 3);

const modulesAlphaNoRandom = [
  new GreedyMiniMax2(simSeed, 2, alpha1, false),
  new GreedyMiniMax2(simSeed, 2, alpha05, false),
  new GreedyMiniMax2(simSeed, 2, alpha075, false),
];
const names4 = ['Alpha1NR', 'Alpha05NR', 'Alpha075NR'];
const cm4 = confusionMatrix(modulesAlphaNoRandom, simSeed, 100);
printConfusionMatrix(cm4, names4, 3); */

/* const modulesTime = [
  new ABMMT(simSeed, 1, Evaluate.setK(0.4), true, 3),
  new ABMMT2(simSeed, 1, Evaluate.setK(0.4), true, 3),
  new ABMMT3(simSeed, 1, Evaluate.setK(0.4), true, 3),
];
const namesTime = ['ABMMT', 'ABMMT2', 'ABMMT3'];
const cm4 = confusionMatrix(modulesTime, simSeed, 100);
printConfusionMatrix(cm4, namesTime, 3); */

/* const FindEasierAndHarder = [
  new ABMM(simSeed, 3, Evaluate.setK(0), true),
  new ABMM(simSeed, 3, Evaluate.setK(0.2), true),
  new ABMM(simSeed, 3, Evaluate.setK(0.4), true),
  new ABMM(simSeed, 3, Evaluate.setK(0.5), true),
];
const namesTimeEAH = ['K00', 'K02', 'K04', 'K05'];
const cm5 = confusionMatrix(FindEasierAndHarder, simSeed, 50);
printConfusionMatrix(cm5, namesTimeEAH, 3); */

/* const FindEasierAndHarder = [
  new RandomPlay(simSeed),
  new ABMMT2(simSeed, 0, Evaluate.setK(0), true, 1),
  new ABMMT2(simSeed, 0, Evaluate.setK(0.2), true, 1),
  new ABMMT2(simSeed, 0, Evaluate.setK(0.3), true, 1),
  new ABMMT2(simSeed, 0, Evaluate.setK(0.4), true, 1),
];
const namesTimeEAH = ['RandomPlay', 'K00', 'K02', 'K03', 'K04', 'K05'];
const cm5 = confusionMatrix(FindEasierAndHarder, simSeed, 100);
printConfusionMatrix(cm5, namesTimeEAH, 3); */

// Simulations for the paper
const simSeed = 'AAAAA';
const nGames = 100;
// Random vs Random
let sim = simLib.runSimulation(new Random(simSeed), new Random(simSeed), simSeed, nGames);
console.log(`Random vs Random: ${sim.winsPerc} - ${sim.turnsAvg}`);
// RandomPlay vs RandomPlay
sim = simLib.runSimulation(new RandomPlay(simSeed), new RandomPlay(simSeed), simSeed, nGames);
console.log(`RandomPlay vs RandomPlay: (${sim.winsPerc * 100} - ${(1 - sim.winsPerc) * 100}) - ${sim.turnsAvg}`);
// Random vs RandomPlay
sim = simLib.runSimulation(new Random(simSeed), new RandomPlay(simSeed), simSeed, nGames);
console.log(`Random vs RandomPlay: (${sim.winsPerc * 100} - ${(1 - sim.winsPerc) * 100}) - ${sim.turnsAvg}`);
// RandomPlay vs Random
sim = simLib.runSimulation(new RandomPlay(simSeed), new Random(simSeed), simSeed, nGames);
console.log(`RandomPlay vs Random: (${sim.winsPerc * 100} - ${(1 - sim.winsPerc) * 100}) - ${sim.turnsAvg}`);
// Greedy2 vs Greedy2
sim = simLib.runSimulation(new Greedy2(simSeed, 2), new Greedy2(simSeed, 2), simSeed, nGames);
console.log(`Greedy2 vs Greedy2: (${sim.winsPerc * 100} - ${(1 - sim.winsPerc) * 100}) - ${sim.turnsAvg}`);
// Greedy2 vs Random
sim = simLib.runSimulation(new Greedy2(simSeed, 2), new Random(simSeed), simSeed, nGames);
console.log(`Greedy2 vs Random: (${sim.winsPerc * 100} - ${(1 - sim.winsPerc) * 100}) - ${sim.turnsAvg}`);
// RandomPlay vs Greedy2
sim = simLib.runSimulation(new RandomPlay(simSeed), new Greedy2(simSeed, 5), simSeed, nGames);
console.log(`RandomPlay vs Greedy2: (${sim.winsPerc * 100} - ${(1 - sim.winsPerc) * 100}) - ${sim.turnsAvg}`);
