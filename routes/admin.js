// 管理员界面，在实现前端显示后在后端设计接口
var express = require('express');
var router = express.Router();
var model = require('../model');
var Company = model.Company;
var Area = model.Area;

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('首页查询公司信息...');
  Company.findOne()
  .then(function (company) {
    if(company === null) {
      res.render('admin', {title: '初始化'});
    } else {
      company.getAreas()
      .then(function (areas) {
        res.render('admin', { title: '管理员', company: company, areas: areas });
      });
    };
  })
  .catch(function (err) {
    console.log(err);
  })
});

router.get('/tree', function(req, res, next) {
  console.log('组织关系图···');
  res.render('tree', {title: '厂房分布图'})
})

module.exports = router;