var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: 'public/example' }); // 规定文件储存位置
var model = require('../model');

// 解析post请求，将解析内容写入数据库
router.post('/',upload.single('image'), function(req, res, next) {
  var Trouble = model.Trouble;
  var trouble = Trouble.create({ 'imagePath': req.file.path, 'troubleDescription': req.body.description});
  res.redirect('/');
});

module.exports = router;
