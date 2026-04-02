// models/user.js  — EcoTrace User schema for MongoDB/Mongoose

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName:  { type: String, required: true, trim: true },
  lastName:   { type: String, default: '',    trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  city:       { type: String, default: '',    trim: true },
  password:   { type: String, required: true },   // bcrypt hash
  eco_points: { type: Number, default: 50 },
  level:      { type: Number, default: 1 },
  devices_recycled: { type: Number, default: 0 },
  createdAt:  { type: Date, default: Date.now }
});

// Index on email for fast duplicate checks
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);