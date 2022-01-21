export default class SocketHandler {
  constructor(scene) {
    // opening socket
    this.socket = io();

    // joining room
    console.log(
      `joining room ${scene.roomUUID}, with name ${scene.user.name} ${scene.user.surname}`,
    );
    this.socket.emit('join_room', scene.roomUUID, scene.user.name, scene.user.surname, scene.user.uuid);
    this.socket.on('room_not_found', () => {
      // go back to lobby
      window.location = document.referrer;
    });

    this.socket.on('setup', (myTurn, currentTurn, cards, discard, hasDrawn, isSurvey) => {
      scene.GameHandler.setup(myTurn, currentTurn, cards, discard, hasDrawn, isSurvey);
    });
    this.socket.on('discard', (card) => {
      scene.GameHandler.discardServer(card);
    });
    this.socket.on('contest_draw_four', () => {
      scene.GameHandler.contestDrawFour();
    });
    this.socket.on('clear_draw_four', () => {
      scene.GameHandler.clearDrawFour();
    });
    this.socket.on('draw', cards => {
      scene.GameHandler.draw(cards);
    });
    this.socket.on('current_turn', (currentTurn) => {
      scene.GameHandler.updateTurn(currentTurn);
    });
    this.socket.on('update_board', (board) => {
      scene.GameHandler.updatePlayersBoard(board);
    });
    this.socket.on('available_moves', (availableMoves) => {
      scene.GameHandler.updateAvailableMoves(availableMoves);
    });
    this.socket.on('win', (winner) => {
      scene.GameHandler.win(winner);
    });
    this.socket.on('uno', () => {
      scene.GameHandler.uno();
    });
    this.socket.on('clear_uno', () => {
      scene.GameHandler.clearUno();
    });
    this.socket.on('reset', () => {
      scene.GameHandler.reset();
    });
    this.socket.on('room_full', () => {
      scene.GameHandler.full();
    });
    this.socket.on('survey_game_done', () => {
      scene.GameHandler.surveyGameDone();
    });
    this.socket.on('disconnected', () => {
      scene.GameHandler.disconnect();
    });
  }
  discard(card) {
    this.socket.emit('discard', card);
  }
  drawCard() {
    this.socket.emit('draw');
  }
  saidUno() {
    this.socket.emit('said_uno');
  }
  pass() {
    this.socket.emit('pass');
  }
  contestUno() {
    this.socket.emit('contest_uno');
  }
  contest4(bool) {
    this.socket.emit('contest_4', bool);
  }
  feedback(k, v) {
    this.socket.emit('feedback', k, v);
  }
}