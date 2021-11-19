function chooseAction(gameState, availableMoves) {
  // find the moves with type play
  const playMoves = availableMoves.filter(move => move.type === 'Play');
  if (playMoves.length > 0) {
    // choose a random action from the available moves
    const randomIndex = Math.floor(Math.random() * playMoves.length);
    return playMoves[randomIndex];
  }
  else {
    const drawPlayMoves = availableMoves.filter(move => move.type === 'Draw_Play');
    if (drawPlayMoves.length > 0) {
      return drawPlayMoves[0];
    }
    else {
      return availableMoves[0];
    }
  }
}
module.exports = {
  chooseAction,
};