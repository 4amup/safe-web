var express = require('express');
var router = express.Router();
var Trouble = require('../db');

/* GET home page. */
router.get('/', function(req, res, next) {
  // 数据库中查询出内容

  Trouble.findAll({
    attributes: ['id', 'imageDescription', 'imagePath', 'Lng', 'Lat']
  })
  .then(troubles => {
    if (troubles.length) {
      // troubles
      console.log('有查询内容，正常渲染');
      res.render('index', { title: '开发中的首页', troubles: troubles});
    } else {
      console.log('数据库查询结果为空，显示默认内容');

      // 默认数据格式
      var trouble = {
        imageDescription: '无数据，显示默认内容',
        imagePath:'example/example.jpg',
        Lng:45.7137085949,
        Lat:126.6769766808
      }
      troubles.push(trouble);
      res.render('index', { title: '开发中的首页', troubles: troubles});
    }
  })
});

module.exports = router;
