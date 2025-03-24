import express from "express";

import { uploadFile } from "../middlewares/storeFile";
import AuthMiddleware from "../middlewares/AuthMiddleware";

import GrowthMetricsHandler from "../handlers/GrowthMetricsHandler";
import GrowthMetricsController from "../controllers/GrowthMetricsController";
import GrowthMetricsService from "../services/GrowthMetricsService";
import ConfigRepository from "../repositories/ConfigRepository";
import GrowthMetricsRepository from "../repositories/GrowthMetricsRepository";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";

const configRepository = new ConfigRepository();
const growthMetricsRepository = new GrowthMetricsRepository();
const growthMetricService = new GrowthMetricsService(
  growthMetricsRepository,
  configRepository
);
const growthMetricsController = new GrowthMetricsController(
  growthMetricService
);
const growthMetricsHandler = new GrowthMetricsHandler();

const growthMetricsRoute = express.Router();

growthMetricsRoute.use(AuthMiddleware);

growthMetricsRoute.post(
  "/upload",
  RoleMiddleware([UserEnum.ADMIN]),
  uploadFile.single("excelFile"),
  growthMetricsHandler.uploadGrowthMetricsFile,
  growthMetricsController.uploadGrowthMetricsFile
);

export default growthMetricsRoute;
