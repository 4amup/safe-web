// 公司模型，不是实体的地理位置，应包含部门，厂区应该由专门的Factory模型构建
var db = require('../db');

module.exports = db.defineModel('company', {
  name: {
    type: db.STRING(100),
    unique: true,
    comment: '公司名'
  },
  info: {
    type: db.STRING(100),
    comment: '公司简介'
  }
});