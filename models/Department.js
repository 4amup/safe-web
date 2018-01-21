// 部门模型，从属于公司
// 厂区区域模型
var db = require('../db');

module.exports = db.defineModel('department', {
  name: {
    type: db.STRING(100),
    unique: true,
    comment: '部门名'
  }
});