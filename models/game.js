const config = require('../config/config.js');
const mongoose = require('mongoose');
const Round = require('./round');

const conn = mongoose.createConnection(config.MONGOURL);

const gameSchema = new mongoose.Schema({
  roomid: String,
  users: [String],
  startTime: Date,
  endTime: Date,
  rounds: [Round],
});

gameSchema.statics.findByRoomId = function(roomid, cb) {
  return this.findOne({ roomid }, cb);
};
gameSchema.statics.insertNewGame =
  function(roomid, users, startTime, endTime, rounds, cb) {
    return this.create({ roomid, users, startTime, endTime, rounds }, cb);
  };

module.exports = conn.model('Game', gameSchema);

