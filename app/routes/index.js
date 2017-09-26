var express = require('express');
var router = express.Router();
var Trouble = require('../db');

/* GET home page. */
router.get('/', function(req, res, next) {
  // 数据库中查询出内容
  Trouble.findAll().then(troubles => {
    var trouble = troubles[troubles.length - 1];
    var path = trouble.imagePath.split('\\').splice(1, 3).join('/');
    res.render('index', { title: '开发中的首页', imageDescription: trouble.troubleDescription, imagePath: path, Lng: trouble.Lng, Lat: trouble.Lat});
  })
  .catch(error => {
    console.log('数据库查询结果为空，显示默认内容')
    res.render('index', {title: '默认', imageDescription: '默认', imagePath: `example/example.jpg`, Lng:45.7137085949, Lat:126.6769766808})
  })
});

module.exports = router;
