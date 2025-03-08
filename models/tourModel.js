const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name!'],
      unique: true,
      trim: true,
      maxLength: [40, 'A tour name must have less or equal 40 characters'],
      minLength: [10, 'A tour name must have less or equal 10 characters'],
      // validate: [validator.isAlpha, 'A tour name must must only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round((val * 10) / 10),
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message:
          'Discount price({VALUE}) should be less than the regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String], // an array of images
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON -> mongoose geospatial data
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], // array of numbers [lng, lat] format
      address: String,
      description: String,
    },
    locations: [
      // EMBEDDING locations into tours -> while embeddeing, we use arrays of objects
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guides: Array, // EMBEDDING: this works for embedding guidess in to a tour
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// INDEXING - Single and Compound
tourSchema.index({ price: 1, ratingsAverage: -1 }); // 1 for ascending and -1 for descending order
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' }); // // Create a 2dsphere index on the startLocation field

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Virtual POPULATE
tourSchema.virtual('reviews', {
  ref: 'Review', // the name of the model to be referenced
  foreignField: 'tour', // the name of the field as refrenced in the Review model
  localField: '_id', // _id is alocal field in the tour model which is then stored in the Review model as an OBjectId
});

// DOCUMENT MIDDLEWARE: Runs before .save() and .create() but not before .insertMany() and others
tourSchema.pre('save', function (next) {
  // this refers to the current document
  this.slug = slugify(this.name);
  next();
});

// EMBEDDING TOUR GUIDES INTO A TOUR
// We want to embedd guides directly in to a tour while creating new tour, and for the guides filed we only need the id of the guides and we will embedd all the information about them using the pre-save document middlware. This is however to show how embedding works, but we will use parent-referencing for this problem
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(
//     async (guideId) => await User.findById(guideId),
//   );
//   // Note: as the map method in this case will assign the result of each iteration into the guidesPromise array, and so the guidesPromise is now a full of promises, then how can we get the values? well we ned to run the all of the primises in the guidesPromise at the same time.

//   // const guides = Promise.all(guidesPromise);
//   this.guides = await Promise.all(guidesPromises); // over-writting the original guides with array of id with complete guide information

//   next();
// });

// QUERY MIDDLEWARE - runs after the .find(), called right before the query is processed
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

// POPULATING RFERENCING OBJECTIDs
// we want to the pupulate referencing OBjectIds on all of the quries that start with find
tourSchema.pre(/^find/, function (next) {
  // 'this' points to the current query, right?
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt', // to remove unwanted fields
  });
  next();
});

tourSchema.post(/^find/, (docs, next) => {
  // console.log(`Query took ${Date.now() - this.start} milliseconds`);
  // console.log(docs);
  next();
});

// AGGREGATION MIDDLEWARE
// ! Commented out for the sake of  "$geoNear was not the first stage in the pipeline after optimization. Is optimization disabled or inhibited?", an error message that occured when w try to use the geoNear aggregate middleware
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   // console.log(this.pipeline());
//   next();
// });

// Creating a model from sckema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
