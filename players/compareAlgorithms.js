const simLib = require('./simLib');

const Random = require('./algorithms/Random');
const RandomPlay = require('./algorithms/RandomPlay');
const Greedy3 = require('./algorithms/Greedy3');
const GreedyMiniMax2 = require('./algorithms/GreedyMiniMax2');
const ABMM = require('./algorithms/ABMM');
const ABMMT = require('./algorithms/ABMMT');
const ABMMT2 = require('./algorithms/ABMMT2');
const ABMMT3 = require('./algorithms/ABMMT3');

const Evaluate = require('./gamestate/evaluate');

// Simulations for the paper
const simSeed = 'AAAAA';
const nGames = 100;
const depth = 4;
const printResults = false;
const evalFunc = Evaluate.setK(0.2);
const randomness = true;
const min_depth = 0;
const maxTime = 20;

const random = new Random(simSeed);
const randomP = new RandomPlay(simSeed);
const greedy3 = new Greedy3(simSeed, evalFunc);
const greedyMinimax = new GreedyMiniMax2(simSeed, depth, evalFunc, randomness);
const abmm = new ABMM(simSeed, depth, evalFunc, randomness);
const abmmt = new ABMMT(simSeed, min_depth, evalFunc, randomness, maxTime);
const abmmt2 = new ABMMT2(simSeed, min_depth, evalFunc, randomness, maxTime);
const abmmt3 = new ABMMT3(simSeed, min_depth, evalFunc, randomness, maxTime);

/* console.log('Random');
runSimPrintRes(random, random); */

/* console.log('\n\nRandomPlay');
runSimPrintRes(randomP, random);
runSimPrintRes(randomP, randomP); */

/* console.log('\n\nGreedy');
runSimPrintRes(random, greedy3);
runSimPrintRes(randomP, greedy3);
runSimPrintRes(greedy3, greedy3); */

/* console.log('\n\nGreedyMinimax');
runSimPrintRes(random, greedyMinimax);
runSimPrintRes(randomP, greedyMinimax);
runSimPrintRes(greedy3, greedyMinimax);
runSimPrintRes(greedyMinimax, greedyMinimax); */

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

// console.log('\n\nAnalisi durata turni');
// runSimPrintTurnTimes(greedyMinimax,greedyMinimax);
// runSimPrintTurnTimes(abmm,abmm);
// runSimPrintTurnTimes(abmmt,abmmt);
runSimPrintTurnTimes(abmmt2,abmmt2);
//runSimPrintTurnTimes(abmmt3,abmmt3);


function runSimPrintRes(alg1, alg2) {
  const start = process.hrtime();
  const sim = simLib.runSimulation(alg1, alg2, simSeed, nGames, printResults);
  if (sim.counterP1 == 0 && sim.counterP2 == 0) {
    simLib.elapsed_time(start, `${alg1.name} vs ${alg2.name}: (${sim.winsPerc * 100} - ${(1 - sim.winsPerc) * 100}) (draws: ${sim.drawsPercent}) - ${sim.turnsAvg}`);
  }
  else {
    simLib.elapsed_time(start, `${alg1.name} vs ${alg2.name}: (${sim.winsPerc * 100} - ${(1 - sim.winsPerc) * 100}) (draws: ${sim.drawsPercent}) - ${sim.turnsAvg} - ${sim.counterP1 / nGames} - ${sim.counterP2 / nGames}`);
  }
}

function runSimPrintTurnTimes(alg1,alg2) {
  const sim = simLib.runSimulation(alg1, alg2, simSeed, nGames, printResults);
  const data = {
    depths: sim.depths,
    turnTimes: sim.turnTimes,
  };
  console.log(JSON.stringify(data));
}

