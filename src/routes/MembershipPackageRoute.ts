import { Router } from "express";

import AuthMiddleware from "../middlewares/AuthMiddleware";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";

import MembershipPackageHandler from "../handlers/MembershipPackageHandler";
import MembershipPackageController from "../controllers/MembershipPackageController";
import MembershipPackageService from "../services/MembershipPackagesService";

import MembershipPackageRepository from "../repositories/MembershipPackageRepository";
import UserRepository from "../repositories/UserRepository";

const membershipPackageRepository = new MembershipPackageRepository();
const userRepository = new UserRepository();

const membershipPackageService = new MembershipPackageService(
  membershipPackageRepository,
  userRepository
);

const membershipPackageController = new MembershipPackageController(
  membershipPackageService
);

const membershipPackageHandler = new MembershipPackageHandler();
const router = Router();

router.use(AuthMiddleware);

router.post(
  "/",
  RoleMiddleware([UserEnum.ADMIN]),
  membershipPackageHandler.createMembershipPackage,
  membershipPackageController.createMembershipPackage
);

router.get(
  "/",
  // RoleMiddleware([UserEnum.MEMBER, UserEnum.DOCTOR, UserEnum.ADMIN]),
  membershipPackageHandler.getMembershipPackages,
  membershipPackageController.getMembershipPackages
);

router.put(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN]),
  membershipPackageHandler.updateMembershipPackage,
  membershipPackageController.updateMembershipPackage
);

router.delete(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN]),
  membershipPackageHandler.deleteMembershipPackage,
  membershipPackageController.deleteMembershipPackage
);

router.get(
  "/:id",
  // RoleMiddleware([UserEnum.MEMBER, UserEnum.DOCTOR, UserEnum.ADMIN]),
  membershipPackageHandler.getMembershipPackage,
  membershipPackageController.getMembershipPackage
);

export default router;
