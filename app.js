var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var ExpressValidator = require('express-validator');
var localStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var multer = require('multer');
var flash = require('connect-flash');

// routes
var index = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// file upload handler
app.use(multer({dest: './public/images'}).any())

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// express sessions setup
app.use(session({
  secret: "mysecretkey",
  saveUninitialized: true,
  resave: true
}))
app.use(logger('dev'));
// passportjs setup
app.use(passport.initialize());
app.use(passport.session());

// express validator
app.use(ExpressValidator())

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// flash and express-messages setup
app.use(flash())
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.use('*', function(req, res, next){
  console.log(req.ip + " ********************************");
  res.locals.user = req.user || null;
  res.locals.cart_total = req.session.cart ? req.session.cart.length: 0;
  res.locals.isAdmin = req.session.isAdmin;
  next();
})

app.use('/', index);

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
  res.render('error', {title: "error", path: ''});
});

module.exports = app;
