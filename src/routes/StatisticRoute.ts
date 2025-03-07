import { Router } from "express";
import StatisticController from "../controllers/StatisticController";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import UserEnum from "../enums/UserEnum";
import StatisticHandler from "../handlers/StatisticHandler";

const statisticController = new StatisticController();
const router = Router();
const statisticHandler = new StatisticHandler();

router.use(AuthMiddleware);

router.get(
  "/revenue",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.SUPER_ADMIN]),
  statisticHandler.getRevenue,
  statisticController.getRevenue
);

export default router;
