const seedrandom = require('seedrandom');

// hard time limit, if the time is over maxTime we stop and return the last
// completed iteration result

class ABMMT3 {
  constructor(seed, depth = 5, evalFun = this.evaluate, random = true, maxTime = 3) {
    this.name = 'ABMMT3';
    this.evalFun = evalFun;
    this.depth = depth;
    this.seed = seed;
    this.rng = seedrandom(this.seed);
    this.random = random;
    this.maxTime = maxTime;
    this.depthSum = 0;
    this.calls = 0;
  }

  chooseAction(gameState) {
    const availableMoves = gameState.getAvailableActions();
    const myTurn = gameState.turn;
    const rewardMovesList = [];
    let lastRewardMovesList = [];
    this.time = process.hrtime();

    const defaultDepth = this.depth;
    let done = true;
    let first = true;

    do {
      this.lastTime = process.hrtime();
      this.counter = 0;
      const alpha = Number.MIN_SAFE_INTEGER;
      let beta = Number.MAX_SAFE_INTEGER;

      let best = {
        moves:null,
        reward: Number.MAX_SAFE_INTEGER,
      };
      for (const m of availableMoves) {
        this.counter += 1;
        const result = this.chooseActionReward(
          gameState,
          m,
          myTurn,
          0,
          [m],
          alpha,
          beta,
          first,
        );
        if (!result) {
          done = false;
          break;
        }
        if (result.reward < best.reward) {
          best = result;
          rewardMovesList.length = 0;
        }
        if (best.reward == result.reward) {
          rewardMovesList.push(result);
        }
        beta = Math.min(beta, best.reward);
        if (best.reward < alpha) {
        // console.log('pruned');
          break;
        }
      }
      if (done) {
        lastRewardMovesList = JSON.parse(JSON.stringify(rewardMovesList));
      }
      this.depth += 1;
      first = false;
    } while (done);
    /* console.log(this.depth);
    console.log(deltams); */
    // const delta = process.hrtime(this.time);
    // const deltams = delta[0] * 1000 + delta[1] / 1000000;
    // console.log(`${this.depth} - ${deltams}`);
    this.calls += 1;
    this.lastDepth = this.depth;
    this.depth = defaultDepth;

    const chosen = this.chooseRandomly(lastRewardMovesList);
    // console.log(`${this.counter}`);
    // console.log(gameState.hands[myTurn]);
    // console.log(rewardMovesList);
    // console.log(chosen);
    return [chosen.moves[0], this.counter, this.lastDepth];
  }

  chooseActionReward(
    gameState, move, myTurn, depth, moves, alpha, beta, first,
  ) {
    const delta = process.hrtime(this.time);
    const deltams = delta[0] * 1000 + delta[1] / 1000000;
    if (!first && deltams > this.maxTime) {
      return null;
    }
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
        this.counter += 1;
        const result = this.chooseActionReward(
          nextState,
          m,
          myTurn,
          depth + 1,
          [...moves, m],
          alpha,
          beta,
          first,
        );
        if (!result) {
          return null;
        }
        if (result.reward > best.reward) {
          best = result;
          rewardMovesList.length = 0;
        }
        if (best.reward == result.reward) {
          rewardMovesList.push(result);
        }
        alpha = Math.max(alpha, best.reward);
        // console.log(`${alpha} - ${best} - ${beta}`);
        if (best.reward > beta) {
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
        this.counter += 1;
        const result = this.chooseActionReward(
          nextState,
          m,
          myTurn,
          depth + 1,
          [...moves, m],
          alpha,
          beta,
          first,
        );
        if (!result) {
          return null;
        }
        if (result.reward < best.reward) {
          best = result;
          rewardMovesList.length = 0;
        }
        if (best.reward == result.reward) {
          rewardMovesList.push(result);
        }
        beta = Math.min(beta, best.reward);
        if (best.reward < alpha) {
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
}

module.exports = ABMMT3;