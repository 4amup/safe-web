// 从属关系
var model = require('../../model')

var Company  = require('../Company')
var Department  = require('../Department')
var Factory  = require('../Factory')
var Stride  = require('../Stride')
var Area  = require('../Area')
var User = require('../User')

Company.hasMany(Department);
Department.belongsTo(Company);

Factory.hasMany(Stride);
Stride.hasMany(Area);
Area.belongsTo(Stride);
Stride.belongsTo(Factory);
Factory.belongsTo(Company);

Area.belongsTo(Department);
User.belongsTo(Department);

model.sequelize.sync('false');

console.log('关系创建完成');