import express from 'express';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth';
import { editCourse, uploadCourse } from '../controllers/course.controller';

const courseRoutes = express.Router();

courseRoutes.post("/courses", isAuthenticated,authorizeRoles("admin"), uploadCourse);
courseRoutes.put("/courses", isAuthenticated,authorizeRoles("admin"), editCourse);


export default courseRoutes;