import { NextFunction, Request, Response } from 'express';

const catchAsyncError = (theFunc: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Wrapping in Promise.resolve handles both sync and async errors
    Promise.resolve(theFunc(req, res, next)).catch(next);
  };
};

export default catchAsyncError;