import express from "express";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth";
import { getLast12MonthsStats } from "../controllers/analytis.controller";

const statsRoutes = express.Router();

// Example: /api/v1/stats/users or /api/v1/stats/courses
statsRoutes.get(
  "/analytis/:modelName",
  isAuthenticated,
  authorizeRoles("admin"),
  getLast12MonthsStats
);

export default statsRoutes;
