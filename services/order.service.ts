import { NextFunction } from "express";
import catchAsyncError from "../middlewares/catchAsyncError";
import OrderModel from "../models/order_model";

export const newOrder = catchAsyncError(async (data: any, res: Response, next: NextFunction) => {
    const order = OrderModel.create(data);
    next(order);
});

export const newOrder2 = catchAsyncError(async (data: any, res: Response, next: NextFunction) => {
    const order = OrderModel.create(data);
    next(order);
})
