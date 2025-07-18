import express from 'express';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth';
import { createOrder } from '../controllers/order.controller';

const orderRoutes = express.Router();

orderRoutes.post("/orders", isAuthenticated, createOrder);

export default orderRoutes;