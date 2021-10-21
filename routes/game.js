const express = require('express');
const router = express.Router();

/* GET home page. */
router.post('/', function(req, res, next) {
  req.session.name = req.body.name;
  req.session.surname = req.body.surname;
  res.render('game', { layout: 'empty', title: 'Game' });
});
module.exports = router;
