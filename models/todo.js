const mongoose = require('mongoose');
const Joi = require('joi');

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    minlength: 5,
    maxlength: 255,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const Todo = mongoose.model('Todo', todoSchema);

function validateTodo(todo) {
  const schema = Joi.object({
    title: Joi.string().min(2).max(255).required(),
    completed: Joi.boolean(),
    completedAt: Joi.date().optional(),
    assignedTo: Joi.string().allow(null, '').optional(),
    createdBy: Joi.string().allow(null, '').optional(),
    date: Joi.date().optional(),
  }).unknown(true); 
  
  return schema.validate(todo);
}

module.exports = { Todo, validateTodo };
