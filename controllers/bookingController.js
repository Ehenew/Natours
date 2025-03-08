const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const { tourId } = req.params;
  const { paymentMethod } = req.query; // Get payment method from query param

  // 1) Getting the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  if (!tour) {
    return res.status(404).json({ status: 'fail', message: 'Tour not found' });
  }

  // 2) Create checkout session
  // Check which payment method is selected
  if (paymentMethod === 'stripe') {
    const session = await stripe.checkout.sessions.create({
      // Session info
      payment_method_types: ['card'],
      // Passing the bookings informaton as a querty is not secure, but I will change the success url once i deployed the page on a website
      // success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${tour.id}&user=${req.user.id}&price=${tour.price}`,

      // Now it is time to use stripe webhook, webhookCheckout for secure booking
      success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
      cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}/`,
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      mode: 'payment', //required for one-time payments

      // Product info
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tour.name} Tour`,
              description: tour.summary,
              images: [
                `${req.protocol}://${req.get('host')}/${tour.imageCover}`,
              ],
            },
            unit_amount: tour.price * 100, // Convert price to cents
          },
          quantity: 1,
        },
      ],
    });

    // 3) Send the checkout session as a response
    res.status(200).json({
      status: 'success',
      session,
    });
  }
  if (paymentMethod === 'chapa') {
    // Create Chapa Payment Session
    const chapaResponse = await axios.post(
      'https://api.chapa.co/v1/transaction/initialize',
      {
        amount: tour.price,
        currency: 'ETB',
        email: req.user.email,
        first_name: req.user.name.split(' ')[0],
        last_name: req.user.name.split(' ')[1] || '',
        tx_ref: `tour-${tourId}-${Date.now()}`,
        callback_url: `${req.protocol}://${req.get('host')}/payment-success`,
        return_url: `${req.protocol}://${req.get('host')}?tour=${tour.id}&user=${req.user.id}&price=${tour.price}`,
        customization: {
          title: `${tour.name} Tour`,
          description: tour.summary,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`, // Use your Chapa secret key
          'Content-Type': 'application/json',
        },
      },
    );
    // console.log(chapaResponse);
    // Return Chapa checkout URL
    return res.status(200).json({
      status: 'success',
      checkoutUrl: chapaResponse.data.data.checkout_url,
    });
  }
  next();
});

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   // this is TEMPORARY, because it is  UNSECURE: anyone can make bookings WITHOUT paying
//   // 1. Get the booking data from the success url of our checkout session
//   const { tour, user, price } = req.query;

//   if (!tour || !user || !price) return next();

//   // 2. Create booking from the data coming from the success url
//   await Booking.create({ tour, user, price });

//   // Redirecting the user to the home page(by removing the query strings)
//   res.redirect(req.originalUrl.split('?')[0]);
// });
const createBookingCheckout = async (session) => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.line_items[0].price_data.unit_amount / 100;

  await Booking.create({ tour, user, price });
};
exports.webhookCheckout = (req, res, next) => {
  const signature = req.body['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed')
    createBookingCheckout(event.data.object); // event.data.object = session we created in the getCheckoutSession
  res.status(200).json({
    received: true,
  });
};

exports.createBooking = factory.createOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
