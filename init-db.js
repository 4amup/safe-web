var { sequelize } = require("./db");

// 同步数据表
sequelize.sync({force: true}).then(() => {
  console.log('数据表初始化成功');
  // 退出
  process.exit(0);
});

