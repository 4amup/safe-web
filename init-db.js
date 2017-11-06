const model = require('./model');

model.Department.belongsTo(model.Company);
model.Company.hasMany(model.Department);

model.sequelize.sync({force: true}).then(() => {
  console.log('数据表初始化完成');
  // 退出
  process.exit(0);
});