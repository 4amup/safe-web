var express = require('express');
var router = express.Router();
// 文件上传中间件配置
var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/public/example')
  },
  filename: function (req, file, cb) {
    var fileFormat = (file.originalname).split(".");
    cb(null, file.fieldname + '-' + Date.now() + "." + fileFormat[fileFormat.length - 1]);
  }
})
var upload = multer({ storage: storage }); // 规定文件储存位置
// 引入模型
var Trouble = require('../db')

// 解析post请求，将解析内容写入数据库
router.post('/',upload.single('image'), function(req, res, next) {
  Trouble.create({ 'imagePath': req.file.path+'.jpg', 'troubleDescription': req.body.description});
  res.redirect('/');
});

module.exports = router;
