import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/errorHandler";

const errorMiddleware = (
  err: ErrorHandler | any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server error!";

  // Handle CastError (usually invalid MongoDB ID)
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Handle duplicate key errors (MongoDB error code 11000)
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new ErrorHandler(message, 400);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Json web token is invalid. Try again!';
    err = new ErrorHandler(message, 400);
  }

  // Handle JWT expired error
  if (err.name === 'TokenExpiredError') {
    const message = 'Json web token is expired. Please login again!';
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    // Include stack trace in development only
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

export default errorMiddleware;