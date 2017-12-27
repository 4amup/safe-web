var express = require('express');
var router = express.Router();
var model = require('../model');
var User = model.User;

/* GET users listing. */
router.get('/:user_id', function(req, res, next) {
  User.findById(req.params.user_id)
  .then(function(user) {
    res.render('user', {
      title: `${user.name}的个人主页`,
      user: user,
      locals: res.locals
    });
  });
});

module.exports = router;
