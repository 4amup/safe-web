var express = require('express');
var router = express.Router();
var User = require('../model').User;

// 注册路由
router.get('/register', function(req, res, next) {
  res.render('register', {
    title: '注册页面',
    locals: res.locals
  });
});

// 注册写数据库路由
router.post('/register', function(req, res, next) {
  var user = req.body;
  User.create(user)
  .then(function(user) {
    req.session.uid = user.id // 为认证保存uid
    console.log(`${user.name}注册成功，然后跳转到登录页`);
    res.redirect('/login');
  });
});

// 登录路由
router.get('/login', function (req, res, next) {
  res.render('login', {
    title: '登录页面',
    locals: res.locals
  });
});

// 登录认证
router.post('/login', function (req, res, next) {
  User.findOne({where: {email: req.body.email}})
  .then(user => {
    if(user.password === req.body.password) {
      req.session.uid = user.id;
      console.log(`${user.name}登录成功后跳转首页！`);
      res.redirect('/');
    }
    else {
      console.log('密码错误');
      res.redirect('back');
    }
  })
  .catch(() => {
    console.log('用户名不存在！');
    res.redirect('/register')
  });
});

// 登出
router.get('/logout', function(req, res, next) {
  req.session.destroy(function(err) {
    if(err) throw err;
    res.redirect('/');
  })
});

module.exports = router;