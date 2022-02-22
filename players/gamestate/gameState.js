const seedrandom = require('seedrandom');
const Deck = require('../../utils/Deck');

class GameState {
  constructor(seed, deck, turn, hands, discarded, action) {
    this.deck = [...deck];
    this.seed = seed;
    this.turn = turn;
    this.action = action;
    this.rng = seedrandom(seed);
    this.currentRNG = this.rng();

    // deal cards for the 2 players
    if (!hands) {
      this.hands = [
        Deck.dealCards(this.deck, this.discarded, 7, this.seed),
        Deck.dealCards(this.deck, this.discarded, 7, this.seed),
      ];
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
        this.currentRNG = this.rng();
        this.deck = Deck.shuffleCardsSeeded([...this.deck], this.currentRNG);
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
        const draw = Deck.dealCards(this.deck, this.discarded, 1, this.seed);
        // add card to current player hand
        this.hands[this.turn].push(...draw);
        // progress turn
        this.turn = this.nextTurn();
        break;
      }
      case 'Draw_Play': {
        Deck.dealCards(this.deck, this.discarded, 1, this.seed);
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

  getAvailableActions() {
    if (this.isFinal()) return [];
    const hand = this.hands[this.turn];
    const discard = this.discarded[this.discarded.length - 1];
    const drawable =
      Deck.dealCards([...this.deck], [...this.discarded], 1, this.seed);
    const actions = [];
    // Play
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
    // Draw_Play
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

    // Draw_Pass
    actions.push({ type: 'Draw_Pass' });

    // plays.push(...hand.filter(card => this.cardIsPlayable(card, discard)));
    // actions.push(...plays.map(card => ({ type: 'Play', card })));
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
    // const value = -this.hands[0].length * a + this.hands[1].length * (1 - a);
    const value = this.hands[0].length - this.hands[1].length;
    return value;
  }

  isFinal() {
    return this.hands[0].length === 0 || this.hands[1].length === 0;
  }

  winner() {
    // the winner is the one with less cards
    if (this.hands[0].length < this.hands[1].length) {
      return 0;
    }
    else if (this.hands[0].length > this.hands[1].length) {
      return 1;
    }
    else {
      return -1;
    }
  }

  cardSpecialEffect(card) {
    switch (card.type) {
    case 'WildDraw': {
      // make the other player draw 4 cards
      const draw = Deck.dealCards(this.deck, this.discarded, 4, this.seed);
      this.hands[this.nextTurn()].push(...draw);
      // skip turn
      this.turn = this.nextTurn();
      break;
    }
    case 'Draw': {
      // make the other player draw 2 cards
      const draw = Deck.dealCards(this.deck, this.discarded, 2, this.seed);
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

  nextTurn(turn = this.turn) {
    return (turn + 1) % 2;
  }

}
module.exports = GameState;