var express = require('express');
var router = express.Router();
var model = require('../model');
var Trouble = model.Trouble;

// 首页get请求
router.get('/', function(req, res, next) {
  Trouble.findAll()
  .then(troubles => {
    // 将处理后的数据传输到前端页面
    res.render('index', {
      title: '安全隐患追踪系统',
      troubles: troubles,
      locals: res.locals
    });
  });
});

module.exports = router;
