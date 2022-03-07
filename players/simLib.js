const seedrandom = require('seedrandom');

const Deck = require('../utils/Deck');
const GameState = require('./gamestate/gameState');

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
  let turn = 0;
  let draw = false;
  let c1 = 0;
  let c2 = 0;
  let turnsTimes = [];
  while (!gamestate.isFinal()) {
    let action = null;
    let c = null;
    let turnStart = process.hrtime.bigint();
    if (gamestate.turn == 0) {
      const result = P1.chooseAction(gamestate);
      if (Array.isArray(result)) {
        [action, c] = result;
        c1 += c;
      }
      else {
        action = result;
      }
      // console.log('a1 ' + JSON.stringify(action));
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
      // console.log('a2 ' + JSON.stringify(action));
    }
    turnsTimes.push(Number((process.hrtime.bigint() - turnStart) / BigInt(1000000)));
    // console.log(gamestate.hands[0].length + gamestate.hands[1].length);
    // console.log(gamestate.discarded.length);
    // console.log(gamestate.deck.length);
    gamestate = gamestate.nextState(action);
    // console.log(gamestate.turn);
    // console.log(gamestate.hands[0].length + gamestate.hands[1].length);
    // console.log(gamestate.discarded.length);
    // console.log(gamestate.deck.length);

    turn++;
    if (gamestate.hands[0].length + gamestate.hands[1].length >= 106) {
      draw = true;
      break;
    }
    /* const topDiscard = gamestate.discarded[gamestate.discarded.length - 1];
    if (topDiscard.type == 'Reverse' || topDiscard.type == 'Skip') {
      for (const card of gamestate.deck) {
        if (card.type == topDiscard.type) {
          draw = true;
        }
        else {
          draw = false;
          break;
        }
      }
    }
    if (draw) {
      break;
    } */
    // console.log(turn);
  }
  return {
    gamestate:gamestate,
    eval: gamestate.eval(),
    length: turn,
    counterP1: c1,
    counterP2: c2,
    draw: draw,
    turnsTimes: turnsTimes,
  };
}

function runSimulation(P1, P2, seed, numGames, printResults = false) {
  const rng = seedrandom(seed);
  let wins = 0;
  let totalTurns = 0;
  let draws = 0;
  let counterP1 = 0;
  let counterP2 = 0;
  const turns = [];
  const turnTimes = [];
  for (let i = 0; i < numGames; i++) {
    const result = simGame(P1, P2, rng());
    if (result.gamestate.winner() === 0) {
      wins++;
    }
    if (result.draw) {
      draws++;
    }
    totalTurns += result.length;
    counterP1 += result.counterP1;
    counterP2 += result.counterP2;
    turns.push(result.length);
    turnTimes.push(result.turnsTimes);
    if (printResults) {
      let message = '';
      if (result.draw) {
        message = `Game ${i} result: DRAW, turns: ${result.length}`;
      }
      else {
        message = `Game ${i} result: ${result.eval}, turns: ${result.length}`;
      }
      const message1 = `win: ${wins}, lost: ${i - wins - draws}, draw: ${draws}, avg turns: ${(totalTurns / i).toFixed(3).toString()} - `;
      process.stdout.cursorTo(0);
      process.stdout.clearLine(0);
      process.stdout.write(message1 + message);
    }
  }
  if (printResults) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
  }
  // console.log('wins/numGames: ' + wins / numGames + ', avg game length: ' + totalTurns / numGames + ' turns' + ', repeats: ' + repeats);
  // console.timeEnd('simulation');
  return ({
    winsPerc: wins / (numGames - draws),
    drawsPercent: draws / numGames,
    turnsAvg: totalTurns / numGames,
    draws: draws,
    counterP1: counterP1,
    counterP2: counterP2,
    turns: turns,
    turnTimes: turnTimes,
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

module.exports = {
  runSimulation,
  printConfusionMatrix,
  confusionMatrix,
  findLongestName,
  simGame,
  elapsed_time,
};
