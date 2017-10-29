const fs = require('fs');
const db = require('./db');

let files = fs.readdirSync(__dirname + '/models');

let js_files = files.filter((f)=>{
  return f.endsWith('.js');
}, files);

module.exports = {};

for (var f of js_files) {
  console.log(`import model from file ${f}...`);
  var name = f.substring(0, f.length - 3);
  module.exports[name] = require(__dirname + '/models/' + f);
}

module.exports.sync = db.sync;