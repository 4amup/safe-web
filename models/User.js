// 建立用户数据表
var db = require('../db');

module.exports = db.defineModel('user', {
  email: {
    type: db.STRING(100),
    unique: true,
    comment: '邮箱地址'
  },
  password: {
    type: db.STRING(100),
    comment: '密码'
  },
  name: {
    type: db.STRING(100),
    comment: '用户名'
  }
});