// 厂区区域模型
var db = require('../db');

module.exports = db.defineModel('factory', {
  name: {
    type: db.STRING(100),
    unique: true,
    comment: '厂区名'
  },
  info: {
    type: db.STRING(100),
    comment: '厂区信息'
  },
  polygonPath: {
    type: db.TEXT(),
    comment: '路径点集合，json格式'
  }
});