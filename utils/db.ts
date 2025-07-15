// import mongoose from "mongoose";
// import dotenv from "dotenv";
// dotenv.config();
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const dbUrl: string = process.env.DB_URI || '';

const connectDB = async () => {
  
  console.log(`Attempting to connect to MongoDB... (URI: ${dbUrl.replace(/:[^@]+@/, ':********@')}`); // Hide password in logs
  
  try {
    mongoose.set('debug', true);
    const conn = await mongoose.connect(dbUrl, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB connected...`);
    // console.log(`✅ MongoDB connected to ${conn.connection.host}`);
    return conn;
  } catch (err: any) {
    console.error("❌ MongoDB connection failed:", err.message);
    console.error("Full error:", err);
    process.exit(1);
  }
};

export default connectDB;

