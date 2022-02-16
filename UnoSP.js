const seedrandom = require('seedrandom');
const { v4: uuidv4 } = require('uuid');

const Deck = require('./utils/Deck');
const CPUPlayer = require('./players/player');

class UnoSP {
  constructor(roomUUID, maxPlayers, setupPlayerCallback,
    drawCallback, winCallback, difficulty, isSurvey) {
    this.roomUUID = roomUUID;
    this.seed = uuidv4();
    this.rng = seedrandom(this.seed);
    this.currentRNG = this.rng();
    this.deck = Deck.shuffleCardsSeeded(Deck.createDeck(), this.currentRNG);
    this.discarded = [];
    this.players = [];
    this.currentPlayer = 0;
    this.maxPlayers = maxPlayers;
    this.started = false;
    this.order = 1;
    this.lastPlayer = null;
    this.setupPlayerCallback = setupPlayerCallback;
    this.drawCallback = drawCallback;
    this.winCallback = winCallback;
    this.startTime = null;
    this.endTime = null;
    this.winner = null;
    this.actions = [];
    this.feedback = [];
    this.survey = isSurvey;
    this.bots = [
      CPUPlayer.create(
        roomUUID,
        difficulty,
        this.seed,
        Deck.shuffleCardsSeeded(Deck.createDeck(), this.currentRNG),
      ),
    ];
    console.log(this.seed);
  }

  reset() {
    this.currentRNG = this.rng();
    this.deck = Deck.shuffleCardsSeeded(Deck.createDeck(), this.currentRNG);
    this.discarded = [];
    this.currentPlayer = 0;
    this.started = false;
    this.lastWildColor = null;
    this.lastPlayer = null;
    this.order = 1;
    this.startTime = null;
    this.endTime = null;
    this.winner = null;
    this.actions = [];
    this.feedback = [];
    for (const player of this.players) {
      player.hand = [];
    }
    for (const bot of this.bots) {
      bot.reset(this.seed,
        Deck.shuffleCardsSeeded(Deck.createDeck(), this.currentRNG));
    }
  }

  // adds a new player to the game and initializes it
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
  // get a player from their uuid
  getPlayerUUID(uuid) {
    return this.players.find(player => player.uuid === uuid);
  }
  // get a player from their socketId
  getPlayerSocketId(socketId) {
    return this.players.find(player => player.socketId === socketId);
  }
  getPlayersUUID() {
    return this.players.map(player => player.uuid);
  }

  // check if a player is already in the game, given a uuid
  isAlreadyPlaying(uuid) {
    return this.players.some(player =>
      player.uuid === uuid);
  }

  // sets the connected flag of the player with matching socketId to false
  disconnectPlayer(socketId) {
    const player = this.getPlayerSocketId(socketId);
    const bot = this.bots.find(b => b.uuid === player.uuid);
    if (player && !bot) {
      player.connected = false;
      // tell the bots to leave
      for (const b of this.bots) {
        b.leave();
      }
    }
  }

  // update the socketID and connected flag of the player with the given uuid
  reconnectPlayer(socketId, uuid) {
    const player = this.players.find(p => p.uuid === uuid);
    player.socketId = socketId;
    player.connected = true;
    // stop the bots from leaving
    for (const bot of this.bots) {
      bot.cancelLeave();
    }
    return player;
  }

  // remove a player given his socketId
  // NOT USED
  removePlayer(socketId) {
    // remove player from the array of players
    this.players = this.players.filter(player => player.socketId !== socketId);
    // update others players turn
    for (let i = 0; i < this.players.length; i++) {
      this.players[i].turn = i;
    }
  }

  // returns true if the game hasn't started yet and if the number of players is valid
  isReady() {
    return this.players.length === this.maxPlayers && this.started === false;
  }

  decolorWildCard(card) {
    if (card.type === 'WildDraw' || card.type === 'Wild') {
      return {
        type: card.type,
        name: `Blank_${card.type}`,
        color: 'Blank',
      };
    }
    else {
      return card;
    }
  }

  // initialized the game
  start() {
    this.startTime = Date.now();
    // deal the cards to the players
    this.players.forEach(player => {
      player.hand = Deck.dealCards(this.deck, this.discarded, 7, this.seed);
    });
    // If the first card is a wild card:
    // Return card to the deck, shuffle, flip top card to start discard pile
    let firstDiscard = this.deck.shift();
    while (firstDiscard.type === 'WildDraw') {
      console.log('first card is WildDraw, reshuffling');
      this.deck.unshift(firstDiscard);
      this.currentRNG = this.rng();
      this.deck = Deck.shuffleCardsSeeded([...this.deck], this.currentRNG);
      firstDiscard = this.deck.shift();
    }
    // If the first has any special effect, they will be applied
    // to the first player
    // This also makes the first player the one after the room creator
    this.players[this.currentPlayer].hand.push(firstDiscard);
    // discard the first card
    this.discard(firstDiscard);
    // set the game started flag to true
    this.started = true;
    // setup players
    // setup game for all players
    for (const player of this.players) {
      this.setupPlayerCallback(this, player);
    }
  }

