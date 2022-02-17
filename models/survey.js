const config = require('../config/config.js');
const mongoose = require('mongoose');
const Game = require('./game').schema;
const Question = require('./question');

const conn = mongoose.createConnection(config.MONGOURL);

const survey = {
  surveyid: String,
  games: [Game],
  createtime: Date,
  lastupdate: Date,
  questions: [Question],
};

const surveySchema = new mongoose.Schema(survey);

surveySchema.statics.findById = async function(surveyid, cb) {
  return await this.findOne({ surveyid }, cb).exec();
};

surveySchema.statics.insertNewSurvey =
  function(surveyid, games, createtime, lastupdate, questions, cb) {
    return this.create({ surveyid, games, createtime, lastupdate, questions }, cb);
  };

surveySchema.statics.updateSurvey = function(surveyid, lastupdate, questions, cb) {
  return this.updateOne({ surveyid }, { lastupdate, questions }, (err, res) => {
    if (err) {
      console.log(err);
    }
    else {
      console.log('surveymodel: updated survey');
    }
  });
};

surveySchema.statics.addGame = function(surveyid, game, cb) {
  console.log('surveymodel: adding game to survey');
  return this.updateOne({ surveyid }, { $push: { games: game } }, (err, res) => {
    if (err) {
      console.log(err);
    }
    else {
      console.log('surveymodel: added game to survey');
    }
  });
};

module.exports = {
  model: conn.model('Survey', surveySchema),
  schema: surveySchema,
};

