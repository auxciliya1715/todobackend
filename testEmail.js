// Load environment variables
require('dotenv').config();

// Import sendEmail function
const sendEmail = require('./mail/sendEmail');

// Sample todos (you can customize)
const todos = [
  { title: 'Buy groceries' },
  { title: 'Read a book' }
];

// Recipient details — change to your test email
const testEmail = 'auxciliya1715@gmail.com'; // replace with your test email
const testName = 'Auxci';

// Send test email
(async () => {
  try {
    await sendEmail(
      testEmail,
      testName,
      todos,
      todos.length,   // total tasks
      1,              // completed tasks
      todos.length-1  // pending tasks
    );
    console.log('Test email sent successfully!');
  } catch (err) {
    console.error('Error sending test email:', err);
  }
})();
