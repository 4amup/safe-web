// 建立用户数据表
var db = require('../db');

module.exports = db.defineModel('user', {
  email: {
    type: db.STRING(100),
    unique: true
  },
  password: db.STRING(100),
  name: db.STRING(100)
});