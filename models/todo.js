const mongoose = require('mongoose');
const Joi = require('joi');

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        minlength: 5,
        maxlength: 255
    },
    completed: {
        type: Boolean,
        default: false
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }
});

const Todo = mongoose.model('Todo', todoSchema)

function validateTodo(todo) {
    const schema = Joi.object({
        title: Joi.string().min(2).max(50).required(),
        completed: Joi.boolean()
    });
    return schema.validate(todo);
}

module.exports = { Todo, validateTodo };