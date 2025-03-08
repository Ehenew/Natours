/* eslint-disable */
import '@babel/polyfill'; // to suppory old browsers
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { signup } from './signup';
import { updateSettings } from './updateSettings';
// import { bookTour } from './stripe';
import { bookTour } from './payment';
import { forgotPassword, resetPassword } from './forgotPassword';
import { showAlert } from './alerts';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
const modalWindow = document.getElementById('payment-modal')
const closeModalBtn = document.getElementById('close-modal')
const forgotPasswordForm = document.querySelector('.form--forgot')
const resetPasswordForm = document.querySelector('.form--reset')
const forgotBtn = document.getElementById('forgot-password')
const resetBtn = document.getElementById('reset-password')

// DELEGATION
if (mapBox) { //  to prevent errors when we are on other pages - pages that does not have a map or form element  inside them
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
  
if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm) userDataForm.addEventListener('submit', e => {
  e.preventDefault();
  // Multipart form data
  const photoInput = document.getElementById('photo');

  const formData = new FormData();
  formData.append('name', document.getElementById('name').value);
  formData.append('email', document.getElementById('email').value);
  if (photoInput.files.length > 0) {
    formData.append('photo', photoInput.files[0]);
  }
  // console.log(formData); // an object

  updateSettings(formData, 'data');
});

if (userPasswordForm) userPasswordForm.addEventListener('submit', async e => {
  e.preventDefault();
  document.querySelector('.btn--save-password').textContent = 'Updating...';

  const passwordCurrent = document.getElementById('password-current').value;
  const passwordNew = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('password-confirm').value;

  await updateSettings({ passwordCurrent, passwordNew, passwordConfirm }, 'password');

  // Clearing the fields
  document.querySelector('.btn--save-password').textContent = 'Save Password';
  document.getElementById('password-current').value = '';
  document.getElementById('password').value = '';
  document.getElementById('password-confirm').value = '';
});

// Checkout bookings
if (bookBtn && modalWindow) {
  bookBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const { tourId } = e.target.dataset;
    // console.log(e.target)

    // Show payment modal before proceeding
    const paymentModal = document.getElementById('payment-modal');
    paymentModal.classList.remove('hidden');
    document.getElementById('overlay').classList.remove('hidden');
    paymentModal.dataset.tourId = tourId;
  });
}

// Handle payment option selection
if (modalWindow) document.querySelectorAll('.modal-content button').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    let target = e.target;

    // If the clicked element is the image inside the button, set target to the button
    if (target.tagName === 'IMG') {
      target = target.closest('button');
    }

    const paymentMethod = target.dataset.payment;
    if (!paymentMethod) {
      document.getElementById('overlay').classList.remove('hidden');
      return document.getElementById('payment-modal').classList.add('hidden'); // Close modal if no method selected
    }

    const { tourId } = document.getElementById('payment-modal').dataset;

    // Call bookTour with selected payment method
    bookTour(tourId, paymentMethod);
  });
});

// Close modal button
if (closeModalBtn && modalWindow) {
  document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('payment-modal').classList.add('hidden');
    document.getElementById('overlay').classList.add('hidden');
  });
  
}

// Signing up a new user
if (signupForm) signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const btnSignup = document.getElementById('btn-signup');
  // console.log(btnSignup);
  btnSignup.textContent = 'Signing up...';
  btnSignup.disabled = true;

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('password-confirm').value;

  await signup(name, email, password, passwordConfirm);

  // Clearing form data
  document.getElementById('name').value = '';
  document.getElementById('email').value = '';
  document.getElementById('password').value = '';
  document.getElementById('password-confirm').value = '';
  document.getElementById('btn-signup').textContent = 'Sign up';
  btnSignup.disabled = false;
});


if (forgotPasswordForm) forgotBtn.addEventListener('click', async e => {
  e.preventDefault();
  forgotBtn.textContent = 'Sending..'
  
  const email = document.getElementById('email').value;
  await forgotPassword(email);
  
  document.querySelector('.form--forgot').innerHTML = `
      <div class="email-confirmation">
        <h2>Check Your Email</h2>
        <p>We have sent a password reset link to <strong>${email}</strong>.</p>
        <p>Please check your inbox and follow the instructions.</p>
        <a href="https://mail.google.com/" target="_blank" class="btn btn--green">Go to Gmail</a>
      </div>
    `;
}) 


if (resetPasswordForm) resetBtn.addEventListener('click', async e => {
  e.preventDefault();
  const resetToken = e.target.dataset.resetToken;
  // console.log(e.target, resetToken)
  e.target.textContent = 'Updating...'

  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('passwordConfirm').value;

  await resetPassword(password, passwordConfirm, resetToken);

  // Clearing input fields
  document.getElementById('password').value = ''
  document.getElementById('passwordConfirm').value = '';
  e.target.textContent = 'Update Password'
}) 

const alertMessage = document.querySelector('body').dataset.alertMessage;
if (alertMessage) showAlert('success', alertMessage, 15);