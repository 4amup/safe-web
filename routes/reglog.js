var express = require('express');
var router = express.Router();

// 注册路由
router.get('/register', function(req, res, next) {
  res.send('这里是注册页面');
});

// 登录路由
router.get('/login', function (req, res, next) {
  res.send('这里是登录页面')
})

module.exports = router;
