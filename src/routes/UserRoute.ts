import express from "express";

// import AuthMiddleware from "../middlewares/AuthMiddleware";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import AuthMiddleware from "../middlewares/AuthMiddleware";

import UserHandler from "../handlers/UserHandler";
import UserController from "../controllers/UserController";
import UserService from "../services/UserService";
import SessionService from "../services/SessionService";

import TierRepository from "../repositories/TierRepository";
import UserRepository from "../repositories/UserRepository";
import SessionRepository from "../repositories/SessionRepository";
import MembershipPackageRepository from "../repositories/MembershipPackageRepository";
import ConsultationRepository from "../repositories/ConsultationRepository";

const userRepository = new UserRepository();
const sessionRepository = new SessionRepository();
const tierRepository = new TierRepository();
const membershipPackageRepository = new MembershipPackageRepository();
const consultationRepository = new ConsultationRepository();

const sessionService = new SessionService(sessionRepository);
const userService = new UserService(
  userRepository,
  sessionService,
  membershipPackageRepository,
  tierRepository,
  consultationRepository
);
const userController: UserController = new UserController(userService);
const userHandler: UserHandler = new UserHandler();
const userRoutes = express.Router();

userRoutes.use(AuthMiddleware);

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
  "/:userId/role",
  RoleMiddleware([UserEnum.ADMIN]),
  userController.updateRole
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
