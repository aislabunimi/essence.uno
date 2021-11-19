const config = require('../config/config.js');
const mongoose = require('mongoose');
const Round = require('./round');

const conn = mongoose.createConnection(config.MONGOURL);

const gameSchema = new mongoose.Schema({
  roomid: String,
  users: [String],
  type: String,
  startTime: Date,
  endTime: Date,
  rounds: [Round],
});

gameSchema.statics.findByRoomId = function(roomid, cb) {
  return this.findOne({ roomid }, cb);
};
gameSchema.statics.insertNewGame =
  function(roomid, users, type, startTime, endTime, rounds, cb) {
    return this.create({ roomid, users, type, startTime, endTime, rounds }, cb);
  };

module.exports = conn.model('Game', gameSchema);

