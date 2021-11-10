const express = require('express');
const router = express.Router();

/* GET home page. */
router.post('/', function(req, res, next) {
  req.session.name = req.body.name;
  req.session.surname = req.body.surname;
  res.render('game', { 
    layout: 'empty', 
    style: 'game.css',
    title: 'Game', 
    roomName: req.body.roomName, 
    name: req.session.name, 
    surname: req.session.surname,
    color: "#ffffff",
    jitsi_domain: "meet.jit.si",
    cbacUrl: "https://cbac.aislab.di.unimi.it"
  });
});
module.exports = router;
