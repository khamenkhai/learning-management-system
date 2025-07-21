import express from 'express';
import {
  activateUser,
  deleteUser,
  getAllUsers,
  getUserInfo,
  login,
  logout,
  registrationUser,
  socialAuth,
  updateAccessToken,
  updatePassword,
  updateProfilePicture,
  updateUserInfo,
  updateUserRole
} from "../controllers/user.controller";
import { authorizeRoles, isAuthenticated } from '../middlewares/auth';

const userRoutes = express.Router();

// Auth
userRoutes.post("/auth/register", registrationUser);
userRoutes.post("/auth/login", login);
userRoutes.post("/auth/activate", activateUser);
userRoutes.get("/auth/refresh-token", updateAccessToken);
userRoutes.get("/auth/logout", isAuthenticated, logout);
userRoutes.post("/auth/social", socialAuth);

// Profile (me)
userRoutes.get("/me", isAuthenticated, getUserInfo);
userRoutes.put("/me", isAuthenticated, updateUserInfo);
userRoutes.put("/me/password", isAuthenticated, updatePassword);
userRoutes.put("/me/avatar", isAuthenticated, updateProfilePicture);

// Admin routes
userRoutes.get("/admin/users", isAuthenticated, authorizeRoles("admin"), getAllUsers);
userRoutes.put("/admin/users/:id/role", isAuthenticated, authorizeRoles("admin"), updateUserRole);
userRoutes.delete("/admin/users/:id", isAuthenticated, authorizeRoles("admin"), deleteUser);

export default userRoutes;
