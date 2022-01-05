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

function evalAdaptive(gameState, myTurn, k = 0.30) {
  // x = my cards - adversary cards
  // f(x) = a = 1/(1+e^(k*x))
  // k = 0.15 -> a = 0.75 => x = -7.32
  //          -> a = 0.5 => x = 0
  switch (myTurn) {
  case 0: {
    const delta = gameState.hands[0].length - gameState.hands[1].length;
    const a = (1 / 2) / (1 + Math.exp(k * delta)) + (1 / 2);
    // console.log('delta = ' + delta + ', a = ' + a);
    return gameState.hands[0].length * a - gameState.hands[1].length * (1 - a);
  }
  case 1: {
    const delta = gameState.hands[1].length - gameState.hands[0].length;
    const a = (1 / 2) / (1 + Math.exp(k * delta)) + (1 / 2);
    // console.log('delta = ' + delta + ', a = ' + a);
    return gameState.hands[1].length * a - gameState.hands[0].length * (1 - a);
  }

  default:
    throw new Error('myTurn must be 0 or 1');
  }
}

function setK(k) {
  return (gameState, myTurn) => {
    return evalAdaptive(gameState, myTurn, k);
  };
}


module.exports = {
  eval1,
  eval2,
  eval3,
  setAlpha,
  evalAdaptive,
  setK,
};