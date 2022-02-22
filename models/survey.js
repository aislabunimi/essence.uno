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
  // get the survey
  return this.findOne({ surveyid }, (err, surveyDb) => {
    if (err) {
      return cb(err);
    }
    // update the survey
    surveyDb.lastupdate = lastupdate;
    // console.log('surveymodel: updating survey');
    // console.log(surveyDb);
    // update each question in the survey
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const questionId = question.id;
      const index = surveyDb.questions.findIndex(q => q.id === questionId);
      if (index === -1) {
        surveyDb.questions.push(question);
      }
      else {
        // console.log('surveymodel: array:');
        const answerArray = surveyDb.questions[index].answer;
        if (answerArray[answerArray.length - 1] !== question.answer[0]) {
          answerArray.push(question.answer[0]);
        }
        // console.log(surveyDb.questions[index].answer);
        // console.log(question.answer);
        // surveyDb.questions[index].answer.push(question.answer[0]);
      }
    }
    surveyDb.save((err, res) => {
      if (err) {
        console.log('surveymodel: error saving survey -> ' + err);
      }
      else {
        console.log('surveymodel: survey updated');
      }
    });
  });
};

surveySchema.statics.addGame = function(surveyid, game, cb) {
  // console.log('surveymodel: adding game to survey');
  return this.updateOne({ surveyid }, { $push: { games: game } }, (err, res) => {
    if (err) {
      console.log('surveymodel: error adding game to survey -> ' + err);
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

