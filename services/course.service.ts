import catchAsyncError from "../middlewares/catchAsyncError";
import CourseModel from "../models/course_model";
import userModel from "../models/user_model"
import { NextFunction, Response } from "express";

export const createCourse = async (data: any, res: Response) => {
    const course = await CourseModel.create(data);

    res.status(201).json({
        success: true,
        data: course,
    });
}


export const getAllCourses = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {

    const courses = await CourseModel.find().sort({ createdAt: -1 }); // Optional: add filters, populate, etc.

    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses,
    });
});
