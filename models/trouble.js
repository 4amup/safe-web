// 建立问题数据表
var db = require('../db');

module.exports = db.defineModel('trouble', {
  imagePath: db.STRING,
  imageDescription: db.STRING,
  Lng: db.DECIMAL(12, 10), // 纬度
  Lat: db.DECIMAL(13, 10) // 经度
});