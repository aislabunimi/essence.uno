const config = require('../config/config');

const express = require('express');
const router = express.Router();

/* GET home page. */
router.post('/', function(req, res, next) {
  req.session.name = req.body.name;
  req.session.surname = req.body.surname;
  req.session.roomUUID = req.body.roomUUID;
  req.session.roomType = req.body.roomType;

  res.render('game', {
    layout: 'empty',
    styles: ['game.css'],
    title: 'Game',
    roomName: req.body.roomName,
    roomUUID: req.body.roomUUID,
    name: req.session.name,
    surname: req.session.surname,
    color: '#ffffff',
    jitsi: req.session.roomType == 'multiplayer_jitsi' ? true : false,
    jitsi_domain: config.JITSI_INSTANCE,
    cbacUrl: config.CBAC_HOSTNAME,
  });
});
module.exports = router;
