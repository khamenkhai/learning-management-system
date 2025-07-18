import cookieParser from 'cookie-parser';
import express, { Application, Request, Response } from "express";
import cors from 'cors';
import errorMiddleware from './middlewares/errors';
import userRoutes from './routes/user.routes';
import courseRoutes from './routes/course.routes';
import orderRoutes from './routes/order.routes';
import notificationRoutes from './routes/notification.routes';

export const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

app.use(cors({
  origin: process.env.ORIGIN,
}));


// auth
app.use("/api/v1", userRoutes)
app.use("/api/v1", courseRoutes)
app.use("/api/v1", orderRoutes)
app.use("/api/v1", notificationRoutes)

// ✅ Test route
app.get('/api/test', (req, res, next) => {
  next(new Error("Something weong wrong"));
  // res.status(200).json({ message: 'API is working!' });
});


// 404 handler
app.use((_req: Request, _res: Response, next) => {
  _res.status(404).json({ message: 'Route not found' });
});

app.use(errorMiddleware);
