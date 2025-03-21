import { Router } from "express";

import RoleMiddleware from "../middlewares/RoleMiddleware";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import UserEnum from "../enums/UserEnum";

import StatisticHandler from "../handlers/StatisticHandler";
import StatisticController from "../controllers/StatisticController";
import StatisticService from "../services/StatisticService";
import ReceiptRepository from "../repositories/ReceiptRepository";
import UserRepository from "../repositories/UserRepository";

const receiptRepository = new ReceiptRepository();
const userRepository = new UserRepository();

const statisticService = new StatisticService(
  receiptRepository,
  userRepository
);

const statisticController = new StatisticController(statisticService);
const statisticHandler = new StatisticHandler();

const router = Router();

router.use(AuthMiddleware);

router.get(
  "/revenue",
  RoleMiddleware([UserEnum.ADMIN]),
  statisticHandler.getRevenue,
  statisticController.getRevenue
);

router.get(
  "/users",
  RoleMiddleware([UserEnum.ADMIN]),
  statisticHandler.getNewUsers,
  statisticController.getNewUsers
);
export default router;
