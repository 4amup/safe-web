const model = require('./model.js');
model.sync.then(() => {
  console.log('数据表初始化成功');
  // 退出
  process.exit(0);
});

