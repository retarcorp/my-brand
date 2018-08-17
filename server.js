var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');

var indexRouter = require('./routes/index');
var serverRouter = require('./routes/server');

var loadProject = require('./routes/load');
var saveProject = require('./routes/save');
var saveTemplate = require('./routes/admin_templates');

var loadAdmin = require('./routes/adminAuth');

var adminPanel = require('./routes/admin');
var constructor = require('./routes/constructor');
var profile = require('./routes/profile');

var deleteFile = require('./routes/delete');
var deleteProject = require('./routes/delete_project');

var uploadFile = require('./routes/upload');
var loadFonts = require('./routes/fonts');
var loadBases = require('./routes/bases');
var testBlob = require('./routes/BlobTest');

var register = require('./routes/register');
var loadUser = require('./routes/login');
var onsession = require('./routes/onsession');
var userLogout = require('./routes/logout');

var cart = require('./routes/cart');
var order = require('./routes/order');
var find = require('./routes/find');


/*TEST*/

var formData = require('./routes/form_data');

/*TEST*/


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
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false }));

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json({limit: '50mb'}));

app.use(cookieParser());
app.use(session({ secret: 'keyboard cat', cookie: {} }));

//app.use(express.session());
//app.use(express.static(path.join(__dirname, 'public')));

app.get('/bases', loadBases);
app.get('/fonts', loadFonts);
app.get('/delete', deleteFile);
app.get('/delete/template', deleteFile);
app.get('/delete/print', deleteFile);
app.get('/delete/cart', deleteFile);
app.get('/delete_project', deleteProject);

app.get('/load', loadProject);
app.get('/load/templates', loadProject);
app.get('/load/prints', loadProject);
app.get('/load/tags', loadProject);
app.post('/save', saveProject);
app.post('/save/template', saveProject);

app.get('/logout', userLogout);
app.get('/onsession', onsession);
app.post('/login', loadUser);
app.post('/register', register);

app.post('/upload', uploadFile);
app.post('/upload/redact', uploadFile);
app.post('/upload/print', uploadFile);
app.post('/test_blob', testBlob);

app.get('/admin', adminPanel);
app.get('/profile', profile);

app.post('/cart/add', cart);
app.get('/cart/load', cart);
app.post('/cart/add/product', cart);
app.get('/cart/amount', cart);

app.get('/myOrders', order);
app.get('/myOrders/load', order);
app.get('/order/load', order);
app.get('/order/get', order);
app.post('/order/set', order);
app.post('/order/update', order);

app.get('/constructor', constructor);

app.get('/find/font/by/name', find);

/* TEST */

app.post('/form_data', formData);

/*TEST*/


app.get('/', indexRouter);
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

app.listen(3010 || process.env.PORT);

module.exports = app;