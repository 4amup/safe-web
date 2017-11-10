var db = require('../db');

module.exports = db.defineModel('area', {
  name: {
    type: db.STRING(100),
    unique: true,
    comment: '厂房区域'
  },
  info: {
    type: db.STRING(100),
    comment: '厂房区域信息'
  },
  polygonPath: {
    type: db.TEXT(),
    comment: '路径点集合，json格式'
  }
});