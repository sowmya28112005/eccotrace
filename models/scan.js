const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  userId:        { type: String, default: 'default_user' },
  deviceType:    { type: String, required: true },
  confidence:    { type: String },
  hazards:       [String],
  disposalSteps: [String],
  imagePath:     { type: String },
  scannedAt:     { type: Date, default: Date.now }
});

module.exports = mongoose.model('Scan', scanSchema);
