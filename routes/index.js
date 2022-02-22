const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  req.session.language = 'en';
  res.render('index', {
    layout:'empty',
    styles: ['index.css'],
    title:'Index',
    rooms: req.app.get('rooms').filter(room => room.type.includes('multiplayer')),
  });
});

module.exports = router;
