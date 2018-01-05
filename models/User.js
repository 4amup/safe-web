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
  },
  role: {
    type: db.STRING(100),
    comment: '用户角色，即普通员工，安全员，分厂厂长，高层领导'
  },
  cellphone: {
    type: db.STRING(100),
    comment: '手机号'
  }
});