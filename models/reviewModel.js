// We will use parent referncing to tours and users
const mongoose = require('mongoose');
const Tour = require('./tourModel');
// const User = require('./userModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty.'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
  },

  // for virual properies that are not going to be stored in our database
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
// A single user can only post a single review about a tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// POPULATING
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // In static methods, "this" refers to the model itself (Review model);
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }, // Find all reviews associated with the given tour ID
    },
    {
      $group: {
        _id: '$tour', // Group by the tour ID
        nRating: { $sum: 1 }, // Count the number of reviews
        avgRating: { $avg: '$rating' }, // Calculate the average rating
      },
    },
  ]);
  // console.log(stats);
  // [ {_id: new ObjectId('67bedbbd5645bf2aab566121'), nRatings: 2, avgRatings: 2.95 } ]
  // Persisting the stat into the tours
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};
// Note: In Mongoose, static methods are methods defined directly on a model rather than on an instance of the model. This means they can be called on the model itself, not on individual documents.

/// Updating stats whenever a review is updated and deleted
reviewSchema.post(/findOneAnd/, async (doc) => {
  if (doc) {
    await doc.constructor.calcAverageRatings(doc.tour);
  }
});

reviewSchema.post('save', function () {
  // post -. after a review has been created
  // this.tour -> this points to the current review
  this.constructor.calcAverageRatings(this.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
