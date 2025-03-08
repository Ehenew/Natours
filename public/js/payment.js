/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51QzLZHFSOUZQd2H9J843SFsNgawGWGebhcw3Q0qY37UfzjwJvQNiA4e4Qqz5qSoQItZ8brHYgGmiDoowojL8v4kM00Kmd4jfkp',
);

export const bookTour = async (tourId, paymentMethod) => {
  try {
    // Get checkout session from API with the selected payment method
    const session = await axios({
      method: 'GET',
      url: `http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`,
      params: { paymentMethod }, // Send payment method to API
    });

    // console.log(session);

    // Redirect to Stripe checkout only if Stripe is selected
    if (paymentMethod === 'stripe') {
      await stripe.redirectToCheckout({ sessionId: session.data.session.id });
    } else {
      showAlert('success', 'Redirecting to Chapa...');
      console.log(session.data.checkoutUrl);
      window.location.href = session.data.checkoutUrl; // Backend should return Chapa's payment URL
    }
  } catch (err) {
    showAlert('error', err.response.data.message || 'Something went wrong');
  }
};
