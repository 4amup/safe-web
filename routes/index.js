var express = require('express');
var router = express.Router();
var model = require('../model');
var Trouble = model.Trouble;

// 首页get请求
router.get('/', function(req, res, next) {
  Trouble.findAll({
    attributes: ['id', 'imageDescription', 'imagePath', 'Lng', 'Lat']
  })
  .then(troubles => {
    if (troubles.length) {
      // troubles
      console.log(`此次共查询到${troubles.length}条问题，左边列表部分正常渲染`);
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
    res.render('index', { title: '安全隐患追踪系统（Hidden Danger Tracker System）', troubles: troubles});
  })

});

module.exports = router;
