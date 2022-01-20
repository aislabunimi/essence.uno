const config = require('./config/config');

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
// const logger = require('morgan');
const session = require('express-session');

const indexRouter = require('./routes/index');
const gameRouter = require('./routes/game');
const surveyRouter = require('./routes/survey');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// initialize session
app.use(session({
  secret: config.COOKIE_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: {
    // solves warnings with https
    sameSite: 'strict',
    // this allows me to read the cookie from the client
    // so that I can reuse the session id as user id
    httpOnly: false,
  },
  name: 'uuid',
}));

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules', 'phaser', 'dist')));

app.use('/', indexRouter);
app.use('/game', gameRouter);
app.use('/survey', surveyRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
