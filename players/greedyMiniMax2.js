function evaluate(gameState, myTurn) {
  if (myTurn == 0) {
    // 1 - 10 = -9
    return gameState.hands[0].length - gameState.hands[1].length;
  }
  else {
    // 10 - 1 = 9
    return gameState.hands[1].length - gameState.hands[0].length;
  }
  // return gameState.hands[myTurn].length;
}

function chooseAction(
  gameState, availableMoves, maxDepth = 1, evaluator = evaluate,
) {
  const myTurn = gameState.turn;
  // max(x,y) = -min(-x,-y)
  const rewardMovesList = [];
  // console.log(gameState.hands[0]);
  for (const m of availableMoves) {
    const result =
      chooseActionReward(gameState, m, myTurn, 0, maxDepth, [m], evaluator);
    rewardMovesList.push(result);
  }

  /* for (const m of rewardMovesList) {
    console.log(`${JSON.stringify(m.moves)} -> ${m.reward}\n`);
  } */
  const minReward = rewardMovesList.reduce(
    (acc, curr) => { return acc.reward < curr.reward ? acc : curr; },
  );
  return minReward.moves[0];
}

function chooseActionReward(
  gameState, move, myTurn, depth, maxDepth, moves, evaluator,
) {
  const nextState = gameState.nextState(move);
  if (nextState.isFinal() || depth >= maxDepth) {
    return {
      moves: [...moves],
      reward: evaluator(nextState, myTurn),
    };
  }
  // console.log('qui');

  const availableMoves = nextState.availableActions();
  const rewardMovesList = [];
  for (const m of availableMoves) {
    const result = chooseActionReward(
      nextState,
      m,
      myTurn,
      depth + 1,
      maxDepth,
      [...moves, m],
      evaluator,
    );
    rewardMovesList.push(result);
  }

  if (nextState.turn != myTurn) {
    // find max reward
    const maxReward = rewardMovesList.reduce(
      (acc, curr) => { return acc.reward > curr.reward ? acc : curr; },
    );
    return maxReward;
  }
  else {
    // find min reward
    const minReward = rewardMovesList.reduce(
      (acc, curr) => { return acc.reward < curr.reward ? acc : curr; },
    );
    return minReward;
  }
}

function setDepth(d) {
  return {
    chooseAction: (gameState, availableMoves) => {
      return chooseAction(gameState, availableMoves, d);
    },
  };
}

function setDepthAndEvaluator(d, evaluator) {
  return {
    chooseAction: (gameState, availableMoves) => {
      return chooseAction(gameState, availableMoves, d, evaluator);
    },
  };
}


module.exports = {
  chooseAction,
  setDepth,
  setDepthAndEvaluator,
};