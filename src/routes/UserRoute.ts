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

userRoutes.get(
  "/",
  RoleMiddleware([
    UserEnum.ADMIN,
    UserEnum.SUPER_ADMIN,
    UserEnum.MEMBER,
    UserEnum.DOCTOR,
  ]),
  userHandler.getUsers,
  userController.getUsers
);

userRoutes.get(
  "/:id",
  RoleMiddleware([
    UserEnum.ADMIN,
    UserEnum.SUPER_ADMIN,
    UserEnum.MEMBER,
    UserEnum.DOCTOR,
  ]),
  userHandler.getUserById,
  userController.getUserById
);

userRoutes.patch(
  "/:id",
  RoleMiddleware([
    UserEnum.ADMIN,
    UserEnum.SUPER_ADMIN,
    UserEnum.MEMBER,
    UserEnum.DOCTOR,
  ]),
  userHandler.updateUser,
  userController.updateUser
);

userRoutes.delete(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.SUPER_ADMIN]),
  userHandler.deleteUser,
  userController.deleteUser
);

userRoutes.put(
  "/remove-membership/:id",
  RoleMiddleware([
    UserEnum.ADMIN,
    UserEnum.SUPER_ADMIN,
    UserEnum.MEMBER,
    UserEnum.DOCTOR,
  ]),
  userController.removeCurrentSubscription
);
export default userRoutes;
