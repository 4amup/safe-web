var express = require('express');
var router = express.Router();
var model = require('../model');
var Trouble = model.Trouble;

router.get('/:trouble_id', function(req, res, next) {
  Trouble.findById(req.params.trouble_id)
  .then((trouble) => {
    trouble.troubleImagesPath = JSON.parse(trouble.troubleImagesPath);
    trouble.renovationImagesPath = JSON.parse(trouble.renovationImagesPath);
    res.render('trouble', {
      title: trouble.troubleDescription,
      trouble: trouble
    });
  });
});

module.exports = router;