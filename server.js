const config = require('./config/config.js');
const gameMongoose = require('./models/game.js');
const { v4: uuidv4 } = require('uuid');

const app = require('./app');
const port = config.PORT;

const Uno = require('./Uno');

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const io = require('socket.io')(server);
// routes can retrieve the socket object with req.app.get('socketio')
app.set('socketio', io);
const rooms = [];
app.set('rooms', rooms);

// timeout to contest +4
let contest4Timeout;

io.on('connection', (socket) => {
  // console.log('user connected:', socket.id);

  // variable to store room name
  let roomUUIDSocket = '';

  // handling create_room event
  socket.on('create_room', (roomName, maxPlayers) => {
    console.log(roomName, ': created for', maxPlayers, 'players');
    // check if rooms contains a room with name name
    if (rooms.find((room) => room.uuid === roomName)) {
      // if room already exists, don't create a new room
      console.log('room already exists');
      return;
    }
    // create a new room and add it to rooms array
    const roomUUID = uuidv4();
    const newRoom = {
      name: roomName,
      uuid: roomUUID,
      startTime: Date.now(),
      endTime: null,
      gamesPlayed: 0,
      players: 0,
      maxPlayers: maxPlayers,
      game: new Uno(
        roomUUID, maxPlayers, drawCallback,
        unoCallback, wild4ContestCallback, winCallback),
      rounds: [],
    };
    rooms.push(newRoom);
    socket.emit('room_created', newRoom.uuid);
  });

  socket.on('join_room', (roomUUID, name, surname, uuid) => {
    console.log(`${roomUUID}: joined by ${name} ${surname} (${uuid})`);
    // find room the user want to join
    const room = rooms.find((r) => r.uuid === roomUUID);
    if (room) {
      // user join room
      socket.join(roomUUID);
      // saving room name
      roomUUIDSocket = roomUUID;
      // updating number of players in the room
      room.players += 1;
      // update already connected players's board
      io.to(room.uuid).emit('update_board', room.game.getPlayersInfo());
      // check if user was already in the room
      if (room.game.isAlreadyPlaying(uuid)) {
        // send event to old socket to disconnect
        io.to(room.game.getPlayerUUID(uuid).socketId).emit('disconnected');
        // reconnect him to the room and set him up again
        const player = room.game.reconnectPlayer(socket.id, uuid);
        if (room.game.started) {
          setup(room.game, player);
          updateRoom(room);
        }
        return;
      }
      if (room.game.started) {
        // if the game has already started and the new
        // user wasn't already a player in that room,
        // disconnect him
        io.to(socket.id).emit('room_full');
        return;
      }
      // adding player to game
      room.game.addPlayer(socket.id, name, surname, uuid);
      if (room.game.isReady()) {
        // save the players uuids
        room.playersUUIDs = room.game.getPlayersUUID();
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
      console.log(roomUUID, 'does not exist');
      socket.emit('room_not_found');
    }
  });

  socket.on('discard', card => {
    // find the room the card was discarded in
    const room = rooms.find((r) => r.uuid === roomUUIDSocket);
    // telling other players which card was discarded
    io.to(room.uuid).emit('discard', card);
    // discarding the card
    room.game.discard(card);

    updateRoom(room);
  });

  socket.on('said_uno', () => {
    // disable waiting for said_uno and contest_uno event
    socket.removeAllListeners(['said_uno', 'contest_uno']);
    // tell the room that the uno event is done
    io.to(roomUUIDSocket).emit('clear_uno');
  });

  socket.on('contest_uno', () => {
    // disable waiting for said_uno and contest_uno event
    socket.removeAllListeners(['said_uno', 'contest_uno']);
    // tell the room that the uno event is done
    io.to(roomUUIDSocket).emit('clear_uno');
    // find the room the player was in
    const room = rooms.find((r) => r.uuid === roomUUIDSocket);
    // since the contest_uno message got here first, the player that has one card
    // needs to draw 2 card
    room.game.contestUno();
    updateRoom(room);
  });

  socket.on('contest_4', (contesting) => {
    if (contest4Timeout) {
      // if the contest_4 event is called before the timeout,
      // clear the timeout
      clearTimeout(contest4Timeout);
      // find the room the player was in
      const room = rooms.find((r) => r.uuid === roomUUIDSocket);
      // contest4
      room.game.contest4(contesting);

      updateRoom(room);
    }
  });

  socket.on('draw', () => {
    // find the room the player that wants to draw is in
    const room = rooms.find((r) => r.uuid === roomUUIDSocket);
    // draw a card
    room.game.draw();

    updateRoom(room);
  });

  socket.on('pass', () => {
    // find the room the player that wants to pass is in
    const room = rooms.find((r) => r.uuid === roomUUIDSocket);
    // pass turn
    room.game.nextTurn();

    updateRoom(room);
  });

  socket.on('disconnect', () => {
    // console.log('user disconnected:', socket.id);
    // find room the user was in
    const room = rooms.find((r) => r.uuid === roomUUIDSocket);
    if (room) {
      // if room exists, remove player from room
      // room.game.removePlayer(socket.id);
      // update number of players in the room
      room.players -= 1;
      // update already connected players's board
      // io.to(room.uuid).emit('update_board', room.game.getPlayersInfo());
      // if the room is empty, delete it
      // set him as disconnected in the game
      room.game.disconnectPlayer(socket.id);
      // update players board
      io.to(room.uuid).emit('update_board', room.game.getPlayersInfo());
      // delete room if empty
      if (room.players === 0) {
        room.rounds.push(room.game.round());
        room.endTime = Date.now();
        console.log('Saving game data on db');
        gameMongoose.insertNewGame(
          room.uuid,
          room.playersUUIDs,
          room.startTime,
          room.endTime,
          room.rounds,
        );
        console.log(room.uuid, ': deleted');
        rooms.splice(rooms.indexOf(room), 1);
      }
      else {
        // if the room is not empty, reset the room
        // resetRoom(room);
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
  io.to(room.uuid).emit('current_turn', room.game.currentPlayer);
  // send the current player the moves they can do
  io.to(room.game.players[room.game.currentPlayer].socketId)
    .emit('available_moves', room.game.moves());
  // send the room the current board
  io.to(room.uuid).emit('update_board', room.game.getPlayersInfo());
}

function resetRoom(room) {
  // update room statistics
  room.gamesPlayed += 1;
  room.rounds.push(room.game.round());
  // reset the game
  room.game.reset();
  // send reset to all the players in the room
  io.to(room.uuid).emit('reset');
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
function drawCallback(socketId, newCards) {
  io.to(socketId).emit('draw', newCards);
}

function unoCallback(roomUUID) {
  // tell the room that one players has one card
  io.to(roomUUID).emit('uno');
}

function wild4ContestCallback(roomUUID, socketId) {
  // tell the next player that they can contest the wild 4
  io.to(socketId).emit('contest_draw_four');
  // if they doesn't answer in time, they will draw 4 cards
  contest4Timeout = setTimeout(() => {
    io.to(socketId).emit('clear_draw_four');
    const room = rooms.find((r) => r.uuid === roomUUID);
    room.game.contest4(false);
  }
  , 10000);
}

function winCallback(roomUUID, player) {
  // tell the room the winner
  io.to(roomUUID).emit('win', player);
  // after 5 seconds, reset the room
  setTimeout(() => {
    resetRoom(rooms.find((room) => room.uuid === roomUUID));
  }, 5000);
}