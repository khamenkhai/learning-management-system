import express from 'express';
import { activateUser, getUserInfo, login, logout, registrationUser, socialAuth, updateAccessToken, updatePassword, updateProfilePicture, updateUserInfo } from "../controllers/user.controller";
import { isAuthenticated } from '../middlewares/auth';

const userRoutes = express.Router();

userRoutes.post("/register", registrationUser);

userRoutes.post("/login", login);

userRoutes.get("/logout", isAuthenticated, logout);

userRoutes.post("/activate-user", activateUser);

userRoutes.get("/refreshtoken", updateAccessToken);

userRoutes.get("/me", isAuthenticated, getUserInfo);

userRoutes.get("/socialAuth", socialAuth);

userRoutes.put("/update-user", updateUserInfo);

userRoutes.put("/me/update-password", isAuthenticated, updatePassword);

userRoutes.put("/me/update-avatar", isAuthenticated, updateProfilePicture);

// userRoutes.get("/test", isAuthenticated, (req, res) => {
//     res.json({
//         message: "Hello world"
//     })
// });

export default userRoutes;