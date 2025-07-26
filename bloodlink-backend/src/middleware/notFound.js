const { AppError } = require('./errorHandler');

const notFound = (req, res, next) => {
  const message = `Cannot ${req.method} ${req.originalUrl}`;
  next(new AppError(message, 404, 'ROUTE_NOT_FOUND'));
};

module.exports = { notFound }; 