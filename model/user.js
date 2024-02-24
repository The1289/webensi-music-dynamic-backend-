const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passportLocalMongoose = require('passport-local-mongoose');
const crypto = require ('crypto');
const uniqueValidator = require('mongoose-unique-validator'); 

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  name: {
    type: String,
    required: true,
    unique: false,
  },
  displayName: {
    type: String,
    required: true,
  }, 
  email: {
    type: String,  
    required: true,
    unique: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  salt: {
    type: String,
    required: true,
    select: false,
  },
 createdAt:{
  type: Date,
  default: Date.now(),
 },
 resetPasswordToken: String,
 resetPasswordTime: Date,
});


//  Hash password
userSchema.pre("save", async function (next){
  if(!this.isModified("password")){
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// jwt token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id}, process.env.JWT_SECRET_KEY,{
    expiresIn: process.env.JWT_EXPIRES,
  });
};

// compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Add passport-local-mongoose plugin to simplify username/password management
userSchema.plugin(passportLocalMongoose);

userSchema.plugin(uniqueValidator); // Apply the uniqueValidator plugin


module.exports = mongoose.model("User", userSchema);
      