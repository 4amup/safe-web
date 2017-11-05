var db = require('../db');

module.exports = db.defineModel('company', {
  name: {
    type: db.STRING(100),
    unique: true,
    comment: '公司名'
  },
  info: {
    type: db.STRING(100),
    comment: '公司信息'
  },
  polygonPath: {
    type: db.TEXT(),
    comment: '路径点集合，json格式'
  }
});