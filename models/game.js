const config = require('../config/config.js');
const mongoose = require('mongoose');
const Round = require('./round');

const conn = mongoose.createConnection(config.MONGOURL);

const game = {
  roomid: String,
  users: [String],
  type: String,
  startTime: Date,
  endTime: Date,
  rounds: [Round],
};

const gameSchema = new mongoose.Schema(game);

gameSchema.statics.findByRoomId = function(roomid, cb) {
  return this.findOne({ roomid }, cb);
};
gameSchema.statics.insertNewGame =
  function(roomid, users, type, startTime, endTime, rounds, cb) {
    return this.create({ roomid, users, type, startTime, endTime, rounds }, cb);
  };
gameSchema.statics.createNewgame =
  function(roomid, users, type, startTime, endTime, rounds, _cb) {
    return { roomid, users, type, startTime, endTime, rounds };
  };

module.exports = {
  model: conn.model('Game', gameSchema),
  schema: gameSchema,
};

