const seedrandom = require('seedrandom');

class Random {
  constructor(seed) {
    this.name = 'Random';
    this.seed = seed;
    this.rng = seedrandom(this.seed);
  }

  chooseAction(gameState) {
    // choose a random action from the available moves
    const availableActions = gameState.getAvailableActions();
    const randomIndex = Math.floor(this.rng() * availableActions.length);
    return availableActions[randomIndex];
  }
}

module.exports = Random;