var express = require('express');
var router = express.Router();
var Trouble = require('../db');

// 在数据库中查询
(async () => {
  var troubles = await Trouble.findAll();
  console.log(troubles.length);

  let trouble = troubles[troubles.length - 1];

})();

/* GET home page. */
router.get('/', function(req, res, next) {
  Trouble.findAll().then(troubles => {
    if (troubles.length === 0) {
      res.render('index', {title: '默认', imageDescription: '默认', imagePath: `example/example.jpg`, Lng:45.7137085949, Lat:126.6769766808})
    } else {
      var trouble = troubles[troubles.length - 1];
      var path = trouble.imagePath.split('\\').splice(1, 3).join('/');
      res.render('index', { title: '开发中的首页', imageDescription: trouble.troubleDescription, imagePath: path, Lng: trouble.Lng, Lat: trouble.Lat});      
    }
  })
});

module.exports = router;
