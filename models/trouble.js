// 建立问题数据表
var db = require('../db');

module.exports = db.defineModel('trouble', {
  imagePath: {
    type: db.STRING,
    comment: '图片路径'
  },
  imageDescription: {
    type: db.STRING,
    comment: '问题描述'
  },
  Lng: {
    type: db.DECIMAL(12, 10),
    comment: '问题点纬度值'
  },
  Lat: {
    type: db.DECIMAL(13, 10),
    comment: '问题点经度值'
  }
});