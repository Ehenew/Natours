const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking') {
    res.locals.alert =
      "Your booking was successful! Please check your email for a confirmation. If your booking doesn't show up here immediately, please comeback later";
  }
  next();
};

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();

  // 2) build the template
  // 3) Render that tempate using tour data from 1)
  res.status(200).render('overview', {
    // 'overview' .pug file name
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data for the requested tour (including guides and reviews)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user ',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }

  // 2) build the template

  // 3) Render that tempate using tour data from 1)
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getSignupForm = async (req, res) => {
  res.status(200).render('signup', {
    title: 'Create your account',
  });
};

exports.getLoginForm = async (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your Account',
  });
};

exports.forgotPassword = (req, res) => {
  res.status(200).render('forgot-password', {
    title: 'Forgot your password',
  });
};

exports.notify = (req, res) => {
  res.status(200).render('message-box', {
    title: 'Reset Token sent to email',
  });
};

exports.resetPassword = (req, res) => {
  const resetToken = req.params.token;

  res.status(200).render('reset-password', {
    title: 'Reset your password',
    token: resetToken,
  });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  // console.log(req.body);

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  // re-rendering the account page with the updated data
  res.status(200).render('account', {
    title: 'Your Account',
    user: updatedUser, // we override the user that was comming from the protect middleware
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Get the all the bookings of a current user
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map((booking) => booking.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});
