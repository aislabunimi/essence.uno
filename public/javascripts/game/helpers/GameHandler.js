export default class GameHandler {
  constructor(scene) {
    this.myTurn = null;
    this.currentTurn = null;
    this.availableMoves = [];
    this.survey = false;
    this.winner = null;
    this.turns = 0;
    this.myCards = 0;
    this.opponentCards = 0;
    this.cardDeltas = [];
    this.turnTimes = [];
    this.turnTime = null;
    this.startTime = null;
    this.contestUnoTimer = null;

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

    this.setup = (myTurn, currentTurn, cards, discard, hasDrawn, isSurvey) => {
      this.myTurn = myTurn;
      this.currentTurn = currentTurn;
      this.survey = isSurvey;
      scene.playerHandGroup.clear(true, true);
      for (const card of cards) {
        scene.UIHandler.addCardPlayerHand(card);
      }
      scene.UIHandler.addCardDropZone(discard);
      if (hasDrawn) {
        scene.UIHandler.showButton(scene.strings.pass, () => {
          scene.SocketHandler.pass();
          scene.UIHandler.hideButton();
        });
      }
      this.turnTime = new Date();
      this.startTime = new Date();
      scene.UIHandler.ready();
    };

    this.discardServer = (card) => {
      // if someone else plays a card, clear the UNO button
      this.clearUno();
      // if game is too long, add option to give up
      if (this.survey && this.turns > 25) {
        scene.UIHandler.showExtraButton(scene.strings.giveUp, () => {
          this.surveyGameDone();
          scene.UIHandler.hideExtraButton();
        });
      }

      if (this.canPlay(card)) {
        // if it's my turn, make the card appear
        // on top of the discard pile
        scene.UIHandler.addCardDropZone(card);
      }
      else {
        // if it's not my turn, make the card move from the
        // player's name to the discard pile
        scene.UIHandler.addCardDropZone(
          card,
          scene.PlayersBoardGroup.children.entries[this.currentTurn].x,
          scene.PlayersBoardGroup.children.entries[this.currentTurn].y,
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

    this.canDraw = () => {
      return this.myTurn === this.currentTurn && this.availableMoves.includes('Draw');
    };

    this.showDraw = (cardsNumber, drawer) => {
      if (drawer == this.myTurn) {
        return;
      }
      for (let i = 0; i < cardsNumber; i += 1) {
        setTimeout(() => {
          scene.UIHandler.showDraw(drawer);
        }, 100 * i);
      }
    };

    this.drawClient = () => {
      if (this.myTurn === this.currentTurn && this.availableMoves.includes('Draw')) {
        scene.SocketHandler.drawCard();
        scene.UIHandler.showButton(scene.strings.pass, () => {
          scene.SocketHandler.pass();
          scene.UIHandler.hideButton();
        });
      }
    };

    this.uno = () => {
      if (this.isMyTurn() && scene.playerHandGroup.getChildren().length === 1) {
        scene.UIHandler.showButton(scene.strings.uno, () => {
          scene.SocketHandler.saidUno();
        });
      }
      else {
        // after 2 seconds show the option to contestUno 
        this.contestUnoTimer = setTimeout(() => {
          scene.UIHandler.showButton(scene.strings.contestUno, () => {
            // console.log('contest uno');

            scene.SocketHandler.contestUno();
          });
        }, 2000);
      }
    };

    this.clearUno = () => {
      if (this.contestUnoTimer) {
        clearTimeout(this.contestUnoTimer);
        this.contestUnoTimer = null;
      }
      scene.UIHandler.hideButton();
    };

    this.contestDrawFour = () => {
      scene.UIHandler.buildAlertBox(
        scene.strings.contest4,
        () => {
          // console.log('contest 4: true');
          scene.SocketHandler.contest4(true);
        },
        () => {
          // console.log('contest 4: false');
          scene.SocketHandler.contest4(false);
        },
        10000,
      );
    };

    this.clearDrawFour = () => {
      scene.UIHandler.hideAlertBox();
    };

    this.updateAvailableMoves = (availableMoves) => {
      this.availableMoves = availableMoves;
    };

    this.updateTurn = (turn) => {
      this.turns += 1;
      // update total card difference
      this.cardDeltas.push(this.myCards - this.opponentCards);
      // add time difference between turns to turnTimes array
      const timeDelta = new Date() - this.turnTime;
      if (this.isMyTurn()) {
        this.turnTimes.push(timeDelta);
      }
      else {
        this.turnTimes.push(-timeDelta);
      }
      this.turnTime = new Date();

      this.currentTurn = turn;
      scene.UIHandler.updateTurn(this.isMyTurn());
    };

    this.updatePlayersBoard = (board) => {
      scene.UIHandler.updatePlayersBoard(board);
      if (this.survey) {
        const playerData = board.find(player => player.name === scene.user.name);
        if (playerData) {
          this.myCards = playerData.hand;
        }
        const opponentData = board.find(player => player.name !== scene.user.name);
        if (opponentData) {
          this.opponentCards = opponentData.hand;
        }
      }
    };

    this.win = (winner) => {
      scene.UIHandler.buildAlertBox(`${winner} ${scene.strings.end}`);
      this.winner = winner;
      setTimeout(() => {
        this.funFeedback();
      }, 5000);
    };

    this.funFeedback = () => {
      scene.UIHandler.hideAlertBox();
      scene.UIHandler.buildAlertBox(
        scene.strings.funFeedback,
        () => {
          scene.SocketHandler.feedback('fun', true);
          this.hardFeedback();
        },
        () => {
          scene.SocketHandler.feedback('fun', false);
          this.hardFeedback();
        },
        8000,
      );
    };

    this.hardFeedback = () => {
      scene.UIHandler.hideAlertBox();
      scene.UIHandler.buildAlertBox(
        scene.strings.hardFeedback,
        () => {
          scene.SocketHandler.feedback('hard', true);
          this.restartSoon();
        },
        () => {
          scene.SocketHandler.feedback('hard', false);
          this.restartSoon();
        },
        8000,
      );
    };

    this.restartSoon = () => {
      scene.UIHandler.hideAlertBox();
      scene.UIHandler.buildAlertBox(scene.strings.restartSoon);
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
        window.location = document.referrer;
      }
      , 3000);
    };

    this.surveyGameDone = () => {
      scene.UIHandler.buildAlertBox(scene.strings.surveyGameDone);
      const gameNumber = window.localStorage.getItem('gameNumber');
      window.localStorage.setItem('gameNumber', parseInt(gameNumber) + 1);
      // update cardDeltas
      this.cardDeltas.push(this.myCards - this.opponentCards);
      // update turnTimes
      const timeDelta = new Date() - this.turnTime;
      if (this.isMyTurn()) {
        this.turnTimes.push(timeDelta);
      }
      else {
        this.turnTimes.push(-timeDelta);
      }
      // update turn counter
      this.turns += 1;
      // create game and save to localStorage
      const games = window.localStorage.getItem('games');
      const game = {
        number: parseInt(gameNumber) + 1,
        start: this.startTime,
        end: new Date(),
        winner: this.winner,
        gaveUp: this.winner ? false : true,
        won: this.winner ? this.winner.trim() === scene.user.name.trim() ? true : false : false,
        length: this.turns,
        cardDeltas: this.cardDeltas,
        timeDeltas: this.turnTimes,
      };
      window.localStorage.setItem('games', JSON.stringify([...JSON.parse(games), game]));
      setTimeout(() => {
        window.location = document.referrer;
      }
      , 2000);
    };

    this.disconnect = () => {
      scene.UIHandler.buildAlertBox(scene.strings.disconnected, null, null);
      setTimeout(() => {
        window.location = document.referrer;
      }
      , 3000);
    };
  }
}