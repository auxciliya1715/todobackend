const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const userSchema = new mongoose.Schema({
    name: {
        type:String,
        required:true,
        minlength:3,
        maxlength:50
    },
    email:{
        type:String,
        required:true,
        minlength:5,
        maxlength:255,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:5,
        maxlength:1024
    },
    userId: {
        type: String,
        unique: true
    },
    teamMembers:[
        {  type:mongoose.Schema.Types.ObjectId, ref:'User'}
     ],
    admins:[
        {  type:mongoose.Schema.Types.ObjectId, ref:'User'}
     ],
    adminRequests:[
        {  type:mongoose.Schema.Types.ObjectId, ref:'User'}
     ]
});

userSchema.pre('save', async function (next) {
  if (!this.userId) {
    let userId;
    let exists = true;

    while (exists) {
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      userId = `USR${randomNum}`;
      exists = await mongoose.model('User').exists({ userId });
    }
    this.userId = userId;
  }
  next();
});

userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_PRIVATE_KEY);
};

const User = mongoose.model('User',userSchema);

function validateUser(user) {
    const schema = Joi.object({
        name:Joi.string().min(3).max(50).required(),
        email:Joi.string().min(5).max(255).required().email(),
        password:Joi.string().min(5).max(1024).required()
    });
    return schema.validate(user);
}

exports.User = User;
exports.validate = validateUser;

