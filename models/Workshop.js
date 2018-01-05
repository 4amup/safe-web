var db = require('../db');

module.exports = db.defineModel('workshop', {
  name: {
    type: db.STRING(100),
    comment: '厂房-类似于城市意义中的区'
  },
  polygonPath: {
    type: db.TEXT(),
    comment: '路径点集合，json格式'
  }
});