import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/errorHandler";
import dotenv from "dotenv";
import { redis } from "../utils/redis";
import catchAsyncError from "../middlewares/catchAsyncError";
import { v2 as cloudinary } from "cloudinary";
import { createCourse } from "../services/course.service";
import CourseModel, { ICourse } from "../models/course_model";
import mongoose from "mongoose";
import sendMail from "../utils/sendMail";
import ejs from "ejs";
import path from "path";
dotenv.config();

// create course
export const uploadCourse = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;

      const thumbnail = data.thumbnail;

      if (thumbnail) {
        const myCloud = await cloudinary.uploader.upload(thumbnail, {
          folder: "courses",
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };

        createCourse(data, res);
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
// register user
export const editCourse = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;

      const thumbnail = data.thumbnail;

      if (thumbnail) {
        const myCloud = await cloudinary.uploader.upload(thumbnail, {
          folder: "courses",
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      const courseId = req.params.id;

      const course = await CourseModel.findByIdAndUpdate(
        courseId,
        {
          $set: data,
        },
        { new: true }
      );

      res.status(200).json({
        status: true,
        data: course
      })
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);


export const getSingleCourse = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    const courseId = req.params.id;

    const course = await CourseModel.findById(courseId);

    const isCacheExist = await redis.get(courseId);

    if (isCacheExist) {
      const course = JSON.parse(isCacheExist);
      res.status(200).json({
        success: true,
        data: course
      });
    }

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Manually remove unwanted fields from each courseData object
    const filteredCourse = {
      ...course.toObject(),
      courseData: course.courseData.map((item) => ({
        _id: item._id,
        title: item.title,
        description: item.description,
        videoThumbnail: item.videoThumbnail,
        videoSection: item.videoSection,
        videoLength: item.videoLength,
        videoPlayer: item.videoPlayer,
        comments: item.comments,
        questions: item.questions,
      })),
    };

    res.status(200).json({
      success: true,
      data: filteredCourse,
    });
  }
);


export const getAllCourses = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const courseId = req.params.id;

    const course = await CourseModel.find().select(
      "-courseData.videoUrl -courseData.suggestion  -courseData.links"
      // "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
    );

    res.status(200).json({
      success: true,
      data: course,
    });
  }
);

// get course content - only for valid user
export const getCourseByUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {

      const userCourseList = req.user?.courses;

      console.log(`user course list => ${req.user?.courses}`);

      const courseId = req.params.id;

      const courseExist = userCourseList?.find((course: any) => course._id.toString() === courseId);

      if (!courseExist) {
        return next(new ErrorHandler("Your are not eligibale to access this course!", 400));
      }

      const course = await CourseModel.findById(courseId);

      const content = course?.courseData;

      res.status(200).json({
        success: true,
        data: content
      });

    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);


// add question in course
interface IAddQuestionData {
  question: string;
  courseId: string;
  contentId: string;
}

export const addQuestion = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { question, courseId, contentId }: IAddQuestionData = req.body;

    const course = await CourseModel.findById(courseId);

    if (!course) {
      return next(new ErrorHandler("Invalid course!", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return next(new ErrorHandler("Invalid content id!", 400));
    }

    const courseContent = course?.courseData?.find((item: any) => item._id.equals(contentId));

    if (!courseContent) {
      return next(new ErrorHandler("Invalid content id!", 400));
    }
    // create new question
    const newQuestion: any = {
      user: req.user,
      question: question,
      questionReplies: []
    }

    courseContent.questions.push(newQuestion);

    await course.save();

    res.status(200).json({
      success: true,
      data: course
    });

  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// add question in course
interface IAddAnswerData {
  answer: string;
  courseId: string;
  contentId: string;
  questionId: string;
}

export const addAnswer = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { answer, courseId, contentId, questionId }: IAddAnswerData = req.body;

    const course = await CourseModel.findById(courseId);

    if (!course) {
      return next(new ErrorHandler("Invalid course!", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return next(new ErrorHandler("Invalid content id!", 400));
    }

    const courseContent = course?.courseData?.find((item: any) => item._id.equals(contentId));

    if (!courseContent) {
      return next(new ErrorHandler("Invalid content id!", 400));
    }

    const question = courseContent.questions.find((question: any) => question._id.equals(questionId));

    if (!question) {
      return next(new ErrorHandler("Invalid question!", 400));
    }
    // create new question
    const newAnswer: any = {
      user: req.user,
      answer: answer
    }

    question.questionReplies.push(newAnswer);

    await course.save();

    if (req.user?._id === question.user.id) {
      // create a notification

    } else {
      const data = {
        name: question.user.name,
        title: courseContent.title
      };

      const html = await ejs.renderFile(path.join(__dirname, "../mails/question-reply.ejs"), data);

      try {
        await sendMail({
          email: question.user.name,
          subject: "Question Reply",
          template: "question-reply.ejs",
          data
        })
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
    }

    res.status(200).json({
      success: true,
      data: course
    });

  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});


// add review in course
interface IAddReviewCourse {
  review: string;
  rating: number;
  userId: string;
}

export const addReview = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {

    const userCourseList = req.user?.courses;

    const courseId = req.params.id;

    const courseExist = userCourseList?.some((course: any) => course._id === courseId);

    if (!courseExist) {
      return next(new ErrorHandler("You are not eligible to access this course!", 400));
    }

    const course = await CourseModel.findById(courseId);

    const { review, rating } = req.body as IAddReviewCourse;

    const reviewData: any = {
      user: req.user,
      rating: rating,
      comment: review
    }

    course?.review.push(reviewData);

    let avg = 0;

    course?.review.forEach((rev: any) => {
      avg += rev.rating
    });

    await course?.save();

    const notification = {
      title: "New Review Received!",
      message: `${req.user?.name} has given a name in ${course?.name}`
    }

    res.status(200).json({
      success: true,
      data: course
    });

  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});



interface IAddReviewReply {
  reviewId: string;
  reply: string;
  courseId: string;
}

export const addReviewReply = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reviewId, reply, courseId }: IAddReviewReply = req.body;

    const course = await CourseModel.findById(courseId);

    if (!course) {
      return next(new ErrorHandler("Invalid course ID", 400));
    }

    const review = course.review.find((rev: any) => rev._id.equals(reviewId));

    if (!review) {
      return next(new ErrorHandler("Review not found", 404));
    }

    const replyObj : any= {
      user: req.user,
      comment: reply,
      commentReplies: []
    };

    review.commentReplies.push(replyObj);

    await course.save();

    res.status(200).json({
      success: true,
      message: "Reply added successfully",
      data: course
    });

  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});


