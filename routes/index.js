var express = require('express');
var router = express.Router();
// 文件上传中间件配置
var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/example')
  },
  filename: function (req, file, cb) {
    var fileFormat = (file.originalname).split(".");
    cb(null, file.fieldname + '-' + Date.now() + "." + fileFormat[fileFormat.length - 1]);
  }
})
var upload = multer({ storage: storage }); // 规定文件储存位置

// 引入模型
var Trouble = require('../db')

// 首页get请求
router.get('/', function(req, res, next) {
  res.render('index', { title: '开发中的首页' });
});

module.exports = router;
