import express from "express";
import {
  createLayout,
  getAllLayouts,
  getSingleLayout,
  updateLayout,
  deleteLayout
} from "../controllers/layout.controller";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth";

const layoutRoutes = express.Router();

// === Admin Layout Management ===
layoutRoutes.post("/admin/layouts", isAuthenticated, authorizeRoles("admin"), createLayout);
layoutRoutes.get("/admin/layouts", isAuthenticated, authorizeRoles("admin"), getAllLayouts);
layoutRoutes.get("/admin/layouts/:id", isAuthenticated, authorizeRoles("admin"), getSingleLayout);
layoutRoutes.put("/admin/layouts/:id", isAuthenticated, authorizeRoles("admin"), updateLayout);
layoutRoutes.delete("/admin/layouts/:id", isAuthenticated, authorizeRoles("admin"), deleteLayout);

export default layoutRoutes;
