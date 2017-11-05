var db = require('../db');

module.exports = db.defineModel('department', {
  name: {
    type: db.STRING(100),
    unique: true,
    comment: '部门'
  },
  info: {
    type: db.STRING(100),
    comment: '部门信息'
  },
  polygonPath: {
    type: db.TEXT(),
    comment: '路径点集合，json格式'
  }
});