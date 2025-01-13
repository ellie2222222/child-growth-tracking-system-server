import express from "express";
import UserController from "../controllers/UserController";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";

const userController: UserController = new UserController();

const userRoutes = express.Router();

userRoutes.get("/:userId/role", RoleMiddleware([UserEnum.ADMIN, UserEnum.SUPER_ADMIN]), userController.updateRole);

export default userRoutes;
