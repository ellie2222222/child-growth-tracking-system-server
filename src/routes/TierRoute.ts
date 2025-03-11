import { Router } from "express";

import AuthMiddleware from "../middlewares/AuthMiddleware";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";

import TierHandler from "../handlers/TierHandler";
import TierController from "../controllers/TierController";
import TierService from "../services/TierService";
import TierRepository from "../repositories/TierRepository";
import UserRepository from "../repositories/UserRepository";

const userRepository = new UserRepository();
const tierRepository = new TierRepository();

const tierService = new TierService(tierRepository, userRepository);
const tierController = new TierController(tierService);
const tierHandler = new TierHandler();

const router = Router();

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
