//const nodemailer = require('nodemailer');
const Brevo = require('@getbrevo/brevo');
const generateEmailTemplate = require('./emailtemplate.js'); 

async function sendEmail(userEmail, userName, todos, total, completed, pending) {
 try{
   const client = new Brevo.TransactionalEmailsApi();
    client.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY;
  //  const transporter = nodemailer.createTransport({
  //   service: 'gmail',
  //   auth: {
  //     user: process.env.EMAIL_USER,
  //     pass: process.env.EMAIL_PASS,
  //   },
  //   tls: {
  //     rejectUnauthorized: false
  //   }
  

  const quote = pending === 0
    ? "Amazing work! You have completed everything today 🎉"
    : "Keep pushing! Tomorrow is another chance to conquer your goals 💪";

  const html = generateEmailTemplate(userName, todos, total, completed, pending, quote);
  const sendSmtpEmail = new Brevo.SendSmtpEmail();
    sendSmtpEmail.subject = "📊 Your Daily To-Do Summary";
    sendSmtpEmail.htmlContent = html;

    sendSmtpEmail.sender = { name: "To-Do Tracker", email: "auxciliya1715@gmail.com" };
    sendSmtpEmail.to = [{ email: userEmail, name: userName || "User" }];

  // const mailOptions = {
  //   from: `"To-Do Tracker" <${process.env.EMAIL_USER}>`,
  //   to: userEmail,
  //   subject: "📊 Your Daily To-Do Summary",
  //   html,
  // };
   await client.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Email sent successfully to ${userEmail}`);
  //  await transporter.sendMail(mailOptions);
  //   console.log(`Email sent successfully to ${userEmail}`);
  } catch (error) {
    console.error(`Error sending email to ${userEmail}:`, error);
  }
}

module.exports = sendEmail;
