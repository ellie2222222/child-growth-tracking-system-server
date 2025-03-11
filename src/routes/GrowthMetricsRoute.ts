import express from "express";
import { uploadFile } from "../middlewares/storeFile";
import GrowthMetricsHandler from "../handlers/GrowthMetricsHandler";
import GrowthMetricsController from "../controllers/GrowthMetricsController";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import GrowthMetricsService from "../services/GrowthMetricsService";

const growthMetricsRoute = express.Router();
const growthMetricsHandler = new GrowthMetricsHandler();
const growthMetricService = new GrowthMetricsService();
const growthMetricsController = new GrowthMetricsController(
  growthMetricService
);

growthMetricsRoute.use(AuthMiddleware);

growthMetricsRoute.post(
  "/upload",
  uploadFile.single("excelFile"),
  growthMetricsHandler.uploadGrowthMetricsFile,
  growthMetricsController.uploadGrowthMetricsFile
);

export default growthMetricsRoute;
