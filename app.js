var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var bookReviewsRouter = require('./routes/bookReviews');
var sellerReviewsRouter = require('./routes/sellerReviews');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/v1/reviews/books', bookReviewsRouter);
app.use('/api/v1/reviews/sellers', sellerReviewsRouter);

// setup connection to mongo
const mongoose = require('mongoose');
const DB_URL = (process.env.DB_URL || 'mongodb://localhost/test');
// const DB_URL = (process.env.DB_URL || "mongodb+srv://cservice:x1M7DWGFzx7iL131@contacts-service.gdzngil.mongodb.net/?retryWrites=true&w=majority")
console.log("Connecting to database: %s", DB_URL);

mongoose.connect(DB_URL);
const db = mongoose.connection;

// recover from errors
db.on('error', console.error.bind(console, 'db connection error'));

module.exports = app;
