const express = require('express');
const router = express.Router();
const { Todo, validateTodo } = require('../models/todo.js');

router.get('/', async (req, res) => {
    try {
        const todos = await Todo.find();
        res.json(todos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', async (req, res) => {

    const { error } = validateTodo(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const todo = new Todo({ title: req.body.title });
    try {

        const existingTodo = await Todo.findOne({ title: req.body.title });
        if (existingTodo) return res.status(400).json({ message: 'Todo already exists' })

        const newTodo = await todo.save();
        res.status(200).json(newTodo);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/:id', async (req, res) => {
     const { error } = validateTodo(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) return res.status(404).json({ message: 'Todo not found' });

    todo.title = req.body.title;
        if (req.body.completed !== undefined) todo.completed = req.body.completed;

        const updatedTodo = await todo.save();
        res.json(updatedTodo);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const todo = await Todo.findByIdAndDelete(req.params.id);
        if (!todo) return res.status(404).json({ message: 'Todo not found' });

        res.json({ message: 'Todo deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
