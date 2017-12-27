// 自定义的中间件
var model = require('../model');
var User = model.User;

// 将res.locals.user设置好
module.exports = function (req, res, next) {
  var uid = req.session.uid;
  if (!uid) return next();
  User.findById(uid)
  .then(function(user) {
    req.user = res.locals.user = user // 将用户数据输出到响应对象
  })
  .catch(function() {
    next(err)
  })
  next();
}