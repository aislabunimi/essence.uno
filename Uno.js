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
  if (i === 2 || i == 3) {
    const color = 'Blank';
    const type = 'WildDraw';
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
  constructor(roomName, maxPlayers, drawCallback, unoCallback,
    wild4ContestCallback, winCallback) {
    this.roomName = roomName;
    this.deck = this.shuffleCards([...cards]);
    this.discarded = [];
    this.players = [];
    this.currentPlayer = 0;
    this.maxPlayers = maxPlayers;
    this.started = false;
    this.order = 1;
    this.unoTarget = null;
    this.lastPlayer = null;
    this.drawCallback = drawCallback;
    this.unoCallback = unoCallback;
    this.wild4ContestCallback = wild4ContestCallback;
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

  addPlayer(socketId, name, surname, uuid) {
    this.players.push({
      socketId: socketId,
      uuid: uuid,
      name: name,
      surname: surname,
      connected: true,
      turn: this.players.length,
      hand: [],
      hasDrawn: false,
      wins: 0,
    });
  }
  getPlayerUUID(uuid) {
    return this.players.find(player => player.uuid === uuid);
  }
  getPlayerSocketId(socketId) {
    return this.players.find(player => player.socketId === socketId);
  }

  isAlreadyPlaying(uuid) {
    return this.players.some(player =>
      player.uuid === uuid);
  }

  disconnectPlayer(socketId) {
    const player = this.getPlayerSocketId(socketId);
    if (player) {
      player.connected = false;
    }
  }

  reconnectPlayer(socketId, uuid) {
    const player = this.players.find(p =>
      p.uuid === uuid);
    player.socketId = socketId;
    player.connected = true;

    return player;
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

    // if the player drew a card, they can only play that or pass
    if (player.hasDrawn) {
      const card = player.hand[player.hand.length - 1];
      // if the discarded card is a wild card without color,
      // the player can play anything they drew or pass
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
    this.lastPlayer = this.currentPlayer;

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

      this.discarded.push(card);
      this.specialEffects(card);

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
    this.currentPlayer = this.getNextTurn();
    // reset the player's hasDrawn flag
    this.players[this.currentPlayer].hasDrawn = false;
  }
  // returns the number of the player that should play next
  getNextTurn() {
    const nextPlayer = (this.currentPlayer + this.order) % this.maxPlayers;
    if (nextPlayer === -1) {
      return this.maxPlayers - 1;
    }
    return nextPlayer;
  }

  specialEffects(card) {
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
      const nextPlayer = this.players[this.getNextTurn()];
      // saving the playerHand after the wild card was played to avoid
      // problems with contesting if the player draws cards after playing
      // the wildDraw one from e.g. being contested for UNO
      const playerHand = [...this.players[this.lastPlayer].hand];
      this.playerHandAfterWildDraw = playerHand;
      // calling callback to let the player know that they can contest
      this.wild4ContestCallback(this.roomName, nextPlayer.socketId);
      break;
    }
    }
  }
  contest4(contesting) {
    if (contesting) {
      // if the player wants to contest
      // find the top discard card when the wildDraw was played
      const lastCard = this.discarded[this.discarded.length - 2];
      // check if the hand of the player that played the wildDraw
      // contains any onether card that could be played
      for (const card of this.playerHandAfterWildDraw) {
        if (card.type != 'WildDraw' && this.cardIsPlayable(card, lastCard)) {
          // the player could have played something else than wildDraw
          // so they'll draw 4 cards
          this.forcedDraw(4, this.lastPlayer);
          return;
        }
      }
      // the player couldn't have played something else,
      // the next player will draw 6 cards and skip turn
      this.forcedDraw(6, this.currentPlayer);
      this.nextTurn();
    }
    else {
      // if the player doesn't want to contest,
      // they will draw 4 cards and skip turn
      this.forcedDraw(4, this.currentPlayer);
      this.nextTurn();
    }
  }

  getPlayersInfo() {
    const players = [];
    for (const player of this.players) {
      players.push({
        name: player.name,
        surname: player.surname,
        connected: player.connected,
        turn: player.turn,
        hand: player.hand.length,
        wins: player.wins,
      });
    }
    return players;
  }
}
module.exports = Uno;