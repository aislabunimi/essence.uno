const seedrandom = require('seedrandom');

class GameState {
  constructor(seed, deck, turn, hands, discarded, action) {
    this.deck = [...deck];
    this.seed = seed;
    this.turn = turn;
    this.action = action;

    // deal cards for the 2 players
    if (!hands) {
      this.hands = [this.dealCards(7), this.dealCards(7)];
    }
    else {
      this.hands = [];
      for (const hand of hands) {
        this.hands.push([...hand]);
      }
    }
    if (!discarded) {
      let firstDiscard = this.deck.shift();
      while (firstDiscard.type === 'WildDraw') {
        this.deck.unshift(firstDiscard);
        this.deck = this.shuffleCardsSeeded([...this.deck], this.seed);
        firstDiscard = this.deck.shift();
      }
      this.discarded = [firstDiscard];
    }
    else {
      this.discarded = [...discarded];
    }

    if (!action) {
      const discardedCard = this.discarded[0];
      this.discarded = [];
      this.hands[this.turn].push(discardedCard);
      this.action = { type: 'Play', card:discardedCard };
    }

    if (this.action) {
      switch (this.action.type) {
      case 'Draw_Pass': {
        const draw = this.dealCards(1);
        // add card to current player hand
        this.hands[this.turn].push(draw[0]);
        // progress turn
        this.turn = this.nextTurn();
        break;
      }
      case 'Draw_Play': {
        this.dealCards(1);
        // discard card
        this.discarded.push(this.action.card);
        // apply special card effects
        this.cardSpecialEffect(this.action.card);
        // progress turn
        this.turn = this.nextTurn();
        break;
      }
      case 'Play': {
        // remove card from player's hand
        const hand = this.hands[this.turn];
        const decoloredCard = this.decolorWildCard(this.action.card);
        const cardIndex = hand.findIndex(c => c.name === decoloredCard.name);
        hand.splice(cardIndex, 1);
        // discard card
        this.discarded.push(this.action.card);
        // apply special card effects
        this.cardSpecialEffect(this.action.card);
        // progress turn
        this.turn = this.nextTurn();
      }
      }
    }
  }

  availableActions() {
    if (this.isFinal()) return [];
    const hand = this.hands[this.turn];
    const discard = this.discarded[this.discarded.length - 1];
    const drawable = this.dealCards(1);
    const actions = [{ type: 'Draw_Pass' }];

    if (this.cardIsPlayable(drawable[0], discard)) {
      if (drawable[0].type === 'WildDraw' || drawable[0].type === 'Wild') {
        const colored = this.colorWildCard(drawable[0]);
        for (const card of colored) {
          actions.push({ type: 'Draw_Play', card: card });
        }
      }
      else {
        actions.push({ type: 'Draw_Play', card: drawable[0] });
      }
    }
    for (const card of hand) {
      if (card.type === 'WildDraw' || card.type === 'Wild') {
        const colored = this.colorWildCard(card);
        for (const c of colored) {
          actions.push({ type: 'Play', card: c });
        }
      }
      else if (this.cardIsPlayable(card, discard)) {
        actions.push({ type: 'Play', card: card });
      }
    }
    // plays.push(...hand.filter(card => this.cardIsPlayable(card, discard)));
    // actions.push(...plays.map(card => ({ type: 'Play', card })));
    this.deck.unshift(...drawable);
    // console.log(actions);
    return actions;
  }

  nextState(action) {
    return new GameState(
      this.seed,
      this.deck,
      this.turn,
      this.hands,
      this.discarded,
      action,
    );
  }

  eval() {
    const myScore = this.hands[0].length;
    const opponentScore = this.hands[1].length;
    return myScore - opponentScore;
  }

  isFinal() {
    return this.hands[0].length === 0 || this.hands[1].length === 0;
  }

  cardSpecialEffect(card) {
    switch (card.type) {
    case 'WildDraw': {
      // make the other player draw 4 cards
      const draw = this.dealCards(4);
      this.hands[this.nextTurn()].push(...draw);
      // skip turn
      this.turn = this.nextTurn();
      break;
    }
    case 'Draw': {
      // make the other player draw 2 cards
      const draw = this.dealCards(2);
      this.hands[this.nextTurn()].push(...draw);
      // skip turn
      this.turn = this.nextTurn();
      break;
    }
    case 'Skip': {
      // skip turn
      this.turn = this.nextTurn();
      break;
    }
    case 'Reverse': {
      // skip turn
      this.turn = this.nextTurn();
      break;
    }
    default: {
      // do nothing
    }
    }
  }

  // checks if a card is playable given the card and the discarded card
  cardIsPlayable(card, lastCard) {
    if (!card || !lastCard) return false;
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

  colorWildCard(card) {
    const colored = [];
    if (card.type === 'WildDraw' || card.type === 'Wild') {
      for (const color of ['Red', 'Green', 'Blue', 'Yellow']) {
        const newCard = {
          type: card.type,
          name: `${color}_${card.type}`,
          color: color,
        };
        colored.push(newCard);
      }
    }
    else {
      colored.push(card);
    }
    return colored;
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

  shuffleCardsSeeded(array, seed) {
    const rng = seedrandom(seed);
    let m = array.length;
    // While there remain elements to shuffle…
    while (m) {
      // Pick a remaining element…
      const i = Math.floor(rng() * m--);
      // And swap it with the current element.
      const t = array[m];
      array[m] = array[i];
      array[i] = t;
      ++seed;
    }
    return array;
  }

  dealCards(cardsNumber) {
    if (cardsNumber > this.deck.length) {
      // keep the last card from the discard pile
      const lastCard = this.discarded.pop();
      // shuffle the deck and the discard pile
      const clearedDiscard = this.discarded.map(c => this.decolorWildCard(c));
      this.deck = this.shuffleCardsSeeded(
        [...this.deck, ...clearedDiscard],
        this.seed,
      );
      // add the last card of the discard pile back to the discard pile
      this.discarded = [lastCard];
    }
    const cardsToDeal = this.deck.slice(0, cardsNumber);
    this.deck.splice(0, cardsNumber);
    return cardsToDeal;
  }

  nextTurn(turn = this.turn) {
    return (turn + 1) % 2;
  }

}
module.exports = GameState;