import express from "express";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth";
import { getAllNotifications, updateNotification } from "../controllers/notification.controller";

const notificationRoutes = express.Router();

notificationRoutes.get("/", isAuthenticated, authorizeRoles("admin"), getAllNotifications);

notificationRoutes.put("/:id", isAuthenticated, updateNotification);

export default notificationRoutes;
