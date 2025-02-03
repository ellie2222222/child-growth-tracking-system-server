import express from "express";
import { uploadFile } from "../middlewares/storeFile";
import GrowthMetricsHandler from "../handlers/GrowthMetricsHandler";
import GrowthMetricsController from "../controllers/GrowthMetricsController";

const growthMetricsRoute = express.Router();
const growthMetricsHandler = new GrowthMetricsHandler();
const growthMetricsController = new GrowthMetricsController();

growthMetricsRoute.post(
    "/upload",
    uploadFile.single("excelFile"),
    growthMetricsHandler.uploadGrowthMetricsFile, 
    growthMetricsController.uploadGrowthMetricsFile
);

export default growthMetricsRoute;