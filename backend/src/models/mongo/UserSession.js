const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema({
  userId:    { type: Number, required: true },
  token:     { type: String, required: true },
  device:    { type: String },
  ip:        { type: String },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

module.exports = mongoose.model('UserSession', userSessionSchema);
