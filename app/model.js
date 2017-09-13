// 自动扫描并导入所有Model
const fs = require('fs');
const db = require('./db');

let files = fs.readdirSync(__dirname + '/models');

// 过滤掉不是js的文件
let js_files = files.filter((f)=>{
  return f.endsWith('.js');
}, files  //thisArg可选。执行 callback 时的用于 this 的值。
);

module.exports = {};

// 遍历models文件夹中的model，将文件名作为name，并以model.exports.name的形式导出
for (let f of js_files) {
  console.log(`import model from file ${f}...`);
  let name = f.substring(0, f.length - 3);
  module.exports[name] = require(__dirname + '/models/' + f);
}

// 导出sync方法
module.exports.sync = () => {
  db.sync();
};