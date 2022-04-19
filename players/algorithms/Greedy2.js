const seedrandom = require('seedrandom');

class Greedy2 {
  constructor(seed) {
    this.name = 'Greedy2';
    this.seed = seed;
    this.rng = seedrandom(this.seed);
  }

  chooseAction(gameState) {
    const myTurn = gameState.turn;
    const availableActions = gameState.getAvailableActions();

    const bests = [availableActions[0]];
    let currentBest = this.evaluate(
      gameState.nextState(availableActions[0]),
      myTurn,
    );

    for (const action of availableActions.slice(1)) {
      const nextState = gameState.nextState(action);
      const nextEval = this.evaluate(nextState, myTurn);
      if (nextEval < currentBest) {
        currentBest = nextEval;
        bests.splice(0, bests.length, action);
      }
      else if (nextEval === currentBest) {
        bests.push(action);
      }
    }

    const randomIndex = Math.floor(this.rng() * bests.length);
    // return bests[bests.length - 1];
    return bests[randomIndex];
  }

  evaluate(gameState, myTurn) {
    if (myTurn == 0) {
      return gameState.hands[0].length - gameState.hands[1].length;
    }
    else {
      return gameState.hands[1].length - gameState.hands[0].length;
    }
  }
}

module.exports = Greedy2;