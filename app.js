const fileUpload = require("express-fileupload");
var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var compression = require('compression')
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const PORT = 3200;
var cors = require('cors')
const path = require("path");
const { createProxyMiddleware } = require('http-proxy-middleware');

var app = express();
app.use(cors())
// // view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(
  fileUpload()
);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function (request, response) {
  response.send('Hello World (Finally)');
});
app.use('/', indexRouter);
app.use('/users', usersRouter);
//app.use(cors());
const corsOptions = {
  origin: 'https://graceful-macaron-14f4b1.netlify.app/', // Replace this with your frontend domain
  methods: ['GET', 'POST'], // Add other HTTP methods you need
};

app.use('/', createProxyMiddleware({
  target: 'https://packend-plate-canada.onrender.com/', //original url
  changeOrigin: true,
  //secure: false,
  onProxyRes: function (proxyRes, req, res) {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
  }
}));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

const connectDb = require("./config/db.js");
connectDb();

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
app.listen(PORT, function (err) {
  if (err) console.log("Error in server setup")
  console.log("Server listening on Port", PORT);
}),

  module.exports = app;
