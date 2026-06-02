const logger = require('../logger/logger');

const errorHandler = (err, req, res, next) => {
  console.log("ERROR:", err); // IMPORTANTE

  logger.error({
    type: 'error',
    message: err.message,
    stack: err.stack,
  });

  res.status(500).json({
    message: err.message,
    error: err, // SOLO PARA DEBUG
  });
};

module.exports = errorHandler;