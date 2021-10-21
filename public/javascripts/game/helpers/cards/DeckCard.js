import Card from './Card.js';

export default class DeckCard extends Card {
  constructor(scene, x, y) {
    const cardRep = {
      name: 'Blank_Deck',
      type: 'Deck',
      color: 'Blank',
    };
    const card = super(scene, cardRep, x, y);

    card.setInteractive();
    card.on('pointerdown', () => {
      scene.GameHandler.drawClient();
      // do stuff related to card draw from deck
      // scene.events.emit('cardClicked', card.rep);
    });

    return card;
  }
}