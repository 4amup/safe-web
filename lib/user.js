var redis = require('redis');
var db = redis.createClient(); // 创建到Redis的长连接

module.exports = User; // 导出User函数

function User(obj) {
  for(var key in obj) { // 遍历传入的对象的键
    this[key] = obj[key]; // 将值合并
  }
}

// save实现
User.prototype.save = function (fn) {
  if (this.id) {
    this.update(fn);
  } else {
    var user = this;
    db.incr('user:ids', function(err, id) {
      if(err) return fn(err);
      user.id = id;
      user.hasPassword(function(err) {
        if(err) return fn(err);
        user.update(fn);
      })
    });
  }
};

// 改update实现
User.prototype.update = function (fn) {
  var user = this;
  var id = user.id;
  db.set('user:id:'+user.name, id, function (err) { // 使用名称索引用户ID
    if (err) return fn(err);
    db.hmset('user:'+id, user, function (err) { // 使用redis哈希存储数据
      fn(err);
    });
  });
};