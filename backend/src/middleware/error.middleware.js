import { ApiError } from '../utils/ApiError.js';

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message = err.message || 'Internal server error';

  const response = {
    status: 'error',
    message,
    requestId: req.requestId,
  };

  if (err instanceof ApiError && err.details) {
    response.details = err.details;
  }

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}
