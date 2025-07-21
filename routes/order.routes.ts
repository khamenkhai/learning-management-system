import express from 'express';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth';
import { createOrder, getAllOrders } from '../controllers/order.controller';

const orderRoutes = express.Router();

orderRoutes.post("/orders", isAuthenticated, createOrder);
orderRoutes.post("/orders", isAuthenticated, getAllOrders);

export default orderRoutes;