import mongoose, { Schema, Document, Types, Model } from "mongoose";
import { IUser } from "./user_model";

interface IComment extends Document {
  user: Object;
  comment: string;
  commentReplies?: IComment[];
}
interface IQuestion extends Document {
  user: IUser;
  question: string;
  questionReplies: [Object];
}

interface IReview extends Document {
  user: IUser;
  rating: number;
  comment: string;
  commentReplies: IComment[];
}

interface ILink extends Document {
  title: string;
  url: string;
}

interface ICourseData extends Document {
  title: string;
  description: string;
  videoUrl: string;
  videoThumbnail: object;
  videoSection: string;
  videoLength: number;
  videoPlayer: string;
  links: ILink[];
  suggestion: string;
  comments: IComment[];
  questions: IQuestion[];
}
export interface ICourse extends Document {
  name: string;
  description: string;
  price: number;
  estimatedPrice?: number;
  thumbnail: object;
  tags: string;
  level: string;
  demoUrl: string;
  benefits: { title: string }[];
  prerequisites: { title: string }[];
  review: IReview[];
  courseData: ICourseData[];
  rating?: number;
  purchased?: number;
}

///

// IReview Schema
const reviewSchema = new Schema<IReview>({
  user: Object,
  rating: { type: Number, required: true },
  comment: String,
  //   commentReplies: [Object],
});

// ILink Schema
const linkSchema = new Schema<ILink>({
  title: String,
  url: String,
});

// IComment Schema
const commentSchema = new Schema<IComment>({
  user: Object,
  comment: String,
  commentReplies: [Object],
});

const questionSchema = new Schema<IQuestion>({
  user: Object,
  question: String,
  questionReplies: [Object],
});

const courseDataSchema = new Schema<ICourseData>({
  title: String,
  description: String,
  videoUrl: String,
  videoThumbnail: Object,
  videoSection: String,
  videoLength: Number,
  videoPlayer: String,
  links: [linkSchema],
  suggestion: String,
  comments: [commentSchema],
  questions: [questionSchema]
});

// ICourse Schema
const courseSchema = new Schema<ICourse>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  estimatedPrice: { type: Number },
  thumbnail: {
    public_id: {
      required: true,
      type: String,
    },
    url: {
      required: true,
      type: String,
    },
  },
  tags: { type: String, required: true },
  level: { type: String, required: true },
  demoUrl: { type: String, required: true },
  benefits: [{ title: String }],
  prerequisites: [{ title: String }],
  review: [reviewSchema],
  courseData: [courseDataSchema],
  rating: { type: Number, default: 0 },
  purchased: { type: Number, default: 0 },
});

const CourseModel: Model<ICourse> = mongoose.model("Course", courseSchema);

export default CourseModel;
