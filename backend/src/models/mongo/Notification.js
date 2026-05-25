const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  title:  { type: String, required: true },
  body:   { type: String },
  read:   { type: Boolean, default: false },
  sentAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', notificationSchema);
