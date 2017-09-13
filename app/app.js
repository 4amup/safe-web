var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var nunjucks = require('nunjucks');
var Sequelize = require('sequelize');

// 数据库实例
var mysqlOption = {
  host: 'localhost',
  dialect: 'mysql',
  port: 3306,

  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
}
var DB = new Sequelize('test', 'root', '8307', mysqlOption);
// 测试数据库连接情况
DB.authenticate()
  .then(function(err) {
    console.log('成功连接数据库');
  })
  .catch(function (err) {
    console.log('数据库连接错误：', err);
  });

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
nunjucks.configure('views', {
  autoescape: true,
  express: app
});
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'njk');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
