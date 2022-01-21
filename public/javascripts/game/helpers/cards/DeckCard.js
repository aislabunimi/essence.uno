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
    const scale = card.scale;
    card.on('pointerdown', () => {
      scene.GameHandler.drawClient();
      card.setScale(scale);
      // do stuff related to card draw from deck
      // scene.events.emit('cardClicked', card.rep);
    });
    card.on('pointerover', () => {
      if (scene.GameHandler.canDraw()) {
        card.setScale(card.scale + 0.02);
        card.once('pointerout', () => {
          card.setScale(scale);
        });
      }
    });

    return card;
  }
}