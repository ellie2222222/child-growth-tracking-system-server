import { Router } from "express";
import MembershipPackageController from "../controllers/MembershipPackageController";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import MembershipPackageHandler from "../handlers/MembershipPackageHandler";

const membershipPackageController = new MembershipPackageController();
const membershipPackageHandler = new MembershipPackageHandler();
const router = Router();

router.post(
  "/",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.SUPER_ADMIN]),
  membershipPackageHandler.createMembershipPackage,
  membershipPackageController.createMembershipPackage
);

router.get(
  "/",
  membershipPackageHandler.getMembershipPackages,
  membershipPackageController.getMembershipPackages
);

router.put(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.SUPER_ADMIN]),
  membershipPackageHandler.updateMembershipPackage,
  membershipPackageController.updateMembershipPackage
);

router.delete(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.SUPER_ADMIN]),
  membershipPackageHandler.deleteMembershipPackage,
  membershipPackageController.deleteMembershipPackage
);

router.get(
  "/:id",
  membershipPackageHandler.getMembershipPackage,
  membershipPackageController.getMembershipPackage
);

export default router;
