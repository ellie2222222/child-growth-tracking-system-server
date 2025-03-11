import { Router } from "express";
import StatisticController from "../controllers/StatisticController";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import UserEnum from "../enums/UserEnum";
import StatisticHandler from "../handlers/StatisticHandler";
import StatisticService from "../services/StatisticService";

const statisticService = new StatisticService();
const statisticController = new StatisticController(statisticService);
const router = Router();
const statisticHandler = new StatisticHandler();

router.use(AuthMiddleware);

router.get(
  "/revenue",
  RoleMiddleware([UserEnum.ADMIN]),
  statisticHandler.getRevenue,
  statisticController.getRevenue
);

export default router;
