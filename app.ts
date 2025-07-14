import cookieParser from 'cookie-parser';
import express, { Application, Request, Response } from "express";
import cors from 'cors';
import errorMiddleware from './middlewares/errors';

export const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

app.use(cors({
  origin: process.env.ORIGIN,
}));

app.use(errorMiddleware);

// ✅ Test route
app.get('/api/test', (req, res) => {
  res.status(200).json({ message: 'API is working!' });
});


// 404 handler
app.use((_req: Request, _res: Response, next) => {
  _res.status(404).json({ message: 'Route not found' });
});
