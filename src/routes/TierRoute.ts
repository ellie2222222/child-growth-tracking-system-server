import { Router } from "express";
import TierController from "../controllers/TierController";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import TierHandler from "../handlers/TierHandler";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import TierService from "../services/TierService";

const router = Router();
const tierService = new TierService();
const tierController = new TierController(tierService);
const tierHandler = new TierHandler();

router.use(AuthMiddleware);

router.post(
  "/",
  RoleMiddleware([UserEnum.ADMIN]),
  tierHandler.createTier,
  tierController.createTier
);

router.put(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN]),
  tierHandler.updateTier,
  tierController.updateTier
);

router.get(
  "/",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.MEMBER, UserEnum.DOCTOR]),
  tierHandler.getTiers,
  tierController.getTiers
);

router.get(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.MEMBER, UserEnum.DOCTOR]),
  tierController.getTier
);

export default router;
