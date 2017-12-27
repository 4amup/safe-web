// 自定义的中间件
var model = require('../model');
var User = model.User;

// 将res.locals.user设置好
module.exports = function (req, res, next) {
  var uid = req.session.uid
  if (!uid) return next()
  User.findById(uid, (err, user) => { // 从数据库中查找已经注册的用户的数据
    if (err) return next(err)
    req.user = res.locals.user = user // 将用户数据输出到响应对象上
    next()
  })
}