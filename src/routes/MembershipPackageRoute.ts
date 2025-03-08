import { Router } from "express";
import MembershipPackageController from "../controllers/MembershipPackageController";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import MembershipPackageHandler from "../handlers/MembershipPackageHandler";
import AuthMiddleware from "../middlewares/AuthMiddleware";

const membershipPackageController = new MembershipPackageController();
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
  RoleMiddleware([UserEnum.MEMBER, UserEnum.DOCTOR, UserEnum.ADMIN]),
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
  RoleMiddleware([UserEnum.MEMBER, UserEnum.DOCTOR, UserEnum.ADMIN]),
  membershipPackageHandler.getMembershipPackage,
  membershipPackageController.getMembershipPackage
);

export default router;
