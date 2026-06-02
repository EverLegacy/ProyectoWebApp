const logger = require('../logger/logger');

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    logger.info({
      type: 'http_request',
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: Date.now() - start,
    });
  });

  next();
};

module.exports = requestLogger;