const seedrandom = require('seedrandom');

class MM {
  constructor(seed, depth = 5, evalFun = this.evaluate, random = true) {
    this.name = 'MM';
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

    this.counter = 0;

    let best = null;
    for (const m of availableMoves) {
      this.counter += 1;
      const result =
        this.chooseActionReward(
          gameState,
          m,
          myTurn,
          0,
          [m],
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
    const chosen = this.chooseRandomly(rewardMovesList);
    return [chosen.moves[0], this.counter];
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
        );
        if (result.reward > best.reward) {
          best = result;
          rewardMovesList.length = 0;
        }
        if (best.reward == result.reward) {
          rewardMovesList.push(result);
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
        );
        if (result.reward < best.reward) {
          best = result;
          rewardMovesList.length = 0;
        }
        if (best.reward == result.reward) {
          rewardMovesList.push(result);
        }
      }
    }
    return this.chooseRandomly(rewardMovesList);
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

module.exports = MM;