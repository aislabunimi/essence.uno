export default class ZoneHandler {
  constructor(scene) {
    // opening socket
    this.socket = io();

    // joining room
    console.log(
      `joining room ${scene.roomName}, with name ${scene.user.name} ${scene.user.surname}`,
    );
    this.socket.emit('join_room', scene.roomName, scene.user.name, scene.user.surname, scene.user.uuid);
    this.socket.on('room_not_found', () => {
      // go back to lobby
      window.history.back();
    });

    this.socket.on('setup', (myTurn, currentTurn, cards, discard) => {
      scene.GameHandler.setup(myTurn, currentTurn, cards, discard);
    });
    this.socket.on('discard', (card) => {
      scene.GameHandler.discardServer(card);
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
    this.socket.on('clearUno', () => {
      scene.GameHandler.clearUno();
    });
    this.socket.on('reset', () => {
      scene.GameHandler.reset();
    });
    this.socket.on('room_full', () => {
      scene.GameHandler.full();
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
}