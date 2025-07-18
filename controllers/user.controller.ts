import { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../models/user_model";
import ErrorHandler from "../utils/errorHandler";
import catchAsyncError from "../middlewares/catchAsyncError";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
import dotenv from "dotenv";
import { accessTokenOption, refreshTokenOption, sendToken } from "../utils/jwt";
import { redis } from "../utils/redis";
import { getUserById } from "../services/user.service";
import { v2 as cloudinary } from "cloudinary";
dotenv.config();

// register user
interface IRegisterationBody {
    name: string;
    email: string;
    password: string;
    avatar?: string;
}

// register user
export const registrationUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
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

export const activateUser = catchAsyncError(
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

export const login = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
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

export const logout = catchAsyncError(
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

// update access token
export const updateAccessToken = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refresh_token = req.cookies.refresh_token as string;
        const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN as string) as JwtPayload;
        const message = "Could not refresh token!";
        if (!decoded) {
            return next(new ErrorHandler(message, 400));
        }

        const session = await redis.get(decoded.id as string);

        if (!session) {
            return next(new ErrorHandler(message, 400));
        }

        const user = JSON.parse(session);

        const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN as string, {
            expiresIn: "5m"
        });
        const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN as string, {
            expiresIn: "5m"
        });

        res.cookie("access_token", accessToken, accessTokenOption);
        res.cookie("refresh_token", refreshToken, refreshTokenOption);

        req.user = user;

        res.status(200).json({
            status: "success",
            accessToken: accessToken
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

/// get user data
export const getUserInfo = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?._id as string;

        console.log(`=> userid ${userId}`);
        getUserById(userId, res);
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

/// social auth
export const socialAuth = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, name, avatar } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            const newUser = await userModel.create({ name, email, avatar });
            sendToken(newUser, 201, res);
        } else {
            sendToken(user, 200, res);
        }
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});


interface IUpdateUserBody {
    name?: string;
    avatar?: string;
    email?: string; // optional if you allow email updates
    password?: string; // optional if you want to support password change
}

export const updateUserInfo = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?._id as string;

            const user = await userModel.findById(userId).select("+password");

            if (!user) {
                return next(new ErrorHandler("User not found", 404));
            }

            const { name, email } = req.body;

            if (name) user.name = name;
            if (email) user.email = email;

            await user.save();

            res.status(200).json({
                success: true,
                message: "User info updated successfully",
                user,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
);




interface IUpdatePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export const updatePassword = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id as string;
      const { oldPassword, newPassword } = req.body as IUpdatePasswordRequest;

      if (!oldPassword || !newPassword) {
        return next(new ErrorHandler("Both old and new passwords are required", 400));
      }

      const user = await userModel.findById(userId).select("+password");

      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      const isMatch = await user.comparePassword(oldPassword);

      if (!isMatch) {
        return next(new ErrorHandler("Old password is incorrect", 400));
      }

      user.password = newPassword; // will be hashed by pre-save hook
      await user.save();

      res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Update profile picture
export const updateProfilePicture = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { avatar } = req.body;

      const userId = req.user?._id as string;
      const user = await userModel.findById(userId);

      if (avatar && user) {
        // If user already has an avatar, delete the old one
        if (user.avatar?.public_id) {
          await cloudinary.uploader.destroy(user.avatar.public_id);
        }

        const myCloud = await cloudinary.uploader.upload(avatar, {
          folder: "avatars",
          width: 150,
        });

        user.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      } else {
        const myCloud = await cloudinary.uploader.upload(avatar, {
          folder: "avatars",
          width: 150,
        });

        if(!user){
            throw next(new ErrorHandler("User is null!",400));
        }
        user.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      await user?.save();
      await redis.set(userId, JSON.stringify(user));

      res.status(200).json({
        success: true,
        message: "Avatar updated successfully",
      });
    } catch (error: any) {
      next(error);
    }
  }
);
