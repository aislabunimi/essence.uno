const simLib = require('./simLib');

const Random = require('./algorithms/Random');
const RandomPlay = require('./algorithms/RandomPlay');
const Greedy3 = require('./algorithms/Greedy3');
const ABMM = require('./algorithms/ABMM');
const GreedyMiniMax2 = require('./algorithms/GreedyMiniMax2');
const Evaluate = require('./gamestate/evaluate');

// Simulations for the paper
const simSeed = 'AAAAA';
const nGames = 100;
const depth = 3;
const printResults = false;
const evalFunc = Evaluate.setK(0.2);
const randomness = false;

const random = new Random(simSeed);
const randomP = new RandomPlay(simSeed);
const greedy3 = new Greedy3(simSeed, evalFunc);
const greedyMinimax = new GreedyMiniMax2(simSeed, depth, evalFunc, randomness);
const abmm = new ABMM(simSeed, depth, evalFunc, randomness);

/* console.log('Random');
runSimPrintRes(random, random); */

/* console.log('\n\nRandomPlay');
runSimPrintRes(randomP, random);
runSimPrintRes(randomP, randomP); */

/* console.log('\n\nGreedy');
runSimPrintRes(random, greedy3);
runSimPrintRes(randomP, greedy3);
runSimPrintRes(greedy3, greedy3); */

// console.log('\n\nGreedyMinimax');
// runSimPrintRes(random, greedyMinimax);
// runSimPrintRes(randomP, greedyMinimax);
// runSimPrintRes(greedy3, greedyMinimax);
runSimPrintRes(greedyMinimax, greedyMinimax);

/* console.log('\n\nABMM');
runSimPrintRes(random, abmm);
runSimPrintRes(randomP, abmm);
runSimPrintRes(greedy3, abmm);
runSimPrintRes(greedyMinimax, greedyMinimax);
runSimPrintRes(abmm, abmm); */

/* console.log('\n\n Correttezza ABMM');
// this needs randomness = false
runSimPrintRes(greedyMinimax, greedyMinimax);
runSimPrintRes(greedyMinimax, abmm);
runSimPrintRes(abmm, greedyMinimax);
runSimPrintRes(abmm, abmm); */


function runSimPrintRes(alg1, alg2) {
  const start = process.hrtime();
  const sim = simLib.runSimulation(alg1, alg2, simSeed, nGames, printResults);
  /* if (sim.counterP1 == 0 && sim.counterP2 == 0) {
    simLib.elapsed_time(start, `${alg1.name} vs ${alg2.name}: (${sim.winsPerc * 100} - ${(1 - sim.winsPerc) * 100}) (draws: ${sim.drawsPercent}) - ${sim.turnsAvg}`);
  }
  else {
    simLib.elapsed_time(start, `${alg1.name} vs ${alg2.name}: (${sim.winsPerc * 100} - ${(1 - sim.winsPerc) * 100}) (draws: ${sim.drawsPercent}) - ${sim.turnsAvg} - ${sim.counterP1 / nGames} - ${sim.counterP2 / nGames}`);
  } */
  console.log(JSON.stringify(sim.turnTimes));
}

