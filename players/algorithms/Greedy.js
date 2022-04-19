const seedrandom = require('seedrandom');

class Greedy {
  constructor(seed) {
    this.name = 'Greedy';
    this.seed = seed;
    this.rng = seedrandom(this.seed);
  }

  chooseAction(gameState) {
    const availableActions = gameState.getAvailableActions();
    const bests = [availableActions[0]];
    let currentBest = gameState.nextState(bests[0]).eval();
    for (const action of availableActions.slice(1)) {
      const nextState = gameState.nextState(action);
      const nextEval = nextState.eval();
      if (gameState.turn === 0) {
        if (nextEval < currentBest) {
          currentBest = nextEval;
          bests.splice(0, bests.length, action);
        }
        else if (nextEval === currentBest) {
          bests.push(action);
        }
      }
      else if (nextEval > currentBest) {
        currentBest = nextEval;
        bests.splice(0, bests.length, action);
      }
      else if (nextEval === currentBest) {
        bests.push(action);
      }
    }
    const randomIndex = Math.floor(this.rng() * bests.length);
    return bests[randomIndex];
  }
}

module.exports = Greedy;