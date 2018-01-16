var express = require('express');
var fs = require('fs');
var path = require('path');
var router = express.Router();
var model = require('../model');
var Trouble = model.Trouble;
var Company = model.Company;
var Factory = model.Factory;
var Department = model.Department;
var Workshop = model.Workshop;
var Stride = model.Stride;
var Area = model.Area;

// 构造组织机构的json数据
function updateJson2() {
  var json = {
    name: "init",
    id: null
  };

  Company.findAll({
    attributes: ['name', 'id']
  })
  .then(function(companys) {

    json.children = companys.map(function(value, index) {
      return {
        name: value.name,
        id: value.id,
      }
    });

    companys.forEach(function(value, findex) {
      var f = value;
      f.getDepartments()
      .then(function(departments) {
        json.children[findex].children = departments.map(function(value, index) {
          return {
            name: value.name,
            id: value.id,
          }
        });
        // 将json数据更新
        fs.writeFile(path.join(__dirname, '../public/data/organization.json'), JSON.stringify(json), 'utf-8', function(err) {
          if(err) {
            throw(err);
          }
          console.log('organization视图的json数据更新成功');
        });
      });
    });
  });
}

// 构造树图的json数据
function updateJson() {
  // 建立组织树的json数据
  var json = {
    name: "init",
    id: null
  };

  Factory.findAll({
    attributes: ['name', 'id']
  })
  .then(function(factorys) {

    json.children = factorys.map(function(value, index) {
      return {
        name: value.name,
        id: value.id,
      }
    });

    factorys.forEach(function(value, findex) {
      var f = value;
      f.getWorkshops()
      .then(function(workshops) {
        json.children[findex].children = workshops.map(function(value, index) {
          return {
            name: value.name,
            id: value.id,
          }
        });

        workshops.forEach(function(value, windex) {
          var w = value;
          w.getStrides()
          .then(function(strides) {
            json.children[findex].children[windex].children = strides.map(function(value, index) {
              return {
                name: value.name,
                id: value.id,
              }
            });

            strides.forEach(function(value, sindex) {
              var s = value;
              s.getAreas()
              .then(function(areas) {
                json.children[findex].children[windex].children[sindex].children = areas.map(function(value, index) {
                  return {
                    name: value.name,
                    id: value.id
                  }
                });
                // 将json数据更新
                fs.writeFile(path.join(__dirname, '../public/data/plant.json'), JSON.stringify(json), 'utf-8', function(err) {
                  if(err) {
                    throw(err);
                  }
                  console.log('plant视图的json数据更新成功');
                });
              })
            })
          });
        })
      });
    });
  });
}

// 添加一个调试json的路由
router.get('/data/plant', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../public/data/plant.json'));
});

router.get('/data/organization', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../public/data/organization.json'));
});

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

  Trouble.findAll()
  .then(troubles => {
    // 将处理后的数据传输到前端页面
    res.send(troubles);
  });
});

// ajax接收首页问题上传
router.post('/', function(req, res, next) {
  Trouble.create(req.body)
  .then(function(trouble) {
    res.send(trouble);
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
    updateJson2();
  })
});

// 修改公司信息
router.put('/company/:id', function(req, res, next) {
  Company.findById(req.params.id)
  .then(function(company) {
    company.update(req.body, {where: {id: company.id}})
    .then(function(company) {
      res.send(company);
      updateJson2();
    });
  });
});

// 删除公司
router.delete('/company/:id', function(req, res, next) {
  console.log(`api删除公司信息...`);
  Company.destroy({where: {id: req.params.id}})
  .then(() => {
    res.send(`delete company`);
    updateJson2();
  })
  .catch((err) => {
    console.log(err);
  });
});

// 增加部门信息
router.post('/company/:id', function (req, res, next) {
  req.body.companyId = req.params.id; // 设置关联
  Department.create(req.body)
  .then(function(department) {
    res.send(department);
    updateJson2();
  });
});

// 修改部门信息
router.put('/department/:id', function (req, res, next) {
  Department.findById(req.params.id)
  .then(function(department) {
    department.update(req.body, {where: {id: department.id}})
    .then(function(department) {
      res.send(department);
      updateJson2();
    });
  });
});

// 删除部门信息
router.delete('/department/:id', function(req, res, next) {
  console.log(`api删除部门信息...`);
  Department.destroy({where: {id: req.params.id}})
  .then(() => {
    res.send(`delete department`);
    updateJson2();
  })
  .catch((err) => {
    next(err);
  });
});

