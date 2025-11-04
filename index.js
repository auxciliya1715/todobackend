const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const todoRoutes = require('./routes/todo.js');
const users = require('./routes/user');
const auth = require('./routes/auth');
const sendDailySummary = require('./mail/dailyEmail');
const teamRoutes = require('./routes/teamRoutes');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-auth-token"]
}));

app.use(express.json());
app.use('/api/todos', todoRoutes);
app.use('/api/users', users);
app.use('/api/auth', auth);
app.use('/api/team', teamRoutes);

app.get('/api/send-summary', async (req, res) => {
  try {
    await sendDailySummary();
    res.send('Daily summary emails sent successfully!');
  } catch (err) {
    console.error('Error sending daily summary:', err);
    res.status(500).send('Error sending daily summary: ' + err.message);
  }
});

 app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error('Could not connect to MongoDB:', err));