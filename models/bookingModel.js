const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Parent referencing
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'A booking must belong to a Tour'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A booking must belong to a User'],
  },
  price: {
    type: Number,
    required: [true, 'A booking must have a price!'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    // in case the admin manually book tours
    type: Boolean,
    default: true,
  },
});

// Populating booking with tour and user
bookingSchema.pre(/find^/, function (next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });

  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
