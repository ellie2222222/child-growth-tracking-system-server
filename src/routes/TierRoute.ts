import { Router } from "express";
import TierController from "../controllers/TierController";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import TierHandler from "../handlers/TierHandler";
import AuthMiddleware from "../middlewares/AuthMiddleware";

const router = Router();
const tierController = new TierController();
const tierHandler = new TierHandler();

router.use(AuthMiddleware);

router.post(
  "/",
  RoleMiddleware([UserEnum.SUPER_ADMIN, UserEnum.ADMIN]),
  tierHandler.createTier,
  tierController.createTier
);

router.put(
  "/:id",
  RoleMiddleware([UserEnum.SUPER_ADMIN, UserEnum.ADMIN]),
  tierHandler.updateTier,
  tierController.updateTier
);

router.get(
  "/",
  RoleMiddleware([
    UserEnum.SUPER_ADMIN,
    UserEnum.ADMIN,
    UserEnum.MEMBER,
    UserEnum.DOCTOR,
  ]),
  tierHandler.getTiers,
  tierController.getTiers
);

router.get(
  "/:id",
  RoleMiddleware([
    UserEnum.SUPER_ADMIN,
    UserEnum.ADMIN,
    UserEnum.MEMBER,
    UserEnum.DOCTOR,
  ]),
  tierController.getTier
);

export default router;
