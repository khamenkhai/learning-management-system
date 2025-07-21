import { Request, Response, NextFunction } from "express";
import LayoutModel from "../models/layout_model";
import catchAsyncError from "../middlewares/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";

// CREATE Layout
export const createLayout = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const layout = await LayoutModel.create(req.body);

  res.status(201).json({
    success: true,
    data: layout,
  });
});

// GET all Layouts
export const getAllLayouts = catchAsyncError(async (_req: Request, res: Response) => {
  const layouts = await LayoutModel.find();
  res.status(200).json({
    success: true,
    data: layouts,
  });
});

// GET single Layout
export const getSingleLayout = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const layout = await LayoutModel.findById(req.params.id);

  if (!layout) return next(new ErrorHandler("Layout not found", 404));

  res.status(200).json({
    success: true,
    data: layout,
  });
});

// UPDATE Layout
export const updateLayout = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const layout = await LayoutModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!layout) return next(new ErrorHandler("Layout not found", 404));

  res.status(200).json({
    success: true,
    data: layout,
  });
});

// DELETE Layout
export const deleteLayout = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const layout = await LayoutModel.findByIdAndDelete(req.params.id);

  if (!layout) return next(new ErrorHandler("Layout not found", 404));

  res.status(200).json({
    success: true,
    message: "Layout deleted successfully",
  });
});
