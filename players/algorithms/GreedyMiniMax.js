const seedrandom = require('seedrandom');

class GreedyMiniMax {
  constructor(seed, depth = 5) {
    this.name = 'GreedyMiniMax';
    this.depth = depth;
    this.seed = seed;
    this.rng = seedrandom(this.seed);
  }

  chooseAction(gameState) {
    const availableActions = gameState.getAvailableActions();
    const rewardMovesList = [];

    for (const m of availableActions) {
      const result =
        this.chooseActionReward(gameState, m, gameState.turn, 0, [m]);
      rewardMovesList.push(result);
    }

    if (gameState.turn === 0) {
      /* const minReward = rewardMovesList.reduce(
        (acc, curr) => { return acc.reward < curr.reward ? acc : curr; },
      );
      return minReward.moves[0]; */
      return this.chooseMinRandomly(rewardMovesList).moves[0];
    }
    else {
      /* const maxReward = rewardMovesList.reduce(
        (acc, curr) => { return acc.reward > curr.reward ? acc : curr; },
      );
      return maxReward.moves[0]; */
      return this.chooseMaxRandomly(rewardMovesList).moves[0];
    }
  }

  chooseActionReward(gameState, move, myTurn, depth, moves) {
    const nextState = gameState.nextState(move);
    if (nextState.isFinal() || depth >= this.depth) {
      return {
        moves: [...moves],
        reward: nextState.eval(),
      };
    }

    const availableActions = nextState.getAvailableActions();
    const rewardMovesList = [];
    for (const m of availableActions) {
      const result = this.chooseActionReward(
        nextState,
        m,
        myTurn,
        depth + 1,
        [...moves, m],
      );
      rewardMovesList.push(result);
    }
    if (nextState.turn === 0) {
      if (nextState.turn === myTurn) {
        // find max reward
        /* const maxReward = rewardMovesList.reduce(
          (acc, curr) => { return acc.reward > curr.reward ? acc : curr; },
        );
        return maxReward; */
        return this.chooseMaxRandomly(rewardMovesList);
      }
      else {
        // find min reward
        /* const minReward = rewardMovesList.reduce(
          (acc, curr) => { return acc.reward < curr.reward ? acc : curr; },
        );
        return minReward; */
        return this.chooseMinRandomly(rewardMovesList);
      }
    }
    else if (nextState.turn === myTurn) {
      // find min reward
      /* const minReward = rewardMovesList.reduce(
        (acc, curr) => { return acc.reward < curr.reward ? acc : curr; },
      );
      return minReward; */
      return this.chooseMinRandomly(rewardMovesList);
    }
    else {
      // find max reward
      /* const maxReward = rewardMovesList.reduce(
        (acc, curr) => { return acc.reward > curr.reward ? acc : curr; },
      );
      return maxReward; */
      return this.chooseMaxRandomly(rewardMovesList);
    }
  }

  chooseMinRandomly(rewardMovesList) {
    const bests = [rewardMovesList[0]];
    for (const action of rewardMovesList) {
      if (action.reward === bests[0].reward) {
        bests.push(action);
      }
      else if (action.reward < bests[0].reward) {
        bests.splice(0, bests.length, action);
      }
    }
    const randomIndex = Math.floor(this.rng() * bests.length);
    // to make it the same as the original implementation, without the randomness
    // return bests[bests.length - 1];
    return bests[randomIndex];
  }

  chooseMaxRandomly(rewardMovesList) {
    const bests = [rewardMovesList[0]];
    for (const action of rewardMovesList) {
      if (action.reward === bests[0].reward) {
        bests.push(action);
      }
      else if (action.reward > bests[0].reward) {
        bests.splice(0, bests.length, action);
      }
    }
    const randomIndex = Math.floor(this.rng() * bests.length);
    // to make it the same as the original implementation, without the randomness
    // return bests[bests.length - 1];
    return bests[randomIndex];
  }
}

module.exports = GreedyMiniMax;