const simLib = require('./simLib');

const ABMM = require('./algorithms/ABMM');
const Random = require('./algorithms/Random');
const RandomPlay = require('./algorithms/RandomPlay');
const Evaluate = require('./gamestate/evaluate');

// Simulations for the paper
const simSeed = 'AAAAA';
const nGames = 100;
const depth = 3;
const printResults = false;

const random = new Random(simSeed);
const randomP = new RandomPlay(simSeed);
const alpha0 = new ABMM(simSeed, depth, Evaluate.setAlpha(0), true);
const alpha05 = new ABMM(simSeed, depth, Evaluate.setAlpha(0.5), true);
const alpha075 = new ABMM(simSeed, depth, Evaluate.setAlpha(0.75), true);
const alpha1 = new ABMM(simSeed, depth, Evaluate.setAlpha(1), true);


let sim = simLib.runSimulation(new RandomPlay(simSeed), new RandomPlay(simSeed), simSeed, nGames);
console.log(`RandomPlay vs RandomPlay: (${sim.winsPerc * 100} - ${(1 - sim.winsPerc) * 100}) - ${sim.turnsAvg}`);
// // alpha05 vs alpha05
// sim = simLib.runSimulation(alpha05, alpha05, simSeed, nGames, true);
// console.log(`alpha05 vs alpha05: (${sim.winsPerc * 100} - ${(1 - sim.winsPerc) * 100}) - ${sim.turnsAvg}`);
// // alpha05 vs RandomPlay
// sim = simLib.runSimulation(alpha05, randomP, simSeed, nGames, printResults);
// console.log(`alpha05 vs randomPlay: (${sim.winsPerc * 100} - ${(1 - sim.winsPerc) * 100}) - ${sim.turnsAvg}`);
// // alpha05 vs Random
// sim = simLib.runSimulation(alpha05, random, simSeed, nGames, printResults);
// console.log(`alpha05 vs Random: (${sim.winsPerc * 100} - ${(1 - sim.winsPerc) * 100}) - ${sim.turnsAvg}`);
// // alpha05 vs alpha0
// sim = simLib.runSimulation(alpha05, alpha0, simSeed, nGames, printResults);
// console.log(`alpha05 vs alpha0: (${sim.winsPerc * 100} - ${(1 - sim.winsPerc) * 100}) - ${sim.turnsAvg}`);

// const alphaval = [0.3, 0.35, 0.4, 0.45];
// for (let i = 0; i < alphaval.length; i++) {
//   const alpha = new ABMM(simSeed, depth, Evaluate.setAlpha(alphaval[i]), true);
//   sim = simLib.runSimulation(randomP, alpha, simSeed, nGames, printResults);
//   console.log(`RandomP vs alpha${alphaval[i]}: (${sim.winsPerc * 100} - ${(1 - sim.winsPerc) * 100}) - ${sim.turnsAvg}`);
//   console.log(JSON.stringify(sim.turns));
// }

const kval = [16];
for (let i = 0; i < kval.length; i++) {
  const alpha = new ABMM(simSeed, depth, Evaluate.setK(kval[i]), true);
  sim = simLib.runSimulation(randomP, alpha, simSeed, nGames, printResults);
  console.log(`randomP vs k${kval[i]}: (${sim.winsPerc * 100} - ${(1 - sim.winsPerc) * 100}) - ${sim.turnsAvg}`);
  console.log(JSON.stringify(sim.turns));
}