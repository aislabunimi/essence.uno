const maxDepth = 6;

function chooseAction(gameState, availableMoves) {

  const rewardMovesList = [];
  // console.log(gameState.hands[0]);
  for (const m of availableMoves) {
    const result = chooseActionReward(gameState, m, gameState.turn, 0, [m]);
    rewardMovesList.push(result);
  }

  for (const m of rewardMovesList) {
    console.log(`${JSON.stringify(m.moves)} -> ${m.reward}\n`);
  }

  // find min reward
  const maxReward = rewardMovesList.reduce(
    (acc, curr) => { return acc.reward < curr.reward ? acc : curr; },
  );
  return maxReward.moves[0];

}

function chooseActionReward(gameState, move, myTurn, depth, moves) {
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
      [...moves, m],
    );
    rewardMovesList.push(result);
  }
  if (nextState.turn === myTurn) {
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
module.exports = {
  chooseAction,
};