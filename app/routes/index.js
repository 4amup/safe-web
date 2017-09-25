var express = require('express');
var router = express.Router();

/* GET home page. */

// 数据库查询数据，将数据传递到首页视图
var Trouble = require('../db');
Trouble.findAll().then(function(troubles){
  console.log(troubles);
})

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
