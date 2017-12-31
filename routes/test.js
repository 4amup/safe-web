var express = require('express');
var router = express.Router();

router.get('/testmarker', function(req, res, next) {
  res.render('test_edit_polygon.html');
});

module.exports = router;