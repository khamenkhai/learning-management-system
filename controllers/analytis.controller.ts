import { Request, Response, NextFunction } from "express";
import { Model } from "mongoose";
import userModel from "../models/user_model";
import courseModel from "../models/course_model";
import ErrorHandler from "../utils/errorHandler";
import catchAsyncError from "../middlewares/catchAsyncError";
import { generateLast12MothsData } from "../utils/analytis.generator";

type ModelName = "users" | "courses";

export const getLast12MonthsStats = catchAsyncError(
    async (req: Request<{ modelName: ModelName }>, res: Response, next: NextFunction) => {
        const { modelName } = req.params;

        let model: Model<any>; // or use more specific types if available

        switch (modelName) {
            case "users":
                model = userModel;
                break;
            case "courses":
                model = courseModel;
                break;
            default:
                // This should theoretically never happen due to the type on req.params
                return next(new ErrorHandler("Invalid model name", 400));
        }

        const data = await generateLast12MothsData(model);

        res.status(200).json({
            success: true,
            data,
        });
    }
);