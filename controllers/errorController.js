// const { Error } = require('mongoose');
const AppError = require('../utils/appError');

// Handling Cast Errors
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// Handling duplicate key errors from mongodb
const handleDuplicateKeyDB = (err) => {
  const value = Object.values(err.keyValue)[0];

  // Check if the duplicate field is an email
  if (err.keyPattern && err.keyPattern.email) {
    return new AppError(
      `Email already existed. Please try to login into your account.`,
      400,
    );
  }

  return new AppError(
    `Duplicate field value: ${value}. Please use another value!`,
    400,
  );
};

const handleJWTError = () =>
  new AppError('Invalid token. Please Login again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please login again!', 401);

// Handling mongoose validation errors
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Errors during development
const sendErrorDev = (err, req, res) => {
  // A. API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stackTrace: err.stack,
    });
  }

  // B. RENDERED WEBSITE
  // console.error('Error 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: err.message,
  });
};

// Errors during production
const sendErrorProd = (err, req, res) => {
  // A. API
  if (req.originalUrl.startsWith('/api')) {
    // A. Operational. trusted errors: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    // B. Programming or other unknown error: don't leak error messages
    // 1 . Log error message
    // console.error('Error 💥', err);

    // 2. Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }

  //  RENDERED WEBSITE
  // A. Operational. trusted errors: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
  // B. Programming or other unknown error: don't leak error messages
  // 1 . Log error message
  // console.error('Error 💥', err);
  // 2. Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: 'Please try again later!',
  });
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateKeyDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);

    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
