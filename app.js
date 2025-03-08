///////////////
///Natours API/
///////////////
/* eslint-disable no-unused-vars */
const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const { whitelist } = require('validator');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const globalErrorHandler = require('./controllers/errorController');

// Start express app
const app = express();

// Setting pug as a view engine for server-side rendering
app.set('view engine', 'pug');

// Setting the paths for our views folder where the pug file is located
// app.set('views', `${__dirname}/views`);
app.set('views', path.join(__dirname, 'views'));

// GLOBAL MIDDLEWARES
// Implement cors
app.use(cors()); // only for simple requests like get and post
// Acess Control Allow Origin
// api.natours.com(back-end), natours.com(front-end)
// app.use(cors({
//   origin:'https://www.natours.com', allowing natours.com to access api.natours.com
// }))

// for non-simple requests like patch, put, update, delete and auth, the browser automatically issue a brief like phase before the real request happens, in order figure out if the actual request is safe to send and so the browser first does an options request
app.options('*', cors()); // for all routes
// app.options('/api/v1/tours/:id', cors()); // for specific route

// Serving static files - for files only not for a directory
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
// Commented out to fix the issue with leaflet library
// app.use(helmet());

// Dvelopment logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same IP
const limiter = rateLimiter({
  max: 100, // maximum numner of requests
  WindowMs: 1 * 60 * 60 * 1000, // 1hr in milliseconds
  message: 'Too many request from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // parses data from html form
app.use(cookieParser()); // parses data from cookie

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Preventing parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// for compressing texts
app.use(compression());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// ROUTEs
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// Handling Unhandled Routes
app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
