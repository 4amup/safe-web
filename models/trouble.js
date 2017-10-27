// 建立问题数据表
module.exports = function (sequelize, DataTypes) {
  var Trouble = sequelize.define('trouble', {
    imagePath: {
      type: DataTypes.STRING
    },
    imageDescription: {
      type: DataTypes.STRING
    },
    Lng: { // 纬度
      type: DataTypes.DECIMAL(12, 10)
    },
    Lat: { // 经度
      type: DataTypes.DECIMAL(13, 10)
    }
  });

  return Trouble;
}
