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

// 解析post请求，将解析内容写入数据库
router.post('/',upload.single('image'), function(req, res, next) {
  var location = genLacationInfo([45.710540, 126.672342], [45.718960, 126.682878]);
  // 处理一下path，将\处理成\/后返回
  Trouble.create({ 'imagePath': req.file.path, 'troubleDescription': req.body.description, 'Lng': location[0], 'Lat': location[1]});
  res.redirect('/');
});

// 模拟一个随机生成经纬度的函数
function genLacationInfo (x, y) { // x代表西南角坐标，y代表东北角坐标，形式是[Lng, Lat]，[纬度, 经度]
  var Lng = x[0] + Math.random() * (y[0] - x[0]);
  var Lat = x[1] + Math.random() * (y[1] - x[1]);
  return [Lng, Lat];
}

module.exports = router;
