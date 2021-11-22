const Random = require('./random');
const RandomPlay = require('./randomPlay');
const Greedy = require('./greedy');
const GreedyMiniMax = require('./greedyMiniMax');

function create(roomUUID, difficulty, seed, deck) {
  switch (difficulty) {
  case 'Random':
    console.log('creating random player');
    return new Player(roomUUID, difficulty, seed, deck, Random.chooseAction);
  case 'RandomPlay':
    console.log('creating randomPlay player');
    return new Player(
      roomUUID, difficulty, seed, deck, RandomPlay.chooseAction,
    );
  case 'Greedy':
    console.log('creating greedy player');
    return new Player(roomUUID, difficulty, seed, deck, Greedy.chooseAction);
  case 'GreedyMiniMax':
    console.log('creating greedyMiniMax player');
    return new Player(
      roomUUID, difficulty, seed, deck, GreedyMiniMax.chooseAction,
    );
  default:
    break;
  }
}

const { io } = require('socket.io-client');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config.js');
const GameState = require('./gameState');

class Player {
  constructor(roomUUID, name, seed, deck, chooseAction) {
    this.name = name;
    this.chooseAction = chooseAction;

    this.gameState = new GameState(seed, deck, 0);

    console.log(this.gameState.deck.length);

    this.uuid = uuidv4();
    this.socket = io(config.HOSTNAME);
    this.socket.emit('join_room', roomUUID, name, 'Computer', this.uuid);

    /* this.socket.on('connect', () => {
      console.log(`Random player ${this.uuid} joined room ${this.roomUUID}`);
    }); */

    this.socket.on('setup', (myTurn, currentTurn) => {
      this.myTurn = myTurn;
      this.currentTurn = currentTurn;
    });

    this.socket.on('drew', () => {
      if (this.currentTurn !== this.myTurn) {
        this.drew = true;
      }
    });

    this.socket.on('discard', (card) => {
      if (this.currentTurn !== this.myTurn) {
        if (this.drew) {
          console.log('Player chose move: Draw_Play - ' + card.name);
          this.gameState = this.gameState.nextState({ type:'Draw_Play', card:card });
        }
        else {
          console.log('Player chose move: Play - ' + card.name);
          this.gameState = this.gameState.nextState({ type:'Play', card:card });
        }
        this.drew = false;
      }
    });

    this.socket.on('win', () => {
      console.log('someone won the game');
      this.end = true;
    });

    this.socket.on('current_turn', (turn) => {
      this.currentTurn = turn;

      if (this.end) {
        return;
      }

      if (this.currentTurn === this.myTurn) {
        // update gameState, previous player passed
        if (this.drew) {
          console.log('Player chose move: Draw_Pass');
          this.gameState = this.gameState.nextState({ type:'Draw_Pass' });
          this.drew = false;
        }

        const availableMoves = this.gameState.availableActions();
        const move = this.chooseAction(this.gameState, availableMoves);
        if (move.card) {
          console.log('Bot chose move: ' + move.type + ' - ' + move.card.name);
        }
        else {
          console.log('Bot chose move: ' + move.type);
        }

        setTimeout(() => {
          this.playMove(move);
        }, 1000);

        this.gameState = this.gameState.nextState(move);

        /* if (move.type === 'Draw_Play' || move.type === 'Draw_Pass') {
          const hand = this.gameState.hands[0];
          console.log(hand[hand.length - 1]);
        } */
      }
    });
  }

  playMove(move) {
    switch (move.type) {
    case 'Draw_Play':
      this.socket.emit('draw');
      this.socket.emit('discard', move.card);
      break;
    case 'Draw_Pass':
      this.socket.emit('draw');
      this.socket.emit('pass');
      break;
    case 'Play':
      this.socket.emit('discard', move.card);
      break;
    default:
      console.log('Unknown move type: ' + move.type);
    }
  }

  reset(seed, deck) {
    this.gameState = new GameState(seed, deck, 0);
    this.end = false;
  }

  leave() {
    // called by the object owner when the other player leaves
    // starts a 30 seconds timer and then disconnect, allowing the room to be deleted
    console.log('Bot: leaving in 30 seconds...');
    this.disconnectTimeout = setTimeout(() => {
      console.log('Bot: leaving');
      this.socket.disconnect();
    }, 30_000);
  }

  cancelLeave() {
    console.log('Bot: leaving canceled');
    clearTimeout(this.disconnectTimeout);
  }
}

module.exports = {
  create,
};