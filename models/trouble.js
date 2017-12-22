// 建立问题数据表
var db = require('../db');

module.exports = db.defineModel('trouble', {
  troubleDescription: {
    type: db.STRING,
    comment: '问题描述'
  },
  troubleDate: {
    type: db.STRING,
    comment: '问题发现日期'
  },
  troubleTime: {
    type: db.STRING,
    comment: '问题发现时间'
  },
  troubleArea: {
    type: db.STRING,
    comment: '问题发现单位，和位置信息相关'
  },
  renovationText: {
    type: db.STRING,
    comment: '整改措施描述',
    allowNull: true
  },
  renovationDate: {
    type: db.STRING,
    comment: '整改日期',
    allowNull: true
  },
  renovationTime: {
    type: db.STRING,
    comment: '整改时间',
    allowNull: true
  },
  renovationStatus: {
    type: db.STRING,
    comment: '问题状态，是否整改'
  },
  // 除表单中的属性，自定义的部分属性
  Markerposition: {
    type: db.STRING,
    comment: '数组形式储存经纬度坐标'
  },
  troubleImagesPath: {
    type: db.STRING,
    comment: '问题图片路径数组',
  },
  renovationImagesPath: {
    type: db.STRING,
    comment: '整改图片路径数组',
    allowNull: true
  }
});