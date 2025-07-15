import express from 'express';
import { activateUser, login, logout, registrationUser } from "../controllers/user.controller";
import { isAuthenticated } from '../middlewares/auth';
const userRoutes = express.Router();

userRoutes.post("/register", registrationUser);
userRoutes.post("/login", login);
userRoutes.get("/logout", isAuthenticated, logout);
userRoutes.post("/activate-user", activateUser);
userRoutes.get("/test", isAuthenticated,(req,res)=>{
    res.json({
        message : "Hello world"
    })
});

export default userRoutes;