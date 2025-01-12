import express from "express";
import UserController from "../controllers/UserController";
// import AuthMiddleware from "../middlewares/AuthMiddleware";

const userRoutes = express.Router();

// userRoutes.use(AuthMiddleware);

export default userRoutes;
