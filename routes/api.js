var express = require('express');
var router = express.Router();
var model = require('../model');
var Trouble = model.Trouble;
var Company = model.Company;
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

// 首页数据传递
router.get('/', function (req, res, next) {
  // 数据库中查询出内容

  Trouble.findAll({
    attributes: ['id', 'imageDescription', 'imagePath', 'Lng', 'Lat']
  })
  .then(troubles => {
    if (troubles.length) {
      // troubles
      console.log(`共查询到${troubles.length}条问题，API数据提供正常`);
    } else {
      console.log('数据库查询结果为空，显示默认内容');
      // 默认数据格式
      var trouble = {
        imageDescription: '无数据，显示默认内容',
        imagePath: 'example/example.jpg',
        Lng: 45.716503,
        Lat: 126.678114
      }
      troubles.push(trouble);
    }
    // 将处理后的数据传输到前端页面
    res.send(troubles);
  })
});

// 首页提交数据
// 解析post请求，将解析内容写入数据库
router.post('/',upload.single('upImage'), function(req, res, next) {
  var location = req.body.location.split(',');
  // 处理一下path，将\处理成\/后返回
  Trouble.create({ 'imagePath': req.file.path.split('\\').splice(1, 3).join('/'), 'imageDescription': req.body.description, 'Lng': location[0], 'Lat': location[1]})
  .then(trouble => {
    console.log(`已将${trouble}数据添加到数据库中`);
    res.redirect('/');
  });
});

// 增加公司信息
router.post('/company', function(req, res, next) {
  Company.create(req.body)
  .then(function(company) {
    res.send(company);
  })
})

module.exports = router;
