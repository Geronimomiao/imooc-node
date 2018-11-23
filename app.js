var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var goods = require('./routes/goods')

var app = express();

// view engine setup
app.engine('html', require('express-art-template'))
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 登录拦截
app.use((req, res, next) => {
    if (req.cookies.userName) {
        next()  // 用户已经登录了 不进行拦截操作
    } else {
        if (req.originalUrl == '/users/login' || req.originalUrl == '/users/logout' || req.path == '/goods/list' || req.originalUrl == '/users/checkLogin') {
            next()
        } else {
            res.json({
                status: 10001,
                msg: '当前未登录',
                result: ''
            })
        }
    }
})

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/goods', goods);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
