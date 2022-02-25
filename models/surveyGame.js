const surveyGame = {
  number: Number,
  difficulty: String,
  start: Date,
  end: Date,
  won: Boolean,
  gaveUp: Boolean,
  length: Number,
  cardDeltas: [Number],
  timeDeltas: [Number],
};

module.exports = {
  model: null,
  schema: surveyGame,
};

