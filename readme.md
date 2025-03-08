# Natours - A Tour Booking Application

## 📌 Overview
Natours is a full-stack web application that allows users to explore and book exciting tours worldwide. The project includes both a **frontend with server-side rendering using Pug** and a **backend built with Node.js, Express, and MongoDB**. Users can sign up, log in, browse available tours, view detailed tour information, and securely book tours using **Stripe and Chapa** payment integrations. Additionally, users can update their profiles, including their name, email, password, and profile photo.

## 🚀 Features
- User authentication (Sign up, Login, Logout)
- Browse all available tours
- View detailed information about a tour
- Book tours
- Secure payment processing via **Stripe & Chapa**
- User profile management (update name, email, password, and profile photo)
- Server-side rendering with **Pug**
- Secure backend with **Node.js, Express, MongoDB, and Mongoose**

## 🏗️ Technologies Used
### Frontend:
- **Pug** (for server-side rendering)
- **CSS** (for styling and layout)
- **Leaflet** (for map display)

### Backend:
- **Node.js** (runtime environment)
- **Express.js** (web framework)
- **MongoDB & Mongoose** (database & ORM)
- **JWT Authentication** (secure login system)
- **Stripe & Chapa** (payment gateways)
- **Multer** (for image uploads)
- **Mailtrap & SendGrid** (for email notification)

## 📂 Project Structure
```
Natours/
│-- controllers/         # Business logic (auth, users, tours, reviews bookings)
│-- models/              # Mongoose models (User, Tour,Review, Booking)
│-- public/              # Static assets (CSS, images, scripts)
│-- routes/              # Express route handlers
│-- views/               # Pug templates
│-- utils/               # Utility classes
│-- app.js               # Main Express app configuration
│-- server.js            # Server setup
│-- config.env           # Environment variables
```

## ⚡ Installation & Setup
### 1️⃣ Clone the Repository
```sh
git clone https://github.com/Ehenew/Natours.git
cd Natours
```

### 2️⃣ Install Dependencies
```sh
npm install
```

### 3️⃣ Setup Environment Variables
Create a `.env` file in the root directory and add the following:
```
NODE_ENV=development
PORT=8000
DATABASE=your-mongodb-connection-string
USER=your-database-user-name
DATABASE_PASSWORD=your-database-password

# Local database
DATABASE_LOCAL=mongodb://localhost:27017/natours

JWT_SECRET=jwt-secret-key # use at least 32 characters
JWT_EXPIRES_IN=60d
JWT_COOKIE_EXPIRES_IN=60

# Mailing service -> using Mailtrap for dev testing
EMAIL_USERNAME=your-username-on-mailtrap
EMAIL_PASSWORD=your-password-on-mailtrap
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_FROM=your-email-address

SENDGRID_USERNAME=apikey
SENDGRID_PASSWORD=sendgrid-password

STRIPE_SECRET_KEY=stripe-secret-key

CHAPA_SECRET_KEY=chapa-secret-key
```

### 4️⃣ Run the Application
- **Start the server in development mode:**
```sh
npm start
```
This command starts the server using `nodemon`, which watches for file changes and restarts automatically.

- **Start the server in production mode:**
```sh
npm run start:prod
```
This command runs the app with optimized performance settings for production.

- **Run JavaScript bundling with Parcel:**
```sh
npm run watch:js
```
This command watches for changes in JavaScript files and bundles them using Parcel.

The app will be available at **http://localhost:8000**

## 🔥 API Endpoints
| Endpoint              | Method | Description |
|----------------------|--------|-------------|
| `/api/v1/tours`     | GET    | Get all tours |
| `/api/v1/tours/:id` | GET    | Get a single tour |
| `/api/v1/users/signup` | POST | Register a new user |
| `/api/v1/users/login` | POST | Login user |
| `/api/v1/users/updateMe` | PATCH | Update user profile |
| `/api/v1/users/resetPassword/:resetToken` | PATCH | Reset user password |
| `/api/v1/bookings/checkout-session/:tourId` | GET | Checkout with Stripe/Chapa |


## 📜 License
This project is open-source and available under the **MIT License**.

## 👨‍💻 Author
- **Ehenew** ([@NotYetSettled](https://www.linkedin.com/in/ehenew-amogne-a5b2642b4/))

---
### 🌟 If you like this project, don't forget to **star** the repository!
