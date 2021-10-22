export default class GameHandler {
  constructor(scene) {
    this.myTurn = null;
    this.currentTurn = null;
    this.availableMoves = [];

    this.isMyTurn = () => {
      return this.myTurn === this.currentTurn;
    };

    this.canPlay = (card) => {
      if (this.isMyTurn()) {
        let cardToSearchInMoves = card;
        // If the card is a wild one, the color and name won't match with moves
        // so we create a new card with the values that will match the one in moves
        if (card.type === 'WildDraw' || card.type === 'Wild') {
          cardToSearchInMoves = {
            name: `Blank_${card.type}`,
            color: 'Blank',
            type: card.type,
          };
        }
        return this.availableMoves.filter(
          move =>
            move.name === cardToSearchInMoves.name &&
            move.color === cardToSearchInMoves.color &&
            move.type === cardToSearchInMoves.type,
        ).length > 0;
      }
    };

    this.setup = (myTurn, currentTurn, cards, discard) => {
      this.myTurn = myTurn;
      this.currentTurn = currentTurn;
      for (const card of cards) {
        scene.UIHandler.addCardPlayerHand(card);
      }
      scene.UIHandler.addCardDropZone(discard);
      scene.UIHandler.ready();
    };

    this.discardServer = (card) => {
      // if someone else plays a card, clear the UNO button
      this.clearUno();
      if (this.canPlay(card)) {
        // if it's my turn, make the card appear
        // on top of the discard pile
        scene.UIHandler.addCardDropZone(card);
      }
      else {
        // if it's not my turn, make the card move from the
        // player's name to the discard pile
        scene.UIHandler.addCardDropZone(
          card, 900, 50 + (this.currentTurn * 50),
        );
      }
    };
    this.discardClient = (card) => {
      // callback used when a wild card is discarded
      const discardCallBack = (choice) => {
        // enable the cards interactivity
        for (const c of scene.playerHandGroup.getChildren()) {
          c.setInteractive();
          scene.input.setDraggable(c);
        }
        // hide color picker
        scene.UIHandler.hideColorPicker();
        // send the discarded card to the server
        scene.SocketHandler.discard(choice);
      };
      if (card.type === 'Wild' || card.type === 'WildDraw' && card.color === 'Blank') {
        // show the color picker if it's a wild card
        // disable other cards usage when color picked visible
        for (const c of scene.playerHandGroup.getChildren()) {
          c.removeInteractive();
        }
        // show color picker
        scene.UIHandler.showColorPicker(card, discardCallBack);
      }
      else {
        // if it's not a wild card, discard it
        scene.SocketHandler.discard(card);
      }
    };
    this.sendUno = () => {
      scene.SocketHandler.sendUno();
    };

    this.draw = (cards) => {
      for (const card of cards) {
        scene.UIHandler.addCardPlayerHand(card);
      }
    };
    this.drawClient = () => {
      if (this.myTurn === this.currentTurn && this.availableMoves.includes('Draw')) {
        scene.SocketHandler.drawCard();
        scene.UIHandler.showButton('Pass', () => {
          scene.SocketHandler.pass();
          scene.UIHandler.hideButton();
        });
      }
    };
    this.uno = () => {
      if (this.isMyTurn() && scene.playerHandGroup.getChildren().length === 1) {
        scene.UIHandler.showButton('Uno!', () => {
          scene.SocketHandler.saidUno();
        });
      }
      else {
        scene.UIHandler.showButton('Contest uno!', () => {
          console.log('contest uno');
          scene.SocketHandler.contestUno();
        });
      }
    };
    this.clearUno = () => {
      scene.UIHandler.hideButton();
    };

    this.updateAvailableMoves = (availableMoves) => {
      this.availableMoves = availableMoves;
    };

    this.updateTurn = (turn) => {
      this.currentTurn = turn;
      scene.UIHandler.updateTurn(this.isMyTurn());
    };
    this.updatePlayersBoard = (board) => {
      scene.UIHandler.updatePlayersBoard(board);
    };
    this.win = (winner) => {
      scene.UIHandler.buildAlertBox(`${winner} ${scene.strings.end}`);
    };
    this.reset = () => {
      this.myTurn = null;
      this.currentTurn = null;
      this.availableMoves = [];
      scene.UIHandler.reset();
    };
    this.full = () => {
      scene.UIHandler.buildAlertBox(scene.strings.full);
      setTimeout(() => {
        window.history.go(-1);
      }
      , 3000);
    };
    this.disconnect = () => {
      scene.UIHandler.buildAlertBox(scene.strings.disconnected, null, null);
      setTimeout(() => {
        window.history.go(-1);
      }
      , 3000);
    };
  }
}