const seedrandom = require('seedrandom');

const Random = require('./random');
const RandomPlay = require('./randomPlay');
const Greedy = require('./greedy');
const GreedyMiniMax = require('./greedyMiniMax');

const GameState = require('./gameState');

function simGame(nextMoveP1, nextMoveP2, seed) {
  let gamestate = new GameState(seed, shuffleCardsSeeded(newDeck(), seed), 0);
  let last = null;
  // let turn = 0;
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
    // turn++;
    if (gamestate.eval() === last) repeat++;
    if (repeat > 100) {
      break;
    }
  }
  return gamestate.eval();
}

function runSimulation(P1, P2, seed, numGames, printResults) {
  const rng = seedrandom(seed);
  const nextMoveP1 = P1.chooseAction;
  const nextMoveP2 = P2.chooseAction;
  let wins = 0;
  for (let i = 0; i < numGames; i++) {
    const result = simGame(nextMoveP1, nextMoveP2, rng());
    if (result < 0) {
      wins++;
    }
    if (printResults) {
      console.log(`Game ${i} result: ${result}`);
    }
  }
  console.log('wins/numGames: ' + wins / numGames);
}

const simSeed = 'seed';
const GreedyMiniMax0 = GreedyMiniMax.chooseDepth(0);
const GreedyMiniMax1 = GreedyMiniMax.chooseDepth(1);
const GreedyMiniMax2 = GreedyMiniMax.chooseDepth(2);
const GreedyMiniMax3 = GreedyMiniMax.chooseDepth(3);

console.log(' Random vs Random');
runSimulation(Random, Random, 'seed', 1000);

console.log('\n RandomPlay vs Random');
runSimulation(RandomPlay, Random, 'seed', 1000);

console.log('\n RandomPlay vs RandomPlay');
runSimulation(RandomPlay, RandomPlay, 'seed', 1000);

console.log('\n Greedy vs RandomPlay');
runSimulation(Greedy, RandomPlay, 'seed', 1000);

console.log('\n Greedy vs Greedy');
runSimulation(Greedy, Greedy, simSeed, 1000);

console.log('\n GreedyMiniMax0 vs GreedyMiniMax0');
runSimulation(GreedyMiniMax0, GreedyMiniMax0, simSeed, 1000);

console.log('\n GreedyMiniMax0 vs Greedy');
runSimulation(GreedyMiniMax0, Greedy, simSeed, 1000);

console.log('\n Greedy vs GreedyMiniMax0 ');
runSimulation(Greedy, GreedyMiniMax0, simSeed, 1000);


console.log('\n GreedyMiniMax1 vs GreedyMiniMax1');
runSimulation(GreedyMiniMax1, GreedyMiniMax1, simSeed, 100);

console.log('\n GreedyMiniMax1 vs Greedy');
runSimulation(GreedyMiniMax1, Greedy, simSeed, 100);


console.log('\n GreedyMiniMax2 vs GreedyMiniMax2');
runSimulation(GreedyMiniMax2, GreedyMiniMax2, simSeed, 100);

console.log('\n GreedyMiniMax2 vs Greedy');
runSimulation(GreedyMiniMax2, Greedy, simSeed, 100);

// this takes a while
/* console.log('\n GreedyMiniMax3 vs GreedyMiniMax3');
runSimulation(GreedyMiniMax3, GreedyMiniMax3, simSeed, 100); */

console.log('\n GreedyMiniMax3 vs Greedy');
runSimulation(GreedyMiniMax3, Greedy, simSeed, 100, true);

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