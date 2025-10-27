require('dotenv').config();
const cron = require('node-cron');
const { User } = require('../models/user');
const { Todo } = require('../models/todo');
const sendEmail = require('./sendEmail');

async function sendDailySummary() {
  try {
    console.log("Running daily To-Do summary job...");

    const users = await User.find();

    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);

    const startOfDayUTC = new Date(istNow.setHours(0, 0, 0, 0) - istOffset);
    const endOfDayUTC = new Date(istNow.setHours(23, 59, 59, 999) - istOffset);

    for (const user of users) {

      // const allTodos = await Todo.find({ userId: user._id }).sort({ createdAt: -1 });
      // allTodos.forEach(todo => {
      //   console.log(
      //     `   → ${todo.title} | createdAt: ${todo.createdAt?.toISOString()} | date: ${todo.date?.toISOString()} | completedAt: ${todo.completedAt?.toISOString()}`
      //   );
      // });

      const todos = await Todo.find({
        userId: user._id,
        $or: [
          { createdAt: { $gte: startOfDayUTC, $lte: endOfDayUTC } },
          { completedAt: { $gte: startOfDayUTC, $lte: endOfDayUTC } }
        ]
      }).select('title completed createdAt completedAt date');

      if (todos.length === 0) continue;

      const total = todos.length;
      const completed = todos.filter(t => t.completed).length;
      const pending = total - completed;

      const quote = pending === 0
        ? "Amazing work! You have completed everything today 🎉"
        : "Keep pushing! Tomorrow is another chance to conquer your goals 💪";

      await sendEmail(user.email, user.name, todos, total, completed, pending, quote);
      console.log(`Email sent successfully to ${user.email}`);
    }


    console.log("Daily summary emails sent!");
  } catch (err) {
    console.error("Error in daily summary job:", err);
  }
}

cron.schedule('0 21 * * *', sendDailySummary, { timezone: 'Asia/Kolkata' });

//sendDailySummary();
console.log("Worker is idle, waiting for next scheduled job...");

module.exports = sendDailySummary;
