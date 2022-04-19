const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  req.session.language = 'en';
  res.render('survey', {
    layout: 'empty',
    styles: ['index.css', 'survey.css'],
    title: 'Survey',
  });
});

module.exports = router;
