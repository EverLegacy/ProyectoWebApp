const mongoose = require('mongoose');
const logger = require('../logger/logger');

const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

mongoose.set('debug', (collection, method, query) => {
  logger.info({
    type: 'mongo_query',
    collection,
    method,
    query,
  });
});

module.exports = { connectMongo };