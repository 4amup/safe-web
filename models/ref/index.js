// 从属关系
var model = require('../../model')

var Company  = model.Company;
var Department  = model.Department;
var Factory = model.Factory;
var Stride = model.Stride;
var Area  = model.Area;
var User = model.User;

Company.hasMany(Department);
Department.belongsTo(Company);

Factory.hasMany(Stride);
Stride.hasMany(Area);
Area.belongsTo(Stride);
Stride.belongsTo(Factory);
Factory.belongsTo(Company);

Area.belongsTo(Department);
User.belongsTo(Department);

model.sequelize.sync();

console.log('关系创建完成');