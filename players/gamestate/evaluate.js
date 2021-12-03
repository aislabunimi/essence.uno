function eval1(gameState, myTurn) {
  switch (myTurn) {
  case 0:
    return gameState.hands[0].length - gameState.hands[1].length;
  case 1:
    return gameState.hands[1].length - gameState.hands[0].length;
  default:
    throw new Error('myTurn must be 0 or 1');
  }
}

function eval2(gameState, myTurn) {
  switch (myTurn) {
  case 0:
    return gameState.hands[0].length;
  case 1:
    return gameState.hands[1].length;
  default:
    throw new Error('myTurn must be 0 or 1');
  }
}

function eval3(gameState, myTurn, a = 1) {
  // a = 0.5 -> eval1
  // a = 1 -> eval2
  // a = 0 -> main pourpose is making the enemy's hand as big as possible, makes games impossibly long

  switch (myTurn) {
  case 0:
    return gameState.hands[0].length * a - gameState.hands[1].length * (1 - a);
  case 1:
    return gameState.hands[1].length * a - gameState.hands[0].length * (1 - a);
  default:
    throw new Error('myTurn must be 0 or 1');
  }
}

function setAlpha(alpha) {
  return (gameState, myTurn) => {
    return eval3(gameState, myTurn, alpha);
  };
}

module.exports = {
  eval1,
  eval2,
  eval3,
  setAlpha,
};