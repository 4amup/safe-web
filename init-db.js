var Trouble = require('./db');

// 同步数据表
Trouble.sync({force: true}).then(() => {
  console.log('数据表创建成功');
  // 退出
  process.exit(1);
});

