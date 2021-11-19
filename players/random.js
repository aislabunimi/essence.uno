function chooseAction(gameState, availableMoves) {
  // choose a random action from the available moves
  const randomIndex = Math.floor(Math.random() * availableMoves.length);
  return availableMoves[randomIndex];
}
module.exports = {
  chooseAction,
};