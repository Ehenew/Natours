/* eslint-disable */
import axios from 'axios';
import {showAlert} from './alerts'
const stripe = Stripe(
  'pk_test_51QzLZHFSOUZQd2H9J843SFsNgawGWGebhcw3Q0qY37UfzjwJvQNiA4e4Qqz5qSoQItZ8brHYgGmiDoowojL8v4kM00Kmd4jfkp',
);


export const bookTour = async tourId => {
  try {
    // 1) Get checkout session from the API
    const session = await axios({
      method: 'GET',
      url: `http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`,
      data: {
        tourId
      }
    });
    console.log(session);
    // 2) Create checkout form + charge the card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    })


  } catch (err) {
    showAlert('error', err.response.data.message)
  }
}