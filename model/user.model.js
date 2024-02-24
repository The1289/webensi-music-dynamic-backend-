import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';
import crypto from 'crypto';
import uniqueValidator from 'mongoose-unique-validator'; // Import the plugin
import modelOptions from './model.options.js';

const userSchema = new mongoose.Schema(
  {
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
    profilePicture: {
      type: String,
    },
  },
  {
    ...modelOptions,
  }
);

// Add passport-local-mongoose plugin to simplify username/password management
userSchema.plugin(passportLocalMongoose);

userSchema.plugin(uniqueValidator); // Apply the uniqueValidator plugin

userSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex');

  this.password = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
};

userSchema.methods.validPassword = function (password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');

  return this.password === hash;
};



module.exports = mongoose.model('User', userSchema);
