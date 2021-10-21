import Card from './Card.js';

export default class DeckCard extends Card {
  constructor(scene, cardname, x, y) {
    const card = super(scene, cardname, x, y);

    card.setInteractive();
    scene.input.setDraggable(card);

    // handle drag events for the card
    card.on('dragstart', () => {
      // do something only if the card is a card in the players hand
      if (scene.playerHandGroup.contains(card)) {
        // remove card from hand
        scene.playerHandGroup.remove(card);
        // rearrange other cards in hand
        scene.UIHandler.arrangeCardsInHand();
        // bring card forward
        card.setDepth(scene.playerHandGroup.getLength() + 1);
      }
    });

    card.on('drag', (_pointer, dragX, dragY) => {
      card.x = dragX;
      card.y = dragY;
    });

    card.on('dragenter', () => {
      if (scene.GameHandler.isMyTurn()) {
        if (scene.GameHandler.canPlay(card.rep)) {
          scene.UIHandler.tintGreen(card);
        }
        else {
          scene.UIHandler.tintRed(card);
        }
      }
    });

    card.on('dragleave', () => {
      if (scene.GameHandler.isMyTurn()) card.clearTint();
    });

    card.on('dragend', () => {
      scene.UIHandler.addCardPlayerHand(card.rep, card.x, card.y);
      card.destroy();
    });

    card.on('drop', () => {
      if (scene.GameHandler.canPlay(card.rep)) {
        scene.GameHandler.discardClient(card.rep);
        // scene.UIHandler.addCardDropZone(card.rep.name);
        card.destroy();
        // scene.SocketHandler.playCard(card.rep.name);
      }
      else {
        scene.UIHandler.addCardPlayerHand(card.rep, card.x, card.y);
        card.destroy();
      }
    });

    // handle pointerover and pointerout events for the card
    card.on('pointerover', () => {
      const yBefore = card.y;
      // const depth = card.depth;
      // card.setDepth(scene.playerHandGroup.getLength());
      card.y = yBefore - 50;
      card.once('pointerout', () => {
        // card.setDepth(depth);
        card.y = yBefore;
      });
    });

    return card;
  }
}