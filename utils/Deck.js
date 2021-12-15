const seedrandom = require('seedrandom');

function createDeck() {
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
  // return shuffleCardsSeeded(cards, 1).slice(0, 20);
  return cards;
}

function shuffleCardsSeeded(array, seed) {
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

// shuffles an array of cards using the Dusternfeld shuffle algorithm
// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
function shuffleCards(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function dealCards(deck, discarded, cardsNumber, seed) {
  // console.log('dealing ' + cardsNumber + ' cards');
  if (cardsNumber > deck.length) {
    // console.log('not enough cards, reshuffling discard pile');
    // keep the last card from the discard pile
    const lastCard = discarded.pop();
    // shuffle the deck and the discard pile
    const clearedDiscard = discarded.map(c => decolorWildCard(c));
    const newDeck = shuffleCardsSeeded(
      [...deck, ...clearedDiscard],
      seed,
    );
    // clear old deck and add new deck
    deck.splice(0, deck.length, ...newDeck);
    // add the last card of the discard pile back to the discard pile
    discarded.splice(0, discarded.length, lastCard);
  }
  const cardsToDeal = deck.slice(0, cardsNumber);
  deck.splice(0, cardsNumber);
  return cardsToDeal;
}

function decolorWildCard(card) {
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


module.exports = {
  createDeck,
  shuffleCardsSeeded,
  shuffleCards,
  dealCards,
  decolorWildCard,
};