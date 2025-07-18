import { Response, Request, NextFunction } from "express";
import catchAsyncError from "./catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../utils/redis";
import { IUser } from "../models/user_model";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const isAuthenticated = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {

  const accessToken = req.cookies.access_token;

  if (!accessToken) {
    return next(new ErrorHandler("Please login to access this resource!", 400));
  }

  const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN as string) as JwtPayload;

  if (!decoded) {
    return next(new ErrorHandler("Access token is not valid!", 400));
  }

  const user = await redis.get(decoded.id);

  if (!user) {
    return next(new ErrorHandler("User not found!", 400));
  }

  req.user = JSON.parse(user);

  next();
});


// validate user roles
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || '')) {
      return next(new ErrorHandler(`Role ${req.user?.role} is not allowed to access this resource`, 403));
    }
    next();
  }
}