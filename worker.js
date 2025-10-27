require('dotenv').config();
const mongoose = require('mongoose');
const sendEmail = require('./mail/sendEmail');
const Todo = require('./models/todo');
const User = require('./models/user');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Worker connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

async function runDailySummary() {
  console.log('🕐 Running daily To-Do summary job...');

  const users = await User.find();
  for (const user of users) {
    const todos = await Todo.find({ userId: user._id });
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const pending = total - completed;

    await sendEmail(user.email, user.name, todos, total, completed, pending);
    console.log(`📧 Sent summary to ${user.email}`);
  }

  console.log('✅ Daily summary job finished.');
  process.exit(0);
}

// Run once per deployment (Render restarts workers daily)
runDailySummary();
