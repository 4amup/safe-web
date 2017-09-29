// 管理员界面，在实现前端显示后在后端设计接口
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('admin', { title: '超级管理者页面' });
});

module.exports = router;
