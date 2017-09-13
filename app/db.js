// 本文件作用
// 统一的模型，强迫所有Model都遵守同一个规范
const Sequelize = require('sequelize');
const uuid = require('uuid/v4');

console.log('init sequelize...');

var sequelize = new Sequelize('test', 'root', '8307', {
  host: 'localhost',
  dialect: 'mysql',
  pool: {
      max: 5,
      min: 0,
      idle: 10000
  }
});

const ID_TYPE = Sequelize.STRING(50);

// attributes是一个对象
function defineModel(name, attributes) {
  var attrs = {};

  // 以下for循环的if和else针对的是两种模型定义
  
  // else针对这种model
  // var Project = sequelize.define('project', {
  //   title: Sequelize.STRING,
  //   description: Sequelize.TEXT
  // })

  // if针对这种model
  // var Foo = sequelize.define('foo', {
  //   // instantiating will automatically set the flag to true if not set
  //   flag: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true},
  //   // default values for dates => current time
  //   myDate: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
  // })
  
  for (let key in attributes) {
    let value = attributes[key];
    if (typeof value === 'object' && value['type']) { // 如果值是个对象且对象有type属性
      value.allowNull = value.allowNull || false; // 就保留值的allowNull属性或设置为false
      attrs[key] = value;
    } else { // 如果值不是对象
      attrs[key] = {
        type: value, // 设置type为值
        allowNull: false
      };
    }
  }

  // 以下规定4种基本的键
  attrs.id = {
    type: ID_TYPE,
    primaryKey: true
  };
  attrs.createdAt = {
    type: Sequelize.BIGINT,
    allowNull: false
  };
  attrs.updatedAt = {
    type: Sequelize.BIGINT,
    allowNull: false
  };
  attrs.version = {
    type: Sequelize.BIGINT,
    allowNull: false
  };
  return sequelize.define(name, attrs, {
    tableName: name,
    timestamps: false,
    hooks: {
      // sequelize v4
      beforeCreate: instance => { //A hook that is run after creating a single instance
        let now = Date.now();
        console.log('will create entity...' + instance);
        !instance.id && (instance.id = generateId());

        instance.createdAt = now;
        instance.updatedAt = now;
        instance.version = 0;
      },
      // update操作，需要在option加上 individualHooks: true，让每个instance都update
      beforeUpdate: instance => { //A hook that is run before updating a single instance
        let now = Date.now();
        console.log('will update entity...');
        instance.updatedAt = now;
        instance.version++;
      }
    }
  });
}

const TYPES = ['STRING', 'INTEGER', 'BIGINT', 'TEXT', 'DOUBLE', 'DATEONLY', 'BOOLEAN'];

var exp = {
  defineModel: defineModel,
  sync: () => {
    // only allow create ddl in non-production environment:
    if (process.env.NODE_ENV !== 'production') {
      sequelize.sync({ force: true });
    } else {
      throw new Error('Cannot sync() when NODE_ENV is set to \'production\'.');
    }
  }
};

// 将Sequelize.type变成db.type
for (let type of TYPES) {
  exp[type] = Sequelize[type];
}

// 生成id唯一标识符函数
function generateId() {
  return uuid();
}

exp.ID = ID_TYPE;
exp.generateId = generateId;

module.exports = exp;