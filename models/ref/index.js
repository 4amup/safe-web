// 从属关系
var db = require('../../db');

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

db.sequelize.sync();