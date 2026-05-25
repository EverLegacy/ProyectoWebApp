const mongoose = require('mongoose');

const storeAnalyticsSchema = new mongoose.Schema({
  storeId:      { type: Number, required: true },
  date:         { type: String, required: true },
  totalSales:   { type: Number, default: 0 },
  pointsIssued: { type: Number, default: 0 },
  scanCount:    { type: Number, default: 0 },
});

module.exports = mongoose.model('StoreAnalytics', storeAnalyticsSchema);
