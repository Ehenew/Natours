const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Yihenew Amogne <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Send grid
      return nodemailer.createTransport({
        // SendGrid
        service: 'SendGrid', // we dont need to define a host and port(automatically known)
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    // 1. Render HTML based on a pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        // for email personalization we can send data like this
        firstName: this.firstName,
        url: this.url,
        subject,
      },
    );

    // 2) Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      // html: html,
      text: convert(html), // some users prefer texts rather than fromatted html
    };

    // 3. Create a transport and send email
    // await transporter.sendMail(mailOptions);
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'resetPassword',
      'Your password reset token (valid for only 10 minutes!)',
    );
  }
};