// 增加厂区信息
router.post('/factory', function(req, res, next) {
  Factory.create(req.body)
  .then(function(factory) {
    console.log(`建立了ID为${factory.id}的厂区`);
    res.send(factory);
    updateJson();
  });
});

// 修改厂区信息
router.put('/factory/:id',function(req, res, next) {
  console.log('准备修改厂区信息');
  Factory.findById(req.params.id)
  .then(function(factory) {
    factory.update(req.body)
    .then(function(factory) {
      res.send(factory);
      updateJson();
    })
    .catch(function(err) {
      next(err);
    });
  });
});

// 删除厂区信息
router.delete('/factory/:id', function(req, res, next) {
  console.log('准备删除厂区信息');
  Factory.destroy({
    where: {id: req.params.id}
  })
  .then(function() {
    console.log(`删除厂房节点成功`);
    Workshop.destroy({
      where: {FactoryId: req.params.id}
    })
    .then(function() {
      console.log(`删除厂房下的所有厂房节点成功`);
      res.send('删除厂区节点');
      updateJson();
    })
  })
  .catch(function(err) {
    next(err);
  });
});

// 增加厂房信息
router.post('/factory/:id', function(req, res, next) {
  console.log(`建立ID为${req.params.id}厂区下的厂房`);
  req.body.factoryId = req.params.id;
  Workshop.create(req.body)
  .then(function(workshop) {
    res.send(workshop);
    updateJson();
  });
});

// 修改厂房信息
router.put('/workshop/:id',function(req, res, next) {
  console.log('准备修改厂房信息');
  Workshop.findById(req.params.id)
  .then(function(workshop) {
    workshop.update(req.body)
    .then(function(workshop) {
      res.send(workshop);
      updateJson();
    })
    .catch(function(err) {
      next(err);
    });
  });
});

// 删除厂房信息
router.delete('/workshop/:id', function(req, res, next) {
  console.log('准备删除厂房信息');
  Workshop.destroy({
    where: {id: req.params.id}
  })
  .then(function() {
    console.log(`删除厂房节点成功`);
    Stride.destroy({
      where: {workshopId: req.params.id}
    })
    .then(function() {
      console.log(`删除厂房下的所有跨节点成功`);
      res.send('删除厂房节点');
      updateJson();
    })
  })
  .catch(function(err) {
    next(err);
  });
});

// 增加跨信息
router.post('/workshop/:id', function(req, res, next) {
  console.log(`建立ID为${req.params.id}厂房下的跨`);
  req.body.workshopId = req.params.id;
  Stride.create(req.body)
  .then(function(stride) {
    res.send(stride);
    updateJson();
  });
});

// 修改跨信息
router.put('/stride/:id',function(req, res, next) {
  console.log('准备修改厂区信息');
  Stride.findById(req.params.id)
  .then(function(stride) {
    stride.update(req.body)
    .then(function(stride) {
      res.send(stride);
      updateJson();
    })
    .catch(function(err) {
      next(err);
    });
  });
});

// 删除跨信息
router.delete('/stride/:id', function(req, res, next) {
  console.log('准备删除区域信息');
  Stride.destroy({
    where: {id: req.params.id}
  })
  .then(function() {
    console.log(`删除跨节点成功`);
    Area.destroy({
      where: {strideId: req.params.id}
    })
    .then(function() {
      console.log(`删除跨下的所有区域节点成功`);
      res.send('删除跨节点成功');
      updateJson();
    });
  })
  .catch(function(err) {
    next(err);
  });
});

// 增加区域信息
router.post('/stride/:id', function(req, res, next) {
  console.log(`建立ID为${req.params.id}跨下的区域`);
  req.body.strideId = req.params.id;
  Area.create(req.body)
  .then(function(area) {
    res.send(area);
    updateJson();
  });
});

// 修改区域信息
router.put('/area/:id',function(req, res, next) {
  console.log('准备修改厂区信息');
  Area.findById(req.params.id)
  .then(function(area) {
    area.update(req.body)
    .then(function(area) {
      res.send(area);
      updateJson();
    })
    .catch(function(err) {
      next(err);
    });
  });
});

// 删除区域信息
router.delete('/area/:id', function(req, res, next) {
  console.log('准备删除区域信息');
  Area.destroy({
    where: {id: req.params.id}
  })
  .then(function(area) {
    console.log(`删除区域节点成功`);
    res.send(`删除区域节点成功`);
    updateJson();
  })
  .catch(function(err) {
    next(err);
  });
});

module.exports = router;
