var express = require('express');
var router = express.Router();
var model = require('../model');
var Trouble = model.Trouble;
var Company = model.Company;
var Area = model.Area;
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

// ajax接收首页问题上传
router.post('/', function(req, res, next) {
  Trouble.create(req.body)
  .then(function(trouble) {
    res.send('创建问题成功')
  });
})

// 接收图片的ajax上传
router.post('/images',upload.array('images', 9), function(req, res, next) {
  res.send(req.files);
});

// 增加公司信息
router.post('/company', function (req, res, next) {
  Company.create(req.body)
  .then(function(company) {
    res.send(company);
  })
});

// 查公司信息
router.get('/company', function (req, res, next) {
  console.log('api查询公司信息...')
  Company.findOne()
  .then(function(company) {
    res.send(company);
  })
});

// 修改公司信息
router.put('/company/:id', function(req, res, next) {
  Company.findById(req.params.id)
  .then(function(company) {
    company.update(req.body, {where: {id: company.id}})
    .then(function(company) {
      res.send(company);
    });
  });
});

// 删除公司
router.delete('/company/:id', function(req, res, next) {
  console.log(`api删除公司信息...`);
  Company.destroy({where: {id: req.params.id}})
  .then(() => {
    res.send(`delete company`);
  })
  .catch((err) => {
    console.log(err);
  });
});

// 查公司对应的区域信息
router.get('/company/areas', function (req, res, next) {
  console.log(`api查询公司下属的部门信息...`);
  Company.findOne()
  .then(function (company) {
    if(company){
      company.getAreas()
      .then(function (areas) {
        res.send(areas);
      })
    } else {
      res.send(null);
    }
  })
});

// 增加区域信息
router.post('/company/:id/areas', function (req, res, next) {
  req.body.companyId = req.params.id; // 设置关联
  Area.create(req.body)
  .then(function(area) {
    res.send(area);
  });
});

// 修改区域信息
router.put('/company/areas/:id', function (req, res, next) {
  Area.findById(req.params.id)
  .then(function(area) {
    area.update(req.body, {where: {id: area.id}})
    .then(function(area) {
      res.send(area);
    });
  });
});

// 删除区域信息
router.delete('/company/areas/:id', function(req, res, next) {
  console.log(`api删除部门信息...`);
  Area.destroy({where: {id: req.params.id}})
  .then(() => {
    res.send(`delete area`);
  })
  .catch((err) => {
    console.log(err);
  });
});


module.exports = router;
