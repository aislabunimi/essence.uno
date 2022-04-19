const seedrandom = require('seedrandom');

const Deck = require('../utils/Deck');

const Random = require('./algorithms/Random');
const RandomPlay = require('./algorithms/RandomPlay');
const ABMM = require('./algorithms/ABMM');
const ABMMT = require('./algorithms/ABMMT');

const GameState = require('./gamestate/gameState');
const Evaluate = require('./gamestate/evaluate');

const simSeed = 'AAAAA';
const nGames = 1_000;

// estimating number of possible actions with random agebnts
/* const sim1 = runSimulation(new Random(simSeed), new Random(simSeed), simSeed, nGames);
// console.log(`Turn: ${sim1.totalTurns}`);
// console.log(`Possibilities average: ${sim1.possibilities.reduce((a, b) => a + b) / sim1.possibilities.length}`);
console.log(JSON.stringify(sim1.possibilities));
console.log(JSON.stringify(sim1.turns)); */

// estimating number of possible actions with randomPlay agents
/* const sim2 = runSimulation(new RandomPlay(simSeed), new RandomPlay(simSeed), simSeed, nGames);
// console.log(`Turn: ${sim2.totalTurns}`);
// console.log(`Possibilities average: ${sim2.possibilities.reduce((a, b) => a + b) / sim2.possibilities.length}`);
console.log(JSON.stringify(sim2.possibilities));
console.log(JSON.stringify(sim2.turns)); */

// estimating number of possible actions with  agents
const A1 = new ABMMT(simSeed, 1, Evaluate.setK(0.3), true, 5);
const A2 = new ABMMT(simSeed, 1, Evaluate.setK(0.3), true, 5);
const sim3 = runSimulation(A1, A2, simSeed, nGames);
//console.log(`Turn: ${sim3.totalTurns}`);
//console.log(`Possibilities average: ${sim3.possibilities.reduce((a, b) => a + b) / sim3.possibilities.length}`);
console.log(JSON.stringify(sim3.possibilities));
console.log(JSON.stringify(sim3.turns));


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
  const possibilities = [];
  while (!gamestate.isFinal()) {
    last = gamestate.eval();
    let action = null;
    let c = null;
    // removing duplicates, I want to count only unique actions
    const unique_actions = uniqBy(gamestate.getAvailableActions(), JSON.stringify);
    possibilities.push(unique_actions.length);
    /* if (unique_actions.length >= 24) {
      console.log(JSON.stringify(unique_actions));
      console.log(gamestate.discarded[gamestate.discarded.length - 1]);
    } */
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
    repeat: repeat >= 100,
    possibilities: possibilities,
  };
}

function runSimulation(P1, P2, seed, numGames, printResults = false) {
  const rng = seedrandom(seed);
  let wins = 0;
  let totalTurns = 0;
  let repeats = 0;
  let counterP1 = 0;
  let counterP2 = 0;
  let possibilities = [];
  const turns = [];
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
    possibilities = possibilities.concat(result.possibilities);
    turns.push(result.length);
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
    totalTurns: totalTurns,
    possibilities: possibilities,
    turns: turns,
  });
}

function uniqBy(a, key) {
  const seen = {};
  return a.filter(function(item) {
    const k = key(item);
    // return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    return Object.prototype.hasOwnProperty.call(seen, k) ? false : (seen[k] = true);
  });
}