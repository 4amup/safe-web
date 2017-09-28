var Sequelize = require('sequelize');

// 数据库的配置相关
const sequelize = new Sequelize('test', 'root', '8307', {
  host: 'localhost',
  dialect: 'mysql',

  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },

});

// 测试数据库连接
sequelize
.authenticate()
.then(() => {
  console.log('数据库连接成功');
})
.catch(err => {
  console.error('数据库连接失败，错误代码：', err);
});

// 建立数据表
const Trouble = sequelize.define('trouble', {
  imagePath: {
    type: Sequelize.STRING
  },
  imageDescription: {
    type: Sequelize.STRING
  },
  Lng: { // 纬度
    type: Sequelize.DECIMAL(12, 10)
  },
  Lat: { // 经度
    type: Sequelize.DECIMAL(13, 10)
  }
});

module.exports = Trouble;