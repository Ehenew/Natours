/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Handling UNCAUGHT EXCEPTIONS - programming errors
// NOte: The Uncauht Exception must be defined at the very top of our code(before the server started) so that it can handle all the errors that occur in anywhere in our code
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB)
  .then(() => console.log('DB Connected Successfully!'))
  .catch((err) => console.error('Database Connection Failed:', err.message));

///4) START SERVER
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App is running on port ${port}...`);
});

// Handling unhandled erros that occured anywhere in the app
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);

  // closing our app gracefully no abruptly
  server.close(() => {
    process.exit(1);
  });
});
