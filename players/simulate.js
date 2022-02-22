const seedrandom = require('seedrandom');

const Deck = require('../utils/Deck');

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

const simSeed = 'seed5';

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

const modulesTime = [
  new ABMMT(simSeed, 1, Evaluate.setK(0.4), true, 3),
  new ABMMT2(simSeed, 1, Evaluate.setK(0.4), true, 3),
  new ABMMT3(simSeed, 1, Evaluate.setK(0.4), true, 3),
];
const namesTime = ['ABMMT', 'ABMMT2', 'ABMMT3'];
const cm4 = confusionMatrix(modulesTime, simSeed, 100);
printConfusionMatrix(cm4, namesTime, 3);


// create confusion matrix with each algorithm against each other
function confusionMatrix(algorithms, seed, runs = 100) {
  const results = [];
  let start = process.hrtime();
  for (let i = 0; i < algorithms.length; i++) {
    const row = [];
    for (let j = 0; j < algorithms.length; j++) {
      const result = runSimulation(algorithms[i], algorithms[j], seed, runs);
      row.push(result);
      start = elapsed_time(start,
        `${algorithms[i].name} - ${algorithms[j].name}(${((i * algorithms.length)
        + (j + 1)) * runs}/${algorithms.length * algorithms.length * runs})`,
      );
    }
    results.push(row);
  }
  return results;
}

// print confusion matrix
function printConfusionMatrix(matrix3, n, precision = 3) {
  const winsPercMatrix = matrix3.map(row => row.map(cell => cell.winsPerc));
  const turnsAvgMatrix = matrix3.map(row => row.map(cell => cell.turnsAvg));
  const repeatsMatrix = matrix3.map(row => row.map(cell => cell.repeats));

  const matrixesWithNames = [
    { matrix:winsPercMatrix, name: 'winsPerc' },
    { matrix:turnsAvgMatrix, name: 'turnsAvg' },
    { matrix:repeatsMatrix, name: 'repeats ' },
  ];
  const max_length = Math.max(
    ...matrixesWithNames.map(m => findLongestName(m.matrix, n, precision)),
  );

  for (matrixWithName of matrixesWithNames) {
    const matrix = matrixWithName.matrix;
    console.log(`${matrixWithName.name} matrix:`);
    // print header
    const header = n.map(name => name.padEnd(max_length + 1));
    const headerString = ''.padEnd(max_length + 1) + header.join(' ');
    console.log(headerString);
    // print rows
    for (let j = 0; j < matrix.length; j++) {
      const row = matrix[j];
      const rowString = row.map(
        value => {
          const string = value.toFixed(precision).toString();
          return string.padEnd(max_length + 1);
        },
      );
      console.log(n[j].padEnd(max_length + 1) + rowString.join(' '));
    }
    console.log('\n');
  }
}

function findLongestName(matrix, n, precision) {
  let longest = n.reduce(
    (l, name) => name.length > l ? name.length : l, 0,
  );
  for (row of matrix) {
    for (value of row) {
      const string = value.toFixed(precision).toString();
      if (string.length > longest) {
        longest = string.length;
      }
    }
  }
  return longest;
}

function simGame(P1, P2, seed) {
  let gamestate = new GameState(
    seed,
    Deck.shuffleCardsSeeded(Deck.createDeck(), seed),
    0,
  );
  let last = null;
  let turn = 0;
  let repeat = 0;
  let c1 = 0;
  let c2 = 0;
  while (!gamestate.isFinal()) {
    last = gamestate.eval();
    let action = null;
    let c = null;
    if (gamestate.turn == 0) {
      const result = P1.chooseAction(gamestate);
      if (Array.isArray(result)) {
        [action, c] = result;
        c1 += c;
      }
      else {
        action = result;
      }
    }
    else {
      const result = P2.chooseAction(gamestate);
      if (Array.isArray(result)) {
        [action, c] = result;
        c2 += c;
      }
      else {
        action = result;
      }
    }
    // console.log(gamestate.hands[0].length + ' ' + gamestate.hands[1].length);
    gamestate = gamestate.nextState(action);
    // console.log(gamestate.turn);
    turn++;
    if (gamestate.eval() === last) repeat++;
    if (repeat > 100) {
      // console.log('repeat');
      break;
    }
    // console.log(turn);
  }
  return {
    gamestate:gamestate,
    eval: gamestate.eval(),
    length: turn,
    counterP1: c1,
    counterP2: c2,
    repeat: repeat === 100,
  };
}

function runSimulation(P1, P2, seed, numGames, printResults = false) {
  const rng = seedrandom(seed);
  let wins = 0;
  let totalTurns = 0;
  let repeats = 0;
  let counterP1 = 0;
  let counterP2 = 0;
  // console.time('simulation');
  for (let i = 0; i < numGames; i++) {
    const result = simGame(P1, P2, rng());
    if (result.gamestate.winner() === 0) {
      wins++;
    }
    if (result.repeat) {
      repeats++;
    }
    totalTurns += result.length;
    counterP1 += result.counterP1;
    counterP2 += result.counterP2;
    if (printResults) {
      console.log(`Game ${i} result: ${result.eval}, turns: ${result.length}, repeat: ${result.repeat}`);
    }
  }
  // console.log('wins/numGames: ' + wins / numGames + ', avg game length: ' + totalTurns / numGames + ' turns' + ', repeats: ' + repeats);
  // console.timeEnd('simulation');
  return ({
    winsPerc: wins / numGames,
    turnsAvg: totalTurns / numGames,
    repeats: repeats,
    counterP1: counterP1,
    counterP2: counterP2,
  });
}

function elapsed_time(start, note) {
  const elapsed = process.hrtime(start);
  const minutes =
    Math.floor(elapsed[0] / 60).toLocaleString('en-US', { minimumIntegerDigits: 2 });
  const seconds =
    (elapsed[0] % 60).toLocaleString('en-US', { minimumIntegerDigits: 2 });
  const milliseconds =
    (elapsed[1] / 1000000).toLocaleString('en-US', { minimumIntegerDigits: 3 });
  console.log(`${note} - ${minutes}:${seconds}.${Math.floor(milliseconds)}`);
  return start;
}