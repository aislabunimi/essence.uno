const colors = ['Red', 'Yellow', 'Green', 'Blue'];
const color_types = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Draw', 'Reverse', 'Skip'];
const special_types = ['Wild', 'WildDraw'];
const cards = [];
for (const color of colors) {
  for (const type of color_types) {
    // In uno deck you have 2 copies of every number expect for 0
    const newCard = {
      name: `${color}_${type}`,
      color: color,
      type: type,
    };
    if (type !== '0') {
      cards.push(newCard);
    }
    cards.push(newCard);
  }
}
// add 4 of each special cards
for (const type of special_types) {
  const newCard = {
    name: `Blank_${type}`,
    color: 'Blank',
    type: type,
  };
  for (let i = 0; i < 4; i++) {
    cards.push(newCard);
  }
}
// debugging cards
/* debugCards = [];
for (let i = 0; i < cards.length; i++) {
  if (i === 14) {
    const color = 'Blank';
    const type = 'Wild';
    debugCards.push({
      name: `${color}_${type}`,
      color: color,
      type: type,
    });
  }
  else {
    debugCards.push(cards[i]);
  }
}
cards.splice(0, cards.length, ...debugCards); */

class Uno {
  constructor(roomName, maxPlayers, drawCallback, unoCallback, winCallback) {
    this.roomName = roomName;
    this.deck = this.shuffleCards([...cards]);
    this.discarded = [];
    this.players = [];
    this.currentPlayer = 0;
    this.maxPlayers = maxPlayers;
    this.started = false;
    this.order = 1;
    this.unoTarget = null;
    this.drawCallback = drawCallback;
    this.unoCallback = unoCallback;
    this.winCallback = winCallback;
  }

  reset() {
    this.deck = this.shuffleCards([...cards]);
    this.discarded = [];
    this.currentPlayer = 0;
    this.started = false;
    this.lastWildColor = null;
    this.order = 1;
    for (const player of this.players) {
      player.hand = [];
    }
  }

  addPlayer(playerId, name, surname) {
    this.players.push({
      socketId: playerId,
      name: name,
      surname: surname,
      turn: this.players.length,
      hand: [],
      hasDrawn: false,
      wins: 0,
    });
  }

  replacePlayer(playerID, name, surname) {
    const player = this.players.find(p =>
      p.name === name && p.surname === surname);
    player.socketId = playerID;
    return player;
  }

  isAlreadyPlaying(name, surname) {
    return this.players.some(player =>
      player.name === name && player.surname === surname);
  }

  removePlayer(playerId) {
    // remove player from the array of players
    this.players = this.players.filter(player => player.socketId !== playerId);
    // update others players turn
    for (let i = 0; i < this.players.length; i++) {
      this.players[i].turn = i;
    }
  }

  isReady() {
    return this.players.length === this.maxPlayers && this.started === false;
  }

  shuffleCards(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  dealCards(cardsNumber) {
    if (cardsNumber > this.deck.length) {
      // keep the last card from the discard pile
      const lastCard = this.discarded.pop();
      // clean the discard pile from colored wild cards
      for (const card of this.discarded) {
        if (card.type === 'Wild' || card.type === 'WildDraw') {
          card.color = 'Blank';
          card.name = 'Blank_' + card.type;
        }
      }
      // shuffle the deck and the discard pile
      this.deck = this.shuffleCards([...this.deck, ...this.discarded]);
      // add the last card of the discard pile back to the discard pile
      this.discarded = [lastCard];
    }
    const cardsToDeal = this.deck.slice(0, cardsNumber);
    this.deck.splice(0, cardsNumber);
    return cardsToDeal;
  }

  start() {
    this.players.forEach(player => {
      player.hand = this.dealCards(7);
    });
    // If the first card is a wild card:
    // Return card to the deck, shuffle, flip top card to start discard pile
    let firstDiscard = this.deck.shift();
    while (firstDiscard.type === 'WildDraw') {
      console.log('first card is WildDraw, reshuffling');
      this.deck.unshift(firstDiscard);
      this.deck = this.shuffleCards([...this.deck]);
      firstDiscard = this.deck.shift();
    }
    // If the first has any special effect, they will be applied
    // to the first player
    // This also makes the first player the one after the room creator
    this.players[this.currentPlayer].hand.push(firstDiscard);
    this.discard(firstDiscard);
    this.discarded.push(firstDiscard);
    this.started = true;
  }

  moves() {
    // Generation of available moves for current player
    const player = this.players[this.currentPlayer];
    const discardedCard = this.discarded[this.discarded.length - 1];
    // const moves = [...player.hand.filter(c => c.type.includes('Wild'))];
    const moves = [];

    // if the player drew a card, he can only play that or pass
    if (player.hasDrawn) {
      const card = player.hand[player.hand.length - 1];
      // if the discarded card is a wild card without color,
      // the player can play anything he drew or pass
      if (discardedCard.color === 'Blank') {
        moves.push(card);
      }
      if (this.cardIsPlayable(card, discardedCard)) {
        moves.push(card);
      }
      moves.push('Pass');
      console.log(moves);
      return moves;
    }

    moves.push('Draw');

    if (discardedCard.color === 'Blank') {
      // this can happen only when the first card is a wild card
      // the player can play any card
      moves.push(...player.hand);
    }
    for (const card of player.hand) {
      if (this.cardIsPlayable(card, discardedCard)) moves.push(card);
    }
    console.log(moves);
    return moves;
  }

  cardIsPlayable(card, lastCard) {
    if (card.type === lastCard.type ||
      card.color === lastCard.color) {
      // if the card is of the correct color or type, it can be played
      return true;
    }
    else if (card.type === ('Wild') || card.type === ('WildDraw')) {
      // if the card is a wild card, it can be played
      return true;
    }
    return false;
  }


  discard(card) {
    const player = this.players[this.currentPlayer];

    let cardToSearchInhand = card;
    // If the card is a wild one, the color and name won't match with hand
    // so we create a new card with the values that will match the one in the hand
    if (card.type === 'WildDraw' || card.type === 'Wild') {
      cardToSearchInhand = {
        name: `Blank_${card.type}`,
        color: 'Blank',
        type: card.type,
      };
    }

    if (player.hand.some(c => c.name === cardToSearchInhand.name)) {
      const cardIndex = player.hand.findIndex(
        c => c.name === cardToSearchInhand.name,
      );
      player.hand.splice(cardIndex, 1);

      // if the player hand has only one card left,
      // allow the player to say UNO
      // allow the other players to make him draw if they are faster.
      if (player.hand.length === 1) {
        this.unoTarget = this.currentPlayer;
        this.unoCallback(this.roomName);
      }

      this.specialEffects(card);
      this.discarded.push(card);

      // if the player that discarded the card has no more cards,
      // the game is over and the player that won is the one that discarded
      if (player.hand.length === 0) {
        player.wins++;
        this.winCallback(this.roomName, `${player.name} ${player.surname}`);
      }
    }
    else {
      console.log('card not found while discarding');
    }
    this.nextTurn();
  }
  contestUno() {
    this.forcedDraw(2, this.unoTarget);
  }

  draw() {
    const player = this.players[this.currentPlayer];
    const newCards = this.dealCards(1);
    player.hand.push(...newCards);
    this.drawCallback(player.socketId, newCards);
    player.hasDrawn = true;
  }

  forcedDraw(number, playerNumber = this.currentPlayer) {
    const player = this.players[playerNumber];
    const newCards = this.dealCards(number);
    player.hand.push(...newCards);
    this.drawCallback(player.socketId, newCards);
  }

  nextTurn() {
    this.currentPlayer = (this.currentPlayer + this.order) % this.maxPlayers;
    if (this.currentPlayer === -1) {
      this.currentPlayer = this.maxPlayers - 1;
    }
    // reset the player's hasDrawn flag
    this.players[this.currentPlayer].hasDrawn = false;
  }

  getPreviousTurn() {
    let player = (this.currentPlayer - this.order) % this.maxPlayers;
    if (player === -1) {
      player = this.maxPlayers - 1;
    }
    return player;
  }

  specialEffects(card, draw) {
    switch (card.type) {
    case 'Skip': {
      this.nextTurn();
      break;
    }
    case 'Reverse': {
      this.order = -this.order;
      if (this.maxPlayers == 2) {
        this.nextTurn();
      }
      break;
    }
    case 'Draw': {
      this.nextTurn();
      const newCards = this.dealCards(2);
      this.players[this.currentPlayer].hand.push(...newCards);
      this.drawCallback(this.players[this.currentPlayer].socketId, newCards);
      break;
    }
    case 'WildDraw': {
      this.nextTurn();
      const newCards = this.dealCards(4);
      this.players[this.currentPlayer].hand.push(...newCards);
      this.drawCallback(this.players[this.currentPlayer].socketId, newCards);
      break;
    }
    }
  }

  getPlayersInfo() {
    const players = [];
    for (const player of this.players) {
      players.push({
        name: player.name,
        surname: player.surname,
        turn: player.turn,
        hand: player.hand.length,
        wins: player.wins,
      });
    }
    return players;
  }
}
module.exports = Uno;