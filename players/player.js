const Random = require('./algorithms/Random');
const RandomPlay = require('./algorithms/RandomPlay');
const Greedy = require('./algorithms/Greedy');
const GreedyMiniMax = require('./algorithms/GreedyMiniMax');
const GreedyMiniMax2 = require('./algorithms/GreedyMiniMax2');
const ABMM = require('./algorithms/ABMM');
const ABMMT = require('./algorithms/ABMMT');
const ABMMT2 = require('./algorithms/ABMMT2');
const ABMMT3 = require('./algorithms/ABMMT3');

const Evaluate = require('./gamestate/evaluate');

function create(roomUUID, difficulty, seed, deck) {
  switch (difficulty) {
  case 'Random':
    console.log('creating random player');
    return new Player(roomUUID, difficulty, seed, deck, new Random(seed));
  case 'RandomPlay':
    console.log('creating randomPlay player');
    return new Player(
      roomUUID, difficulty, seed, deck, new RandomPlay(seed),
    );
  case 'Greedy':
    console.log('creating greedy player');
    return new Player(roomUUID, difficulty, seed, deck, new Greedy(seed));
  case 'GreedyMiniMax':
    console.log('creating greedyMiniMax player');
    return new Player(
      roomUUID, difficulty, seed, deck, new GreedyMiniMax(seed, 5),
    );
  case 'GreedyMiniMax2':
    console.log('creating greedyMiniMax2 player');
    return new Player(
      roomUUID, difficulty, seed, deck, new GreedyMiniMax2(seed, 5),
    );
  case 'GreedyMiniMax2A1': {
    console.log('creating greedyMiniMax2A1 player');
    const algo = new GreedyMiniMax2(seed, 5, Evaluate.setAlpha(1));
    return new Player(
      roomUUID, difficulty, seed, deck, algo,
    );
  }
  case 'GreedyMiniMax2A075': {
    console.log('creating greedyMiniMax2A075 player');
    const algo = new GreedyMiniMax2(seed, 5, Evaluate.setAlpha(0.75));
    return new Player(
      roomUUID, difficulty, seed, deck, algo,
    );
  }
  case 'ABMMK04' : {
    console.log('creating ABMM player');
    const algo = new ABMM(seed, 5, Evaluate.setK(0.4));
    return new Player(
      roomUUID, difficulty, seed, deck, algo,
    );
  }
  case 'ABMMTK04' : {
    console.log('creating ABMMTK04 player');
    const algo = new ABMMT(seed, 5, Evaluate.setK(0.4), true, 500);
    return new Player(
      roomUUID, difficulty, seed, deck, algo,
    );
  }
  case 'ABMMT2K04' : {
    console.log('creating ABMMT2K04 player');
    const algo = new ABMMT2(seed, 5, Evaluate.setK(0.4), true, 500);
    return new Player(
      roomUUID, difficulty, seed, deck, algo,
    );
  }
  case 'ABMMT3K04' : {
    console.log('creating ABMMT3K04 player');
    const algo = new ABMMT3(seed, 5, Evaluate.setK(0.4), true, 500);
    return new Player(
      roomUUID, difficulty, seed, deck, algo,
    );
  }
  default:
    break;
  }
}

const { io } = require('socket.io-client');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config.js');
const GameState = require('./gamestate/gameState');

class Player {
  constructor(roomUUID, name, seed, deck, algorithm) {
    this.name = name;
    this.algorithm = algorithm;

    this.gameState = new GameState(seed, deck, 0);

    this.uuid = uuidv4();
    this.socket = io(config.HOSTNAME);
    this.socket.emit('join_room', roomUUID, name, 'Bot', this.uuid);

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

        let move = null;
        const result =
          this.algorithm.chooseAction(this.gameState);
        if (Array.isArray(result)) {
          move = result[0];
        }
        else {
          move = result;
        }
        if (move.card) {
          console.log('Bot chose move: ' + move.type + ' - ' + move.card.name);
        }
        else {
          console.log('Bot chose move: ' + move.type);
        }

        this.gameState = this.gameState.nextState(move);

        /* console.log('Bot hand clientside: ' + this.gameState.hands[0].map(c => c.name).join(', '));
        if (this.gameState.deck.length > 0) {
          console.log('deck clientside(' + this.gameState.deck.length + '): ' + this.gameState.deck[0].name);
        }
        else {
          console.log('deck clientside(' + this.gameState.deck.length + '): empty');
        } */

        setTimeout(() => {
          this.playMove(move);
        }, 1000);

        // console.log(this.gameState.deck.length);

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