import express from "express";
import UserController from "../controllers/UserController";
// import AuthMiddleware from "../middlewares/AuthMiddleware";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import UserHandler from "../handlers/UserHandler";
import AuthMiddleware from "../middlewares/AuthMiddleware";

const userController: UserController = new UserController();
const userHandler: UserHandler = new UserHandler();
const userRoutes = express.Router();

userRoutes.use(AuthMiddleware);

userRoutes.get(
  "/:userId/role",
  RoleMiddleware([UserEnum.ADMIN]),
  userController.updateRole
);

userRoutes.post(
  "/",
  RoleMiddleware([UserEnum.ADMIN]),
  userHandler.createUser,
  userController.createUser
);

userRoutes.get(
  "/",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.MEMBER, UserEnum.DOCTOR]),
  userHandler.getUsers,
  userController.getUsers
);

userRoutes.get(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.MEMBER, UserEnum.DOCTOR]),
  userHandler.getUserById,
  userController.getUserById
);

userRoutes.patch(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.MEMBER, UserEnum.DOCTOR]),
  userHandler.updateUser,
  userController.updateUser
);

userRoutes.delete(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN]),
  userHandler.deleteUser,
  userController.deleteUser
);

userRoutes.put(
  "/remove-membership/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.MEMBER, UserEnum.DOCTOR]),
  userController.removeCurrentSubscription
);

userRoutes.post(
  "/consultation/:id/rating",
  RoleMiddleware([UserEnum.MEMBER]),
  userController.createConsultationRating
);

userRoutes.put(
  "/consultation/:id/rating",
  RoleMiddleware([UserEnum.MEMBER]),
  userController.updateConsultationRating
);

userRoutes.delete(
  "/consultation/:id/rating",
  RoleMiddleware([UserEnum.MEMBER]),
  userController.removeConsultationRating
);
export default userRoutes;
