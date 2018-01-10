var db = require('../db');

module.exports = db.defineModel('area', {
  name: {
    type: db.STRING(100),
    comment: '作业区'
  },
  polygonPath: {
    type: db.TEXT(),
    allowNull: true,
    comment: '路径点集合，json格式'
  }
});