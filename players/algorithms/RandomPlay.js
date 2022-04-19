const seedrandom = require('seedrandom');

class RandomPlay {
  constructor(seed) {
    this.seed = seed;
    this.rng = seedrandom(this.seed);
    this.name = 'RandomPlay';
  }

  chooseAction(gamestate) {
    const availableActions = gamestate.getAvailableActions();
    const playActions = availableActions.filter(move => move.type === 'Play');
    if (playActions.length > 0) {
    // choose a random action from the available moves
      const randomIndex = Math.floor(this.rng() * playActions.length);
      return playActions[randomIndex];
    }
    else {
      const drawPlayActions = availableActions.filter(move => move.type === 'Draw_Play');
      if (drawPlayActions.length > 0) {
        const randomIndex2 = Math.floor(this.rng() * drawPlayActions.length);
        return drawPlayActions[randomIndex2];
      }
      else {
        return availableActions[0];
      }
    }
  }
}

module.exports = RandomPlay;
