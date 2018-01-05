var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var nunjucks = require('nunjucks');
var session = require('express-session');
var model = require('./model')
// 引入路由文件
var index = require('./routes/index');
var users = require('./routes/users');
var api = require('./routes/api');
var admin = require('./routes/admin');
var account = require('./routes/account');
var trouble = require('./routes/trouble');
var test = require('./routes/test');

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
app.use(session({
  secret: 'test',
  cookie: {maxAge: 1000 * 60 * 5} // 过期时间五分钟，session依赖于cookie
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(require('./lib/user'));

//路由
app.use('/', index);
app.use('/users', users);
app.use('/', account);
app.use('/api', api);
app.use('/admin', admin);
app.use('/trouble', trouble);
app.use('/test', test);

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