  // generates available moves for current player
  moves() {
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
      // the player can always pass after drawing
      moves.push('Pass');
      // console.log(moves);
      return moves;
    }

    // the player can draw once per turn
    moves.push('Draw');

    if (discardedCard.color === 'Blank') {
      // this can happen only when the first card is a wild card
      // the player can play any card
      moves.push(...player.hand);
    }
    for (const card of player.hand) {
      if (this.cardIsPlayable(card, discardedCard)) moves.push(card);
    }
    // console.log(moves);
    return moves;
  }

  // checks if a card is playable given the card and the discarded card
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

  // discards a card from the player's hand
  discard(card) {
    const player = this.players[this.currentPlayer];
    // updating lastPlayer to the current player
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
      // log action: discard
      this.actions.push({ action:'discard', res: card, target: this.currentPlayer, timeStamp:(new Date()).toISOString() });
      // find the card in the player's hand
      const cardIndex = player.hand.findIndex(
        c => c.name === cardToSearchInhand.name,
      );
      player.hand.splice(cardIndex, 1);
      // add the card to the discard pile
      this.discarded.push(card);
      // trigger special card effects
      this.specialEffects(card);
      // if the player that discarded the card has no more cards,
      // the game is over and the player that won is the one that discarded
      if (player.hand.length === 0) {
        // log action: win
        this.actions.push({ action:'win', target: this.currentPlayer, timeStamp: (new Date()).toISOString() });
        this.endTime = Date.now();
        this.winner = this.currentPlayer;
        player.wins++;
        this.winCallback(this.roomUUID, `${player.name} ${player.surname}`);
      }
    }
    else {
      console.log('CARD NOT FOUND WHILE DISCARDING');
    }
    /* console.log(this.bots[0].gameState.deck);
    console.log(this.deck); */
    /*
    console.log(
      JSON.stringify(this.bots[0].gameState.deck) == JSON.stringify(this.deck));
    console.log(this.bots[0].gameState.deck.length == this.deck.length);
    */
    this.nextTurn();
  }

  // draws a card from the deck
  draw() {
    const player = this.players[this.currentPlayer];
    // get a card from the deck
    const newCards = Deck.dealCards(this.deck, this.discarded, 1, this.seed);
    // console.log(newCards);
    // add the card to the player's hand
    player.hand.push(...newCards);
    /* console.log('game: ');
    console.log(player.hand); */
    // callback to update frontend and draw the new card
    this.drawCallback(player.socketId, newCards, this.roomUUID, this.currentPlayer);
    // set the player's hasDrawn flag to true
    player.hasDrawn = true;
    // log action: draw
    this.actions.push({ action:'draw', res: newCards, target: this.currentPlayer, timeStamp: (new Date()).toISOString() });
    /* console.log('deck game:');
    console.log(this.deck.slice(0, 5));
    console.log('hands:');
    for (const pla of this.players) {
      console.log(pla.hand);
    } */
  }

  // same as draw but used only for special cards effects or contesting
  // takes a number of cards to draw and a player's index
  forcedDraw(number, playerNumber = this.currentPlayer) {
    const player = this.players[playerNumber];
    const newCards =
      Deck.dealCards(this.deck, this.discarded, number, this.seed);
    player.hand.push(...newCards);
    this.drawCallback(player.socketId, newCards, this.roomUUID, playerNumber);
    // log action: forcedDraw
    this.actions.push({ action:'forcedDraw', res: newCards, target: playerNumber, timeStamp: (new Date()).toISOString() });
  }

  // sets the next player's turn
  nextTurn() {
    /* console.log('Bot hand serverside: ' + this.players[0].hand.map(c => c.name).join(', '));
    if (this.deck.length > 0) {
      console.log('deck serverside(' + this.deck.length + '): ' + this.deck[0].name);
    }
    else {
      console.log('deck serverside(' + this.deck.length + '): empty');
    } */
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

  // handles special card effects
  specialEffects(card) {
    switch (card.type) {
    case 'Skip': {
      this.nextTurn();
      break;
    }
    case 'Reverse': {
      this.order = -this.order;
      if (this.maxPlayers == 2) {
        // if there are only 2 players, just skip the next turn
        this.nextTurn();
      }
      break;
    }
    case 'Draw': {
      // skip the next turn
      this.nextTurn();
      // force the next player to draw 2 cards
      this.forcedDraw(2, this.currentPlayer);
      break;
    }
    case 'WildDraw': {
      this.nextTurn();
      // force the next player to draw 2 cards
      this.forcedDraw(4, this.currentPlayer);
      break;
    }
    }
  }

  giveFeedback(k, v) {
    this.feedback.push({ k, v });
  }

  // returns list of players containing the information to update the board
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

  round() {
    return {
      startTime: this.startTime,
      endTime: this.endTime,
      seed: this.seed,
      winner: this.winner,
      feedback: this.feedback,
      log: this.actions,
    };
  }
}
module.exports = UnoSP;