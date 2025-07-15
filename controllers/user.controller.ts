import { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../models/user_model";
import ErrorHandler from "../utils/errorHandler";
import catchAsyncErrors from "../middlewares/catchAsyncError";
import jwt, { Secret } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
import dotenv from "dotenv";
import { sendToken } from "../utils/jwt";
import { redis } from "../utils/redis";
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

        const activationToken: IActivationToken = createActivationToken(user);

        const activationCode = activationToken.activationCode;

        const data = { user: { name: user.name }, activationCode };

        const html = await ejs.renderFile(path.join(__dirname, "../mails/activation-mails.ejs"), data);

        try {
            await sendMail({
                email: user.email,
                subject: "Activate your account",
                template: "activation-mails.ejs",
                data,
            });

            res.status(201).json({
                success: true,
                message: `Pleace check your email : ${user.email}`,
                activationToken: activationToken.token
            });

        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400))
        }


    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
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

interface IActivationRequest {
    activation_token: string;
    activation_code: string;
}

export const activateUser = catchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { activation_token, activation_code } = req.body as IActivationRequest;

            const newUser: { user: IUser; activationCode: string } = jwt.verify(
                activation_token,
                process.env.ACTIVATION_SECRET as string
            ) as { user: IUser; activationCode: string };

            if (newUser.activationCode !== activation_code) {
                return next(new ErrorHandler("Invalid activation code", 400));
            }

            const { name, email, password } = newUser.user;

            const existUser = await userModel.findOne({ email });

            if (existUser) {
                return next(new ErrorHandler("Email already exist", 400));
            }

            const user = await userModel.create({
                name,
                email,
                password,
            });

            res.status(201).json({
                success: true,
                user,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
);


// login user
interface LoginRequest {
    email: string,
    password: string
}

export const login = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ErrorHandler("Please enter email and password!", 400));
        }

        const user: IUser = await userModel.findOne({ email }).select("+password");

        const isPasswordMatch = await user?.comparePassword(password);

        if (!isPasswordMatch) {
            return next(new ErrorHandler("Invalid email or password!", 400));
        }

        sendToken(user, 200, res);
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
});

export const logout = catchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        res.cookie("access_token", "", {
            maxAge: 1
        });

        res.cookie("refresh_token", "", {
            maxAge: 1
        });

        const userId = req.user?._id as string || "";

        redis.del(userId);

        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    }
);