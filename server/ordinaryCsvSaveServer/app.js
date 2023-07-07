var createError = require('http-errors');
var express = require('express');
// const multer = require('multer');
const fs = require('fs');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var csvRouter = require('./routes/csv');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


// POST 엔드포인트 '/csv'에 대한 처리
app.post('/csv', (req, res) => {
  const csvData = req.body;
  const userAgent = req.headers['user-agent'];

  if (!csvData) {
    return res.status(400).json({ error: 'No CSV data provided' });
  }

  try {    
    fs.appendFileSync(filePath, JSON.stringify(csvData) + '\n', 'utf8');
    
    console.log('CSV 데이터가 저장되었습니다');
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('CSV 데이터 저장 중 오류 발생:', error);
    res.status(500).json({ error: 'Failed to save CSV data' });
  }
});

var filePath = null;

// POST 엔드포인트 '/csv_init'에 대한 처리
app.post('/csv_init', (req, res) => {
  const userAgent = req.headers['user-agent'];

  try {    
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:.TZ]/g, '');
    const fileName = `${timestamp}.csv`;
    filePath = path.join(__dirname, 'uploads_csv' , fileName);
    fs.writeFileSync(filePath, timestamp + '\n', 'utf8');
    
    console.log('CSV 파일이 생성되었습니다');
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('CSV 파일 생성 중 오류 발생:', error);
    res.status(500).json({ error: 'Failed to save CSV data' });
  }
});

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
