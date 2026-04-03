const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  userId:        { type: String, default: 'guest' },
  deviceType:    { type: String, required: true },
  confidence:    { type: String },
  hazards:       [String],
  disposalSteps: [String],
  source:        { type: String },
  imagePath:     { type: String },
  scannedAt:     { type: Date, default: Date.now }
});

module.exports = mongoose.model('Scan', scanSchema);