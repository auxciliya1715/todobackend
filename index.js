const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const todoRoutes = require('./routes/todo');
const users = require('./routes/user');
const auth = require('./routes/auth');
require('./mail/dailyEmail')

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/todos', todoRoutes);
app.use('/api/users', users);
app.use('/api/auth', auth);

mongoose.connect(process.env.MONGO_URI)
.then(() =>console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Connecting on port ${PORT}`));