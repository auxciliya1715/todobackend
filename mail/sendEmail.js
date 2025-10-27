const nodemailer = require('nodemailer');
const generateEmailTemplate = require('./emailtemplate.js');

async function sendEmail(userEmail, userName, todos, total, completed, pending) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const quote = pending === 0
      ? "Amazing work! You have completed everything today 🎉"
      : "Keep pushing! Tomorrow is another chance to conquer your goals 💪";

    const html = generateEmailTemplate(userName, todos, total, completed, pending, quote);

    const mailOptions = {
      from: `"To-Do Tracker" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "📊 Your Daily To-Do Summary",
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${userEmail}`);
  } catch (error) {
    console.error(`Error sending email to ${userEmail}:`, error);
  }
}

module.exports = sendEmail;
