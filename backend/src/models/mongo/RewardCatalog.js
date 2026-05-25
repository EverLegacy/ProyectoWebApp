const mongoose = require('mongoose');

const rewardCatalogSchema = new mongoose.Schema({
  rewardId:    { type: Number, required: true, unique: true },
  imageUrl:    { type: String },
  tags:        [String],
  richContent: { type: String },
  updatedAt:   { type: Date, default: Date.now },
});

module.exports = mongoose.model('RewardCatalog', rewardCatalogSchema);
