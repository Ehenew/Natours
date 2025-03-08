/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';


export const forgotPassword = async (email) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:8000/api/v1/users/forgotPassword',
      data: {
        email,
      }
    });

    // console.log(res);
    if (res.data.status === 'success') {
      showAlert('success', 'Reset token sent to your email!');
      window.setTimeout(() => {
        location.assign('/notify');
      }, 500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};


export const resetPassword = async (password, passwordConfirm, resetToken) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `http://127.0.0.1:8000/api/v1/users/resetPassword/${resetToken}`,
      data: {
        password,
        passwordConfirm,
        resetToken
      }
    });

    // console.log(res);
    if (res.data.status === 'success') {
      showAlert('success', 'Password updated succesfully!');
      window.setTimeout(() => {
        location.assign('/login');
      }, 1000)
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};


