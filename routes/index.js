var express = require('express');
var router = express.Router();

// 首页get请求
router.get('/', function(req, res, next) {
  res.render('index', { title: '开发中的首页' });
});

module.exports = router;
