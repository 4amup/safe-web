var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '开发中的首页', troubleTitle:'troubletitle', imagePath: 'example/image-1505528928463.jpg', imageDescription:'问题的描述'});
});

module.exports = router;
