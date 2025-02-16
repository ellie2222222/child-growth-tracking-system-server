import express from "express";
import { uploadFile } from "../middlewares/storeFile";
import GrowthMetricsHandler from "../handlers/GrowthMetricsHandler";
import GrowthMetricsController from "../controllers/GrowthMetricsController";
import AuthMiddleware from "../middlewares/AuthMiddleware";

const growthMetricsRoute = express.Router();
const growthMetricsHandler = new GrowthMetricsHandler();
const growthMetricsController = new GrowthMetricsController();

growthMetricsRoute.use(AuthMiddleware);

growthMetricsRoute.post(
    "/upload",
    uploadFile.single("excelFile"),
    growthMetricsHandler.uploadGrowthMetricsFile, 
    growthMetricsController.uploadGrowthMetricsFile
);

export default growthMetricsRoute;