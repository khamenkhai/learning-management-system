import { app } from "./app";
import dotenv from 'dotenv';
import connectDB from "./utils/db";
dotenv.config();

// create server
app.listen(process.env.PORT, async() => {
    console.log(`=> Server is running on ${process.env.PORT}`);
    await connectDB();
});