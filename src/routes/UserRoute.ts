import express from "express";
import UserController from "../controllers/UserController";
// import AuthMiddleware from "../middlewares/AuthMiddleware";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import UserHandler from "../handlers/UserHandler";

const userController: UserController = new UserController();
const userHandler: UserHandler = new UserHandler();
const userRoutes = express.Router();

userRoutes.get(
  "/:userId/role",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.SUPER_ADMIN]),
  userController.updateRole
);
userRoutes.post(
  "/",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.SUPER_ADMIN]),
  userHandler.createUser,
  userController.createUser
);
userRoutes.get("/allowed-users", userController.getUsers);
userRoutes.get("/:id", userController.getUserIndivitually);
export default userRoutes;
