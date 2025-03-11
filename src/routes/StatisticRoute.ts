import { Router } from "express";

import RoleMiddleware from "../middlewares/RoleMiddleware";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import UserEnum from "../enums/UserEnum";

import StatisticHandler from "../handlers/StatisticHandler";
import StatisticController from "../controllers/StatisticController";
import StatisticService from "../services/StatisticService";
import ReceiptRepository from "../repositories/ReceiptRepository";

const receiptRepository = new ReceiptRepository();
const statisticService = new StatisticService(receiptRepository);
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

export default router;
