const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId:    { type: Number, required: true },
  action:    { type: String, required: true }, // 'scan' | 'redeem' | 'login'
  metadata:  { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
