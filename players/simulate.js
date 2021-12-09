const seedrandom = require('seedrandom');

const Deck = require('../utils/Deck');

const Random = require('./algorithms/Random');
const RandomPlay = require('./algorithms/RandomPlay');
const Greedy = require('./algorithms/Greedy');
const Greedy2 = require('./algorithms/Greedy2');
const GreedyMiniMax = require('./algorithms/GreedyMiniMax');
const GreedyMiniMax2 = require('./algorithms/GreedyMiniMax2');

const GameState = require('./gamestate/gameState');
const Evaluate = require('./gamestate/evaluate');

const alpha05 = Evaluate.setAlpha(0.5);
const alpha075 = Evaluate.setAlpha(0.75);
const alpha1 = Evaluate.setAlpha(1);

const simSeed = 'seed2';

const modulesNormal = [
  new Random(simSeed),
  new RandomPlay(simSeed),
  new Greedy(simSeed),
  new Greedy2(simSeed),
  new GreedyMiniMax2(simSeed, 2, alpha05, false),
];
const cm1 = confusionMatrix(modulesNormal, simSeed, 1000);
printConfusionMatrix(cm1, modulesNormal.map(m => m.name), 3);

const modules = [
  new GreedyMiniMax(simSeed, 2),
  new GreedyMiniMax2(simSeed, 2),
];
const cm2 = confusionMatrix(modules, simSeed, 100);
printConfusionMatrix(cm2, modules.map(m => m.name), 3);

const modulesAlpha = [
  new GreedyMiniMax2(simSeed, 2, alpha1),
  new GreedyMiniMax2(simSeed, 2, alpha05),
  new GreedyMiniMax2(simSeed, 2, alpha075),
];
const names = ['Alpha1', 'Alpha05', 'Alpha075'];
const cm3 = confusionMatrix(modulesAlpha, simSeed, 100);
printConfusionMatrix(cm3, names, 3);

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
  while (!gamestate.isFinal()) {
    last = gamestate.eval();
    let action = null;
    if (gamestate.turn == 0) {
      action = P1.chooseAction(gamestate);
    }
    else {
      action = P2.chooseAction(gamestate);
    }
    // console.log(gamestate.hands[0].length + ' ' + gamestate.hands[1].length);
    gamestate = gamestate.nextState(action);
    turn++;
    if (gamestate.eval() === last) repeat++;
    if (repeat > 100) {
      // console.log('repeat');
      break;
    }
  }
  return {
    gamestate:gamestate,
    eval: gamestate.eval(),
    length: turn,
    repeat: repeat === 100,
  };
}

function runSimulation(P1, P2, seed, numGames, printResults) {
  const rng = seedrandom(seed);
  let wins = 0;
  let totalTurns = 0;
  let repeats = 0;
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
  });
}

function elapsed_time(start, note) {
  const elapsed = process.hrtime(start);
  const minutes = Math.floor(elapsed[0] / 60);
  const seconds = elapsed[0] % 60;
  const milliseconds = elapsed[1] / 1000000;
  console.log(`${note} - ${minutes}:${seconds}.${Math.floor(milliseconds)}`);
  return start;
}