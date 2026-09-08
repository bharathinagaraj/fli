// Custom error class for throwing operational errors with a specific status code.
// Usage: throw new AppError("Product not found", 404);
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Wraps async route handlers so thrown errors are passed to next()
// instead of crashing the process. Usage: router.get('/', catchAsync(controllerFn))
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler — mount after all routes.
const notFound = (req, res, next) => {
  const error = new AppError(`Route not found: ${req.originalUrl}`, 404);
  next(error);
};

// Maps known Sequelize error types to clean, consistent responses.
function handleSequelizeError(err) {
  if (err.name === "SequelizeValidationError") {
    const message = err.errors.map((e) => e.message).join(", ");
    return new AppError(message, 400);
  }
  if (err.name === "SequelizeUniqueConstraintError") {
    const field = err.errors?.[0]?.path || "field";
    return new AppError(`${field} already exists.`, 409);
  }
  if (err.name === "SequelizeForeignKeyConstraintError") {
    return new AppError("Related resource not found or in use.", 400);
  }
  if (err.name === "SequelizeDatabaseError") {
    return new AppError("Invalid data submitted.", 400);
  }
  return null;
}

// Central error handler — must be the LAST middleware registered.
const errorHandler = (err, req, res, next) => {
  let error = err;

  const sequelizeError = handleSequelizeError(err);
  if (sequelizeError) error = sequelizeError;

  if (err.name === "JsonWebTokenError") {
    error = new AppError("Invalid token.", 401);
  }
  if (err.name === "TokenExpiredError") {
    error = new AppError("Session expired.", 401);
  }

  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : "Something went wrong on our end.";

  if (process.env.NODE_ENV === "development") {
    console.error(err);
  }

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = { AppError, catchAsync, notFound, errorHandler };