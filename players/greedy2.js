function chooseAction(gameState, availableMoves) {
  const myTurn = gameState.turn;
  // console.log(myTurn);
  let best = availableMoves[0];
  let currentBest = evaluate(gameState, myTurn);
  /* console.log(gameState.hands[myTurn]);
  console.log('eval: ' + evaluate(gameState, myTurn)); */
  for (const move of availableMoves.slice(1)) {
    const nextState = gameState.nextState(move);
    const nextEval = evaluate(nextState, myTurn);
    /* console.log(move);
    console.log(nextEval); */

    /* if (gameState.turn === 0) { */
    if (nextEval <= currentBest) {
      currentBest = nextEval;
      best = move;
    }
    /* }
    else if (nextEval >= currentBest) {
      currentBest = nextEval;
      best = move;
    } */
  }
  return best;
}

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

module.exports = {
  chooseAction,
};