import express from 'express';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth';
import {
    uploadCourse,
    editCourse,
    getSingleCourse,
    getAllCourses,
    getCourseByUser,
    addQuestion,
    addAnswer,
    addReview,
    deleteCourse
} from '../controllers/course.controller';

const courseRoutes = express.Router();

// === Admin Course Management ===
courseRoutes.post("/admin/courses", isAuthenticated, authorizeRoles("admin"), uploadCourse);
courseRoutes.put("/admin/courses/:id", isAuthenticated, authorizeRoles("admin"), editCourse);
courseRoutes.get("/admin/courses/:id", isAuthenticated, authorizeRoles("admin"), getSingleCourse);
courseRoutes.get("/admin/courses", isAuthenticated, authorizeRoles("admin"), getAllCourses);
courseRoutes.delete("/admin/courses/:id", isAuthenticated, authorizeRoles("admin"), deleteCourse);

// === User Course Access ===
courseRoutes.get("/my-courses/:id", isAuthenticated, getCourseByUser);

// === User Interactions ===
courseRoutes.post("/courses/:courseId/questions", isAuthenticated, addQuestion);
courseRoutes.post("/courses/:courseId/answers", isAuthenticated, addAnswer);
courseRoutes.post("/courses/:courseId/reviews", isAuthenticated, addReview);

export default courseRoutes;
