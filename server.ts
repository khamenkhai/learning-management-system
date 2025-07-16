import { app } from "./app";
import dotenv from 'dotenv';
import { v2 as cloudinary } from "cloudinary";
import connectDB from "./utils/db";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_APK_KEY,
  api_secret: process.env.CLOUD_SECRET_KEY!,
});

// create server
app.listen(process.env.PORT, async() => {
    console.log(`=> Server is running on ${process.env.PORT}`);
    await connectDB();
});