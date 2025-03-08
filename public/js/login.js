/* eslint-disable */
// for the login functionality we want users to send an http request to our api with their email and passowrd then the api will verify the existence of the user and with that email and password 
import axios from 'axios';
import { showAlert } from './alerts';


export const login = async (email, password) => {
  // console.log(email, password)
  try {
    const res = await axios({
    method: 'POST',
      url: '/api/v1/users/login',
    data: {
      email,
      password
    }
    });

    if (res.data.status === 'success'){
      showAlert('success', 'You Logged in successfully');
      window.setTimeout(() => {
        location.assign('/')
      }, 1500)
    }
    
  } catch (err) {
    showAlert('error', err.response.data.message);
  }  
}

export const logout = async() => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout'
  })
    if (res.data.status === 'success') location.reload(true)
  } catch (err) {
    console.log(err.response)
    showAlert('error', 'Error: Logging out! Try again.')
  }
}

