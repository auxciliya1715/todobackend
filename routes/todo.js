const express = require('express');
const router = express.Router();
const { Todo, validateTodo } = require('../models/todo.js');
const { User } = require('../models/user.js');
const auth = require('../middleware/auth.js');

router.get('/', auth, async (req, res) => {
  const userId = req.user._id;
  const { date } = req.query;

  let filter = { userId };

  if (date) {
    const selected = new Date(date + 'T00:00:00.000Z');
    const nextDay = new Date(selected);
    nextDay.setUTCDate(selected.getUTCDate() + 1);
    filter.date = { $gte: selected, $lt: nextDay };
  }

  try {
    const todos = await Todo.find(filter).sort({ createdAt: -1 });
    res.send(todos);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.post('/', auth, async (req, res) => {
  const { error } = validateTodo(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const todoDate = req.body.date ? new Date(req.body.date + 'T00:00:00.000Z') : new Date();
  todoDate.setUTCHours(0, 0, 0, 0);

  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const { assignedTo } = req.body;
    const currentUserId = req.user._id;

    let targetUserId = currentUserId;

    if (assignedTo) {
      const admin = await User.findById(currentUserId);
      let teamMember;
      if (/^[0-9a-fA-F]{24}$/.test(assignedTo)) {
        teamMember = await User.findById(assignedTo);
      } else {
        teamMember = await User.findOne({ userId: assignedTo });
      }

      if (!teamMember) {
        return res.status(404).json({ message: 'Assigned user not found' });
      }

      if (!teamMember.admins.includes(currentUserId)) {
        return res.status(403).json({ message: 'You are not allowed to assign tasks to this user' });
      }

      targetUserId = assignedTo;
    }
    const existingTodo = await Todo.findOne({
      title: req.body.title,
      userId: targetUserId,
      createdAt: { $gte: todayStart, $lte: todayEnd },
      date: todoDate,
      completed: false
    });
    if (existingTodo) return res.status(400).json({ message: 'Todo already exists' });

    const todo = new Todo({
      title: req.body.title,
      completed: req.body.completed || false,
      completedAt: req.body.completed ? new Date() : null,
      userId: targetUserId,
      createdBy: req.user._id,
      assignedTo: assignedTo || null,
      date: todoDate
    });

    const newTodo = await todo.save();
    res.status(200).json(newTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


router.put('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });

    if (
      todo.userId.toString() !== req.user._id &&
      todo.assignedTo?.toString() !== req.user._id
    ) {
      return res.status(403).json({ message: 'You are not allowed to update this task' });
    }

    if (req.body.title !== undefined) todo.title = req.body.title;
    if (req.body.completed !== undefined) {
      todo.completed = req.body.completed;
      todo.completedAt = req.body.completed ? new Date() : null;
    }

    const updatedTodo = await todo.save();
    res.json(updatedTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


router.delete('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!todo) return res.status(404).json({ message: 'Todo not found' });

    if (todo.createdBy.toString() !== req.user._id && todo.assignedTo?.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    res.json({ message: 'Todo deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/assigned-to-me', auth, async (req, res) => {
  try {
    const todos = await Todo.find({ assignedTo: req.user._id })
      .populate('createdBy', 'name email')
       .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/assigned-by-me', auth, async (req, res) => {
  try {
    const todos = await Todo.find({ createdBy: req.user._id })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
