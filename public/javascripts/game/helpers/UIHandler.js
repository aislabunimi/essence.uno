import Card from './cards/Card.js';
import DeckCard from './cards/DeckCard.js';
import HandCard from './cards/HandCard.js';
import PlayedCard from './cards/PlayedCard.js';

const redCardColor = 0xea323c;
// const blueCardColor = 0x0098dc;
// const yellowCardColor = 0xffc825;
const greenCardColor = 0x33984b;
const greyColor = 0x999999;

export default class UIHandler {
  constructor(scene) {

    this.buildDropZone = () => {
      scene.dropZone = scene.add.zone(470, 300, 170, 230)
        .setRectangleDropZone(170, 230);
      // adding outline to dropzone
      /* const dropZoneOutline = scene.add.graphics();
      dropZoneOutline.lineStyle(4, 0xffffff);
      dropZoneOutline.strokeRect(
        scene.dropZone.x - scene.dropZone.width / 2,
        scene.dropZone.y - scene.dropZone.height / 2,
        scene.dropZone.width,
        scene.dropZone.height,
      ); */
      scene.dropGroup = scene.add.group();
    };

    this.buildPlayerArea = () => {
      scene.playerHandGroup = scene.add.group();
    };

    this.buildDeckArea = () => {
      scene.deckArea = scene.add.rectangle(250, 300, 170, 230);
      // scene.deckArea.setStrokeStyle(3, greenCardColor);
      scene.deckArea.card =
        new DeckCard(scene, scene.deckArea.x, scene.deckArea.y);
    };

    this.buildPlayersBoard = () => {
      scene.PlayersBoardGroup = scene.add.group();
    };

    this.updatePlayersBoard = (players) => {
      // TODO: fix this mess
      scene.PlayersBoardGroup.clear(true, true);
      for (const player of players) {
        let playerText = `${player.name} ${player.surname}, 🎴: ${player.hand}, 🏆: ${player.wins}`;
        if (scene.GameHandler.currentTurn === player.turn) {
          playerText = '▶' + playerText;
        }
        // if editing this x,y values, make sure to update the x,y
        // values in GameHandler.discardServer
        const text = scene.add.text(
          700,
          50 + (player.turn * 50),
          playerText,
          { fontStyle: 'bold', fontSize: '20px', fill: '#FFFFFF' },
        );
        if (!player.connected) {
          this.tintRed(text);
        }
        scene.PlayersBoardGroup.add(text);
      }
    };

    this.buildAlertBox = (text, accept, refuse, timeout) => {
      if (this.alertBoxGroup) this.alertBoxGroup.clear(true, true);
      this.alertBoxGroup = scene.add.group();
      const background = scene.add.image(
        600,
        500,
        'Blank_Background',
      );
      this.alertBoxGroup.add(background);
      const alertBoxText = scene.add.text(
        background.x + 10,
        background.y,
        text,
        { fontStyle: 'bold', fontSize: '50px', fill: '#000000', align: 'center', wordWrap: { width: 550 } },
      );
      alertBoxText.setOrigin(0.5, 0.5);
      let timeoutVar = null;
      if (timeout) {
        timeoutVar = setTimeout(() => {
          this.alertBoxGroup.clear(true, true);
          if (refuse) {
            refuse();
          }
        }, timeout);
      }
      this.alertBoxGroup.add(alertBoxText);
      if (accept) {
        const acceptButton = scene.add.image(
          background.x + 1 / 3 * background.width,
          background.y + 3 / 6 * background.height,
          'Green_Okay',
        ).setScale(0.2);
        this.alertBoxGroup.add(acceptButton);
        acceptButton.setInteractive();
        acceptButton.on('pointerdown', () => {
          if (timeout) clearTimeout(timeoutVar);
          this.hideAlertBox();
          accept();
        });
      }
      if (refuse) {
        const refuseButton = scene.add.image(
          background.x - 1 / 3 * background.width,
          background.y + 3 / 6 * background.height,
          'Red_No',
        ).setScale(0.2);
        this.alertBoxGroup.add(refuseButton);
        refuseButton.setInteractive();
        refuseButton.on('pointerdown', () => {
          if (timeout) clearTimeout(timeoutVar);
          this.hideAlertBox();
          refuse();
        });
      }
      const maxDepth = Math.max(
        scene.dropGroup.countActive(),
        scene.playerHandGroup.countActive());
      this.alertBoxGroup.setDepth(maxDepth + 1);
    };
    this.hideAlertBox = () => {
      this.alertBoxGroup.clear(true, true);
    };

    this.buildUI = () => {
      this.buildDropZone();
      this.buildPlayerArea();
      this.buildDeckArea();
      this.buildPlayersBoard();
      // this.buildWaitingForPlayers();
      this.buildAlertBox(scene.strings.waiting);
      // this.showUnoButton();
    };

    this.addCardPlayerHand =
      (cardName, x = scene.deckArea.x, y = scene.deckArea.y) => {
        const card = new HandCard(scene, cardName, x, y);
        if (!scene.GameHandler.isMyTurn()) this.tintGrey(card);
        scene.playerHandGroup.add(card);
        this.arrangeCardsInHand();
      };

    this.arrangeCardsInHand = () => {
      scene.playerHandGroup.children.iterate(function(card, i) {
        card.setDepth(i);
        const coordinates =
          this.setHandCoordinates(i, scene.playerHandGroup.getLength());
        scene.tweens.add({
          targets: card,
          rotation: coordinates.r,
          x: coordinates.x,
          y: coordinates.y,
          // displayWidth: gameOptions.cardWidth / 2,
          // displayHeight: gameOptions.cardHeight / 2,
          duration: 150,
        });
      }, this);
    };

    this.setHandCoordinates = (n, totalCards) => {
      const rotation = Math.PI / 32 / totalCards * (n - ((totalCards - 1) / 2));
      const spacing = Math.PI / 4 / totalCards * (n - ((totalCards - 1) / 2));
      const xPosition = 500 - 1000 * Math.cos(spacing + Math.PI / 2);
      const yPosition = 1000 - 300 * Math.sin(spacing + Math.PI / 2);
      // console.log(n, totalCards, xPosition, yPosition, rotation);
      return {
        x: xPosition,
        y: yPosition,
        r: rotation,
      };
    };

    this.addCardDropZone =
      (cardName, fromX = scene.dropZone.x, fromY = scene.dropZone.y) => {
        const card = new PlayedCard(scene, cardName, fromX, fromY);
        scene.dropGroup.add(card);
        card.setScale(0);
        scene.tweens.add({
          targets: card,
          x: scene.dropZone.x,
          y: scene.dropZone.y,
          scale: 0.45,
          duration: 250,
        });
        return card;
      };

    this.showButton = (textContent, callback) => {
      if (this.buttonGroup) this.buttonGroup.clear(true, true);
      this.buttonGroup = scene.add.group();
      const button = scene.add.image(
        scene.deckArea.x,
        scene.deckArea.y + scene.deckArea.height - 50,
        'Blank_Background',
      );
      button.setScale(0.4, 0.2);
      button.setInteractive();
      button.on('pointerdown', () => {
        this.buttonGroup.clear(true, true);
        callback();
        // this.GameHandler.sendUno();
      });
      this.buttonGroup.add(button);
      const text = scene.add.text(
        button.x,
        button.y,
        textContent,
        { fontStyle: 'bold', fontSize: '20px', fill: '#000000', align: 'center' },
      );
      text.setOrigin(0.5, 0.5);
      this.buttonGroup.add(text);
    };
    this.hideButton = () => {
      if (this.buttonGroup) this.buttonGroup.clear(true, true);
    };

    this.showColorPicker = (card, discardCallback) => {
      // drop zone -> 470, 300, 170, 230
      // image size 562x388 scaled-> 169x117
      const colors = ['Red', 'Blue', 'Yellow', 'Green'];
      const coords = [
        { x: 400, y: 225 }, { x: 550, y: 225 },
        { x: 400, y: 400 }, { x: 550, y: 400 },
      ];
      scene.colorPickerGroup = scene.add.group();
      // create small cards to use as color picker for wild cards
      for (let i = 0; i < colors.length; i += 1) {
        const color = colors[i];
        const colorCard = new Card(
          scene,
          {
            name: `${color}_${card.type}`,
            type: card.type,
            color: color,
          },
          coords[i].x,
          coords[i].y,
        );
        colorCard.setScale(0.0);
        colorCard.setInteractive();
        colorCard.on('pointerdown', () => {
          discardCallback(colorCard.rep);
        });
        scene.colorPickerGroup.add(colorCard);
      }
      // add animation when showing color picker
      scene.tweens.add({
        targets: scene.colorPickerGroup.getChildren(),
        scale: 0.3,
        duration: 250,
      });
    };

    this.hideColorPicker = () => {
      // add animation to hide color picker
      scene.tweens.add({
        targets: scene.colorPickerGroup.getChildren(),
        scale: 0,
        duration: 250,
      });
      // clear color picker group
      scene.colorPickerGroup.clear(true, true);
    };

    this.updateTurn = (isMine) => {
      if (isMine) {
        // This is basically a clear tint for all cards
        // since there isn't a clearTint for groups.
        scene.playerHandGroup.setTint(0xffffff);
      }
      else {
        this.tintGrey(scene.playerHandGroup);
      }
    };

    this.ready = () => {
      // if (this.waitingForPlayers) this.waitingForPlayers.destroy();
      this.hideAlertBox();
      // scene.colorPickerGroup.clear(true, true);
    };

    this.reset = () => {
      scene.dropGroup.clear(true, true);
      scene.playerHandGroup.clear(true, true);
      this.buildAlertBox('Waiting for \nplayers...');
    };

    this.tintRed = (gameObject) => {
      gameObject.setTint(redCardColor);
    };

    this.tintGreen = (gameObject) => {
      gameObject.setTint(greenCardColor);
    };

    this.tintGrey = (gameObject) => {
      gameObject.setTint(greyColor);
    };
  }
}
