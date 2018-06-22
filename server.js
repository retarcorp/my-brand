var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var serverRouter = require('./routes/server');

var loadProject = require('./routes/load');
var saveProject = require('./routes/save');

var app = express();

var Mongo = require('./modules/Mongo').init();

var MClient = require('mongodb').MongoClient;
var assert = require('assert');

// var fs = require('fs');

//Mongo.delete({user: 'Sergey'}, 'uniq');

// fs.writeFile('test.json', JSON.stringify({ hello: 0, goodby: 1 }), 'utf8', () => {
// 	console.log('All written');
// });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', indexRouter);

app.get('/load', loadProject);
app.post('/save', saveProject);

app.get('/*', serverRouter);

// app.get('/**/*.css', function(req, res){
// 	res.sendFile(__dirname + req.url);
// });

// app.get('/**/*.js', function(req, res) {
// 	res.sendFile(__dirname + req.url);
// });

// app.get('/*.json', function(req, res) {
// 	res.sendFile(__dirname + req.url);
// });

// app.use('/users', usersRouter);

//console.log(routes);

//app.get('/', indexRouter);

// app.get('/', function(req, res) {
// 	res.send('hello');
// });

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