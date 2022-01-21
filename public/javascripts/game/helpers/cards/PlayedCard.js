import Card from './Card.js';

export default class PlayedCard extends Card {
  constructor(scene, name, x, y) {
    const card = super(scene, name, x, y);
    // randomly rotates the card a bit
    card.angle = Phaser.Math.Between(-10, 10);
  }
}