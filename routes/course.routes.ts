import express from 'express';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth';
import { addAnswer, addQuestion, addReview, editCourse, getAllCourses, getCourseByUser, getSingleCourse, uploadCourse } from '../controllers/course.controller';

const courseRoutes = express.Router();

courseRoutes.post("/courses", isAuthenticated, authorizeRoles("admin"), uploadCourse);
courseRoutes.put("/courses", isAuthenticated, authorizeRoles("admin"), editCourse);
courseRoutes.get("/courses/:id", isAuthenticated, authorizeRoles("admin"), getSingleCourse);
courseRoutes.get("/courses", isAuthenticated, getAllCourses);
courseRoutes.get("/get-course-content/:id", isAuthenticated, getCourseByUser);
courseRoutes.put("/add-question", isAuthenticated, addQuestion);
courseRoutes.put("/add-anwer", isAuthenticated, addAnswer);
courseRoutes.put("/add-review/:id", isAuthenticated, addReview);

export default courseRoutes;