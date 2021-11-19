function chooseAction(gameState, availableMoves) {
  let best = availableMoves[0];
  let currentBest = gameState.nextState(best).eval();
  for (const move of availableMoves.slice(1)) {
    const nextState = gameState.nextState(move);
    const nextEval = nextState.eval();
    if (nextEval < currentBest) {
      currentBest = nextEval;
      best = move;
    }
  }
  return best;
}
module.exports = {
  chooseAction,
};