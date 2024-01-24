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

app.get("/api/v1/reviews", (req, res) => {
    res.redirect("https://app.swaggerhub.com/apis/TEAMREVIEW24/ReviewsAPI/1.0.0");
});


module.exports = app;
