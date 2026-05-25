const mongoose = require('mongoose');

// Example docs:
//   { key: 'pointsPerPeso', value: 1 }
//   { key: 'tiers', value: { silver: 500, gold: 2000 } }

const appConfigSchema = new mongoose.Schema({
  key:       { type: String, required: true, unique: true },
  value:     { type: mongoose.Schema.Types.Mixed },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AppConfig', appConfigSchema);
