var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var serverRouter = require('./routes/server');

var loadProject = require('./routes/load');
var saveProject = require('./routes/save');
var saveTemplate = require('./routes/admin_templates');

var loadAdmin = require('./routes/adminAuth');

var adminPanel = require('./routes/admin');
var profile = require('./routes/profile');

var deleteFile = require('./routes/delete');

var uploadFile = require('./routes/upload');
var loadFonts = require('./routes/fonts');
var loadBases = require('./routes/bases');
var testBlob = require('./routes/BlobTest');

var register = require('./routes/register');
var loadUser = require('./routes/login');
var onsession = require('./routes/onsession');
var userLogout = require('./routes/logout');

var app = express();

var session = require('express-session');

var Mongo = require('./modules/Mongo').init();
//var Users = require('./modules/Users');

var MClient = require('mongodb').MongoClient;
var assert = require('assert');

var Users = require('./modules/Users');

//Users.create( { name: "serehactka", password: "1", admin: true }, 'users', (data) => console.log(data));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: 'keyboard cat', cookie: {} }));

//app.use(express.session());
//app.use(express.static(path.join(__dirname, 'public')));

app.get('/bases', loadBases);
app.get('/fonts', loadFonts);
app.get('/delete', deleteFile);

app.get('/load', loadProject);
app.post('/save', saveProject);
app.post('/save/template', saveTemplate);

app.get('/logout', userLogout);
app.get('/onsession', onsession);
app.post('/login', loadUser);
app.post('/register', register);

app.post('/upload', uploadFile);
app.post('/test_blob', testBlob);

app.get('/admin', adminPanel);
app.get('/profile', profile);

app.get('/*', serverRouter);

//app.get('/', indexRouter);

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
  res.send('Not found ' + __dirname + req.url);
});

app.listen(3010);

module.exports = app;