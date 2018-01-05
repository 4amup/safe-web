var db = require('../db');

module.exports = db.defineModel('stride', {
  name: {
    type: db.STRING(100),
    comment: '跨-类似于城市意义中的街道'
  },
  polygonPath: {
    type: db.TEXT(),
    comment: '路径点集合，json格式'
  }
});