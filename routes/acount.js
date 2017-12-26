var express = require('express');
var router = express.Router();
var User = require('../model').User;

// 注册路由
router.get('/register', function(req, res, next) {
  res.render('register', { title: '注册页面'});
});

// 注册写数据库路由
router.post('/register', function(req, res, next) {
  User.create(req.body)
  .then(user => {
    console.log(`已经将${user}数据添加到数据库中`);
    console.log('注册成功，将跳转到登录页...');
    res.redirect('/login');
  });
});


// 登录路由
router.get('/login', function (req, res, next) {
  res.render('login', { title: '登录页面'});
});

// 登录认证
router.post('/login', function (req, res, next) {
  var email = req.body.email;
  var password = req.body.password;
  res.redirect('/');
})

module.exports = router;