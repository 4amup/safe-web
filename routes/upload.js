var express = require('express');
var router = express.Router();
// 文件上传中间件配置
var multer = require('multer');
// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'public/example')
//   },
//   filename: function (req, file, cb) {
//     var fileFormat = (file.originalname).split(".");
//     cb(null, file.fieldname + '-' + Date.now() + "." + fileFormat[fileFormat.length - 1]);
//   }
// })
// var upload = multer({ storage: storage }); // 规定文件储存位置
var upload = multer({ dest: 'public/example' })
// 引入模型
var Trouble = require('../db')

// 解析post请求，将解析内容写入数据库
router.post('/',upload.single('demo-file'), function(req, res, next) {
  var location = req.body.location.split(',');
  // 处理一下path，将\处理成\/后返回
  Trouble.create({ 'imagePath': req.file.path.split('\\').splice(1, 3).join('/'), 'imageDescription': req.body.description, 'Lng': location[0], 'Lat': location[1]})
  .then(trouble => {
    console.log(`${ trouble }数据没有已经插入数据库中了`);
    res.redirect('/');
  });
});

// 模拟一个随机生成经纬度的函数
function genLacationInfo (x, y) { // x代表西南角坐标，y代表东北角坐标，形式是[Lng, Lat]，[纬度, 经度]
  var Lng = x[0] + Math.random() * (y[0] - x[0]);
  var Lat = x[1] + Math.random() * (y[1] - x[1]);
  return [Lng, Lat];
}

module.exports = router;
