const express = require('express');
const router = express.Router();
const { Todo, validateTodo } = require('../models/todo.js');
const auth = require('../middleware/auth.js');

router.get('/', auth,async (req, res) => {
    try {
        const todos = await Todo.find({ userId: req.user._id });
        res.json(todos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', auth,async (req, res) => {

    const { error } = validateTodo(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const todo = new Todo({ title: req.body.title });
    try {

        const existingTodo = await Todo.findOne({ title: req.body.title, userId: req.user._id, });
        if (existingTodo) return res.status(400).json({ message: 'Todo already exists' });

        
    const todo = new Todo({
      title: req.body.title,
      completed: false,
      userId: req.user._id 
    });

        const newTodo = await todo.save();
        res.status(200).json(newTodo);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/:id',auth, async (req, res) => {
     const { error } = validateTodo(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const todo = await Todo.findById({_id:req.params.id, userId: req.user._id});
        if (!todo) return res.status(404).json({ message: 'Todo not found' });

    todo.title = req.body.title;
        if (req.body.completed !== undefined) todo.completed = req.body.completed;

        const updatedTodo = await todo.save();
        res.json(updatedTodo);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', auth,async (req, res) => {
    try {
        const todo = await Todo.findByIdAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!todo) return res.status(404).json({ message: 'Todo not found' });

        res.json({ message: 'Todo deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
