const seedrandom = require('seedrandom');

class GreedyMiniMax2 {
  constructor(seed, depth = 5, evalFun = this.evaluate) {
    this.name = 'GreedyMiniMax2';
    this.evalFun = evalFun;
    this.depth = depth;
    this.seed = seed;
    this.rng = seedrandom(this.seed);
  }

  chooseAction(gameState) {
    const availableMoves = gameState.getAvailableActions();
    const myTurn = gameState.turn;
    const rewardMovesList = [];
    for (const m of availableMoves) {
      const result =
        this.chooseActionReward(
          gameState,
          m,
          myTurn,
          0,
          [m],
        );
      rewardMovesList.push(result);
    }
    /* for (const m of rewardMovesList) {
      console.log(`${JSON.stringify(m.moves)} -> ${m.reward}\n`);
    } */
    /*  const minReward = rewardMovesList.reduce(
      (acc, curr) => { return acc.reward < curr.reward ? acc : curr; },
    );
    return minReward.moves[0]; */
    return this.chooseMinRandomly(rewardMovesList).moves[0];
  }

  chooseActionReward(
    gameState, move, myTurn, depth, moves,
  ) {
    const nextState = gameState.nextState(move);
    if (nextState.isFinal() || depth >= this.depth) {
      return {
        moves: [...moves],
        reward: this.evalFun(nextState, myTurn),
      };
    }

    const availableMoves = nextState.getAvailableActions();
    const rewardMovesList = [];
    for (const m of availableMoves) {
      const result = this.chooseActionReward(
        nextState,
        m,
        myTurn,
        depth + 1,
        [...moves, m],
      );
      rewardMovesList.push(result);
    }

    if (nextState.turn != myTurn) {
      return this.chooseMaxRandomly(rewardMovesList);
    }
    else {
      return this.chooseMinRandomly(rewardMovesList);
    }
  }

  evaluate(gameState, myTurn) {
    if (myTurn == 0) {
      return gameState.hands[0].length - gameState.hands[1].length;
    }
    else {
      return gameState.hands[1].length - gameState.hands[0].length;
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

module.exports = GreedyMiniMax2;