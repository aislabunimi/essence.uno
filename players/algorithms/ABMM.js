const seedrandom = require('seedrandom');

class ABMM {
  constructor(seed, depth = 5, evalFun = this.evaluate, random = true) {
    this.name = 'ABMM';
    this.evalFun = evalFun;
    this.depth = depth;
    this.seed = seed;
    this.rng = seedrandom(this.seed);
    this.random = random;
  }

  chooseAction(gameState) {
    const availableMoves = gameState.getAvailableActions();
    const myTurn = gameState.turn;
    const rewardMovesList = [];

    let best = null;
    for (const m of availableMoves) {
      const result =
        this.chooseActionReward(
          gameState,
          m,
          myTurn,
          0,
          [m],
          Number.MIN_SAFE_INTEGER,
          Number.MAX_SAFE_INTEGER,
        );
      if (best) {
        if (gameState.turn == myTurn) {
          if (result.reward < best.reward) {
            best = result;
            rewardMovesList.length = 0;
          }
        }
      }
      else {
        best = result;
      }
      if (best.reward == result.reward) {
        rewardMovesList.push(result);
      }
    }
    /* for (const m of rewardMovesList) {
      console.log(`${JSON.stringify(m.moves)} -> ${m.reward}\n`);
    } */
    /*  const minReward = rewardMovesList.reduce(
      (acc, curr) => { return acc.reward < curr.reward ? acc : curr; },
    );
    return minReward.moves[0]; */
    const chosen = this.chooseRandomly(rewardMovesList);
    // console.log(gameState.hands[myTurn]);
    // console.log(rewardMovesList);
    // console.log(chosen);
    return chosen.moves[0];
  }

  chooseActionReward(
    gameState, move, myTurn, depth, moves, alpha, beta,
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

    // max node
    if (nextState.turn != myTurn) {
      let best = {
        moves:null,
        reward: Number.MIN_SAFE_INTEGER,
      };
      for (const m of availableMoves) {
        const result = this.chooseActionReward(
          nextState,
          m,
          myTurn,
          depth + 1,
          [...moves, m],
          alpha,
          beta,
        );
        if (result.reward > best.reward) {
          best = result;
          rewardMovesList.length = 0;
        }
        alpha = Math.max(alpha, best.reward);
        if (best.reward == result.reward) {
          rewardMovesList.push(result);
        }
        // console.log(`${alpha} - ${beta}`);
        if (alpha >= beta) {
          // console.log('pruned');
          break;
        }
      }
    }
    else {
      // min node
      let best = {
        moves:null,
        reward: Number.MAX_SAFE_INTEGER,
      };
      for (const m of availableMoves) {
        const result = this.chooseActionReward(
          nextState,
          m,
          myTurn,
          depth + 1,
          [...moves, m],
        );
        if (result.reward < best.reward) {
          best = result;
          rewardMovesList.length = 0;
        }
        if (best.reward == result.reward) {
          rewardMovesList.push(result);
        }
        beta = Math.min(beta, best.reward);
        if (alpha >= beta) {
          // console.log('pruned');
          break;
        }
      }
    }

    /* let best = null;
    for (const m of availableMoves) {
      const result = this.chooseActionReward(
        nextState,
        m,
        myTurn,
        depth + 1,
        [...moves, m],
      );
      if (best) {
        if (nextState.turn == myTurn) {
          if (result.reward < best.reward) {
            best = result;
            rewardMovesList.length = 0;
          }
        }
        if (nextState.turn != myTurn) {
          if (result.reward > best.reward) {
            best = result;
            rewardMovesList.length = 0;
          }
        }
      }
      else {
        best = result;
      }
      if (best.reward == result.reward) {
        rewardMovesList.push(result);
      }
      // rewardMovesList.push(result);
    } */

    return this.chooseRandomly(rewardMovesList);

    /* if (nextState.turn != myTurn) {
      return this.chooseMaxRandomly(rewardMovesList);
    }
    else {
      return this.chooseMinRandomly(rewardMovesList);
    } */
  }

  evaluate(gameState, myTurn) {
    if (myTurn == 0) {
      return gameState.hands[0].length - gameState.hands[1].length;
    }
    else {
      return gameState.hands[1].length - gameState.hands[0].length;
    }
  }

  chooseRandomly(rewardMovesList) {
    // console.log(rewardMovesList);
    if (!this.random) {
      return rewardMovesList[rewardMovesList.length - 1];
    }
    else {
      const randomIndex = Math.floor(this.rng() * rewardMovesList.length);
      return rewardMovesList[randomIndex];
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
    // to make it the same as the original implementation, without the randomness
    // return bests[bests.length - 1];
    if (!this.random) {
      return bests[bests.length - 1];
    }
    else {
      const randomIndex = Math.floor(this.rng() * bests.length);
      return bests[randomIndex];
    }
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
    // to make it the same as the original implementation, without the randomness
    // return bests[bests.length - 1];
    if (!this.random) {
      return bests[bests.length - 1];
    }
    else {
      const randomIndex = Math.floor(this.rng() * bests.length);
      return bests[randomIndex];
    }
  }
}

module.exports = ABMM;