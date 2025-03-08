const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true }); // {mergeParams: true} -> to enable the tour controller to get access to the tourId parameter

// All the routes related to reviews is protected to authenticated users
router.use(authController.protect);

router.route('/').get(reviewController.getAllReviews).post(
  // authController.protect,
  authController.restrictTo('user'), // only a user can post a review
  reviewController.setTourUserIds, // added after we started using the factory
  reviewController.createReview,
);

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'), // only users and admins are allowed to post reviews
    reviewController.updateReview,
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview,
  );

module.exports = router;
