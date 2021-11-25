function chooseAction(gameState, availableMoves, maxDepth = 1) {

  const rewardMovesList = [];
  // console.log(gameState.hands[0]);
  for (const m of availableMoves) {
    const result =
      chooseActionReward(gameState, m, gameState.turn, 0, maxDepth, [m]);
    rewardMovesList.push(result);
  }

  /* for (const m of rewardMovesList) {
    console.log(`${JSON.stringify(m.moves)} -> ${m.reward}\n`);
  } */

  if (gameState.turn === 0) {
    const minReward = rewardMovesList.reduce(
      (acc, curr) => { return acc.reward < curr.reward ? acc : curr; },
    );
    return minReward.moves[0];
  }
  else {
    const maxReward = rewardMovesList.reduce(
      (acc, curr) => { return acc.reward > curr.reward ? acc : curr; },
    );
    return maxReward.moves[0];
  }
}

function chooseActionReward(gameState, move, myTurn, depth, maxDepth, moves) {
  const nextState = gameState.nextState(move);
  if (nextState.isFinal() || depth >= maxDepth) {
    return {
      moves: [...moves],
      reward: nextState.eval(),
    };
  }

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
    );
    rewardMovesList.push(result);
  }
  if (nextState.turn === 0) {
    if (nextState.turn === myTurn) {
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
  else if (nextState.turn === myTurn) {
    // find min reward
    const minReward = rewardMovesList.reduce(
      (acc, curr) => { return acc.reward < curr.reward ? acc : curr; },
    );
    return minReward;
  }
  else {
    // find max reward
    const maxReward = rewardMovesList.reduce(
      (acc, curr) => { return acc.reward > curr.reward ? acc : curr; },
    );
    return maxReward;
  }
}

function chooseDepth(d) {
  return {
    chooseAction: (gameState, availableMoves) => {
      return chooseAction(gameState, availableMoves, d);
    },
  };
}


module.exports = {
  chooseAction,
  chooseDepth,
};