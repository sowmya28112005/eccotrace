const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId:          { type: String, unique: true, default: 'default_user' },
  name:            { type: String, default: 'EcoWarrior' },
  points:          { type: Number, default: 0 },
  devicesRecycled: { type: Number, default: 0 },
  createdAt:       { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
