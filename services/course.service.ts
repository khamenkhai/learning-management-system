import courseModel from "../models/course_model";
import userModel from "../models/user_model"
import { Response } from "express";

export const createCourse = async (data: any, res: Response) => {
    const course = await courseModel.create(data);

    res.status(201).json({
        success: true,
        data: course,
    });
}