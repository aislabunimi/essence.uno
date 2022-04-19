const seedrandom = require('seedrandom');

class Greedy3 {
  constructor(seed, evalFunction) {
    this.name = 'Greedy3';
    this.seed = seed;
    this.rng = seedrandom(this.seed);
    this.evalFunction = evalFunction;
  }

  chooseAction(gameState) {
    const myTurn = gameState.turn;
    const availableActions = gameState.getAvailableActions();

    const bests = [availableActions[0]];
    let currentBest = this.evalFunction(
      gameState.nextState(availableActions[0]),
      myTurn,
    );

    for (const action of availableActions.slice(1)) {
      const nextState = gameState.nextState(action);
      const nextEval = this.evalFunction(nextState, myTurn);
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
}

module.exports = Greedy3;