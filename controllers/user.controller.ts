import { Request, Response, NextFunction } from "express";
import userModel from "../models/user_model";
import { ErrorHandler } from "../utils/errorHandler";
import catchAsyncErrors from "../middlewares/catchAsyncError";
import jwt, { Secret } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// register user
interface IRegisterationBody {
    name: string;
    email: string;
    password: string;
    avatar?: string;
}

// register user
export const registrationUser = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body;

        const isEmailExist = await userModel.findOne({ email });

        if (isEmailExist) {
            return next(new ErrorHandler("Email already exist", 400));
        }

        const user: IRegisterationBody = {
            name,
            email,
            password
        };

        const activationToken = createActivationToken(user);
    } catch (error) {

    }
});


// activation token
interface IActivationToken {
    token: string,
    activationCode: string
}

export const createActivationToken = (user: any): IActivationToken => {

    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const token = jwt.sign({
        user, activationCode
    }, process.env.ACTIVATION_SECRET as Secret, {
        expiresIn: "5M"
    });

    return { token, activationCode }
}