import { Router } from "express";
import TierController from "../controllers/TierController";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import TierHandler from "../handlers/TierHandler";

const router = Router();
const tierController = new TierController();
const tierHandler = new TierHandler();

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

router.get("/", tierController.getTiers);

router.get("/:id", tierController.getTier);

export default router;
