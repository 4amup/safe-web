// 管理员界面，在实现前端显示后在后端设计接口
var express = require('express');
var router = express.Router();
var model = require('../model');
var Company  = model.Company;

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('首页查询公司信息...')
  Company.findOne()
  .then(function (company) {
    company.getDepartments()
    .then(function (departments) {
      res.render('admin', { title: '管理员面板', company: company, departments: departments });
    });
  })
  .catch(function (err) {
    console.log(err);
  })
});

module.exports = router;
