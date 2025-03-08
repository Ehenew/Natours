const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

// I will change this one once i deployed the page
router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedin,
  viewsController.getOverview,
);
router.get('/tour/:slug', authController.isLoggedin, viewsController.getTour);

router.get('/login', authController.isLoggedin, viewsController.getLoginForm);
router.get('/signup', authController.isLoggedin, viewsController.getSignupForm);
router.get(
  '/forgot-password',
  authController.isLoggedin,
  viewsController.forgotPassword,
);
router.get(
  '/reset-password/:token',
  authController.isLoggedin,
  viewsController.resetPassword,
);

router.get('/notify', authController.isLoggedin, viewsController.notify);

router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-tours', authController.protect, viewsController.getMyTours);
router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData,
);

module.exports = router;
