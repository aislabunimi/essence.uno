const app = require('./app');
const port = process.env.PORT || 3000;

const Uno = require('./Uno');

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const io = require('socket.io')(server);
// routes can retrieve the socket object with req.app.get('socketio')
app.set('socketio', io);
const rooms = [];
app.set('rooms', rooms);

io.on('connection', (socket) => {
  // console.log('user connected:', socket.id);

  // variable to store room name
  let roomNameSocket = '';

  // handling create_room event
  socket.on('create_room', (roomName, maxPlayers) => {
    console.log(roomName, ': created for', maxPlayers, 'players');
    // check if rooms contains a room with name name
    if (rooms.find((room) => room.name === roomName)) {
      // if room already exists, don't create a new room
      console.log('room already exists');
      return;
    }
    // create a new room and add it to rooms array
    rooms.push({
      name: roomName,
      players: 0,
      maxPlayers: maxPlayers,
      game: new Uno(
        roomName, maxPlayers, drawCallback,
        unoCallback, winCallback),
    });
  });

  socket.on('join_room', (roomName, name, surname) => {
    console.log(roomName, ': joined by', name, surname);
    // find room the user want to join
    const room = rooms.find((r) => r.name === roomName);
    if (room) {
      // user join room
      socket.join(roomName);
      // saving room name
      roomNameSocket = room.name;
      // adding player to game
      room.game.addPlayer(socket.id, name, surname);
      // updating number of players in the room
      room.players += 1;
      // update already connected players's board
      io.to(room.name).emit('update_board', room.game.getPlayersInfo());
      if (room.game.isReady()) {
        // if the room is full, start the game
        room.game.start();
        // setup game for all players
        for (const player of room.game.players) {
          setup(room.game, player);
        }
        // update room
        updateRoom(room);
      }
    }
    else {
      console.log(roomName, 'does not exist');
      socket.emit('room_not_found');
    }
  });

  socket.on('discard', card => {
    const room = rooms.find((r) => r.name === roomNameSocket);
    io.to(room.name).emit('discard', card);
    room.game.discard(card);

    updateRoom(room);
  });

  socket.on('said_uno', () => {
    // disable waiting for said_uno and contest_uno event
    socket.removeAllListeners(['said_uno', 'contest_uno']);
    // tell the room that the uno event is done
    io.to(roomNameSocket).emit('clearUno');
  });

  socket.on('contest_uno', () => {
    // disable waiting for said_uno and contest_uno event
    socket.removeAllListeners(['said_uno', 'contest_uno']);
    // tell the room that the uno event is done
    io.to(roomNameSocket).emit('clearUno');
    // find the room the player was in
    const room = rooms.find((r) => r.name === roomNameSocket);
    // since the contest_uno message got here first, the player that has one card
    // needs to draw 2 card
    room.game.contestUno();
    updateRoom(room);
  });

  socket.on('draw', () => {
    const room = rooms.find((r) => r.name === roomNameSocket);
    room.game.draw();

    updateRoom(room);
  });

  socket.on('pass', () => {
    const room = rooms.find((r) => r.name === roomNameSocket);
    room.game.nextTurn();
    updateRoom(room);
  });

  socket.on('disconnect', () => {
    // console.log('user disconnected:', socket.id);
    // find room the user was in
    const room = rooms.find((r) => r.name === roomNameSocket);
    if (room) {
      // if room exists, remove player from room
      room.game.removePlayer(socket.id);
      // update number of players in the room
      room.players -= 1;
      // update already connected players's board
      io.to(room.name).emit('update_board', room.game.getPlayersInfo());

      // if the room is empty, delete it
      if (room.players === 0) {
        console.log(room.name, ': deleted');
        rooms.splice(rooms.indexOf(room), 1);
      }
      else {
        // if the room is not empty, reset the room
        resetRoom(room);
      }
    }
  });
});

function setup(game, player) {
  // send the player the needed information to play
  io.to(player.socketId).emit('setup',
    player.turn,
    game.currentPlayer,
    player.hand,
    game.discarded[game.discarded.length - 1],
  );
}

function updateRoom(room) {
  // send the room the current turn
  io.to(room.name).emit('current_turn', room.game.currentPlayer);
  // send the current player the moves they can do
  io.to(room.game.players[room.game.currentPlayer].socketId)
    .emit('available_moves', room.game.moves());
  // send the room the current board
  io.to(room.name).emit('update_board', room.game.getPlayersInfo());
}

function resetRoom(room) {
  // reset the game
  room.game.reset();
  // send reset to all the players in the room
  io.to(room.name).emit('reset');
  // if the room is full, start the game
  if (room.game.isReady()) {
    // if the room is full, start the game
    room.game.start();
    // setup game for all players
    for (const player of room.game.players) {
      setup(room.game, player);
    }
    // update room
    updateRoom(room);
  }
}

// I use callbacks to allow Uno.js to use sockets while still having
// all sockets related functions in the same file
function drawCallback(playerId, newCards) {
  io.to(playerId).emit('draw', newCards);
}

function unoCallback(roomString) {
  // tell the room that one players has one card
  io.to(roomString).emit('uno');
}

function winCallback(roomString, player) {
  // tell the room the winner
  io.to(roomString).emit('win', player);
  // after 5 seconds, reset the room
  setTimeout(() => {
    resetRoom(rooms.find((room) => room.name === roomString));
  }, 5000);
}