const seedrandom = require('seedrandom');

const Random = require('./random');
const RandomPlay = require('./randomPlay');
const Greedy = require('./greedy');
const GreedyMiniMax = require('./greedyMiniMax');
const Greedy2 = require('./greedy2');
const GreedyMiniMax2 = require('./greedyMiniMax2');

const Evaluate = require('./evaluate');

const GameState = require('./gameState');

function simGame(nextMoveP1, nextMoveP2, seed) {
  let gamestate = new GameState(seed, shuffleCardsSeeded(newDeck(), seed), 0);
  let last = null;
  let turn = 0;
  let repeat = 0;
  while (!gamestate.isFinal()) {
    last = gamestate.eval();
    const availableMoves = gamestate.availableActions();
    let action = null;
    if (gamestate.turn == 0) {
      action = nextMoveP1(gamestate, availableMoves);
    }
    else {
      action = nextMoveP2(gamestate, availableMoves);
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
  const nextMoveP1 = P1.chooseAction;
  const nextMoveP2 = P2.chooseAction;
  let wins = 0;
  let totalTurns = 0;
  let repeats = 0;
  // console.time('simulation');
  for (let i = 0; i < numGames; i++) {
    const result = simGame(nextMoveP1, nextMoveP2, rng());
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

const alpha05 = Evaluate.setAlpha(0.5);
const alpha075 = Evaluate.setAlpha(0.75);
const alpha1 = Evaluate.setAlpha(1);

const simSeed = 'seed2';

const modules = [
  GreedyMiniMax2.setDepthAndEvaluator(0, Evaluate.eval1),
  GreedyMiniMax2.setDepthAndEvaluator(2, alpha075),
  GreedyMiniMax2.setDepthAndEvaluator(2, alpha05),
];
const modules_names = [
  'Greedy', 'GMMA075', 'GMMA05asdasd', 'GMM1_2',
];
const cm = confusionMatrix(modules, modules_names, simSeed, 10);
printConfusionMatrix(cm, modules_names);

// create confusion matrix with each algorithm against each other
function confusionMatrix(algorithms, algorithmsNames, seed, runs = 100) {
  const results = [];
  let start = process.hrtime();
  for (let i = 0; i < algorithms.length; i++) {
    const row = [];
    for (let j = 0; j < algorithms.length; j++) {
      const result = runSimulation(algorithms[i], algorithms[j], seed, runs);
      row.push(result);
      start = elapsed_time(start, `${algorithmsNames[i]} - ${algorithmsNames[j]}(${((i * algorithms.length) + (j + 1)) * runs}/${algorithms.length * algorithms.length * runs})`);
    }
    results.push(row);
  }
  return results;
}
// print confusion matrix
function printConfusionMatrix(matrix, names) {
  // find longest name
  let maxNameLength = 0;
  for (let i = 0; i < names.length; i++) {
    if (names[i].length > maxNameLength) {
      maxNameLength = names[i].length;
    }
  }
  // find longest number 
  let maxNumberLength = 0;
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j].winsPerc.toFixed(3).toString().length > maxNumberLength) {
        maxNumberLength = matrix[i][j].turnsAvg.toString().length;
      }
    }
  }

  if (maxNumberLength > maxNameLength) {
    maxNameLength = maxNumberLength;
  }

  // print header
  console.log('WIN %: ');
  let header = ' '.repeat(maxNameLength + 2);
  for (let i = 0; i < names.length; i++) {
    header += names[i] + ' '.repeat(maxNameLength - names[i].length + 1);
  }
  console.log(header);
  // print matrix
  for (let i = 0; i < matrix.length; i++) {
    let row = names[i] + ' '.repeat(maxNameLength - names[i].length + 1);
    for (let j = 0; j < matrix[i].length; j++) {
      const number = matrix[i][j].winsPerc.toFixed(3);
      row += ' ' + number.toString() + ' '.repeat(maxNameLength - number.toString().length);
    }
    console.log(row);
  }

  console.log('\nTURNS AVG:');
  header = ' '.repeat(maxNameLength + 2);
  for (let i = 0; i < names.length; i++) {
    header += names[i] + ' '.repeat(maxNameLength - names[i].length + 1);
  }
  console.log(header);
  // print matrix
  for (let i = 0; i < matrix.length; i++) {
    let row = names[i] + ' '.repeat(maxNameLength - names[i].length + 1);
    for (let j = 0; j < matrix[i].length; j++) {
      const number = matrix[i][j].turnsAvg.toFixed(3);
      row += ' ' + number.toString() + ' '.repeat(maxNameLength - number.toString().length);
    }
    console.log(row);
  }

  /* for (let i = 0; i < matrix.length; i++) {
    let string = names[i] + '  | ';
    for (let j = 0; j < matrix[i].length; j++) {
      string += matrix[i][j].winsPerc.toFixed(4) + ' | ';
    }
    console.log(string);
  }

  console.log('Confusion matrix average turns:');
  console.log('          ' + names.join(' | '));
  for (let i = 0; i < matrix.length; i++) {
    let string = names[i] + '  | ';
    for (let j = 0; j < matrix[i].length; j++) {
      string += matrix[i][j].turnsAvg + ' | ';
    }
    console.log(string);
  } */
}


function elapsed_time(start, note) {
  const elapsed = process.hrtime(start);
  const minutes = Math.floor(elapsed[0] / 60);
  const seconds = elapsed[0] % 60;
  const milliseconds = elapsed[1] / 1000000;
  console.log(`${note} - ${minutes}:${seconds}.${Math.floor(milliseconds)}`);
  return start;
}

function newDeck() {
  const colors = ['Red', 'Yellow', 'Green', 'Blue'];
  const color_types = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Draw', 'Reverse', 'Skip'];
  const special_types = ['Wild', 'WildDraw'];
  const cards = [];
  for (const color of colors) {
    for (const type of color_types) {
    // In uno deck you have 2 copies of every number expect for 0
      const newCard = {
        name: `${color}_${type}`,
        color: color,
        type: type,
      };
      if (type !== '0') {
        cards.push(newCard);
      }
      cards.push(newCard);
    }
  }
  // add 4 of each special cards
  for (const type of special_types) {
    const newCard = {
      name: `Blank_${type}`,
      color: 'Blank',
      type: type,
    };
    for (let i = 0; i < 4; i++) {
      cards.push(newCard);
    }
  }
  return cards;
}

function shuffleCardsSeeded(array, seed) {
  const rng = seedrandom(seed);
  let m = array.length;
  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    const i = Math.floor(rng() * m--);
    // And swap it with the current element.
    const t = array[m];
    array[m] = array[i];
    array[i] = t;
    ++seed;
  }
  return array;
}