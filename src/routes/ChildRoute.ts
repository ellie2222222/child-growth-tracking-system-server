import express from "express";
import ChildHandler from "../handlers/ChildHandler";
import ChildController from "../controllers/ChildController";
import HealthDataController from "../controllers/HealthDataController";

const childRoutes = express.Router();
const childHandler = new ChildHandler();
const childController = new ChildController();
const healthDataController = new HealthDataController();

childRoutes.post("/", childHandler.createChild, childController.createChild);

childRoutes.get("/", childHandler.getChildren, childController.getChildrenByUserId);

childRoutes.put("/:childId", childHandler.updateChild, childController.updateChild);

childRoutes.delete("/:childId", childHandler.deleteChild, childController.deleteChild);

childRoutes.get("/:childId", childHandler.getChild, childController.getChildById);

childRoutes.get("/:childId/health-data", childHandler.getChild, healthDataController.getHealthDataByChildId);

childRoutes.post("/:childId/health-data", healthDataController.createHealthData);

childRoutes.put("/:childId/health-data/:healthDataId", healthDataController.updateHealthData);

childRoutes.delete("/:childId/health-data/:healthDataId", healthDataController.deleteHealthData);

childRoutes.get("/:childId/health-data/:healthDataId", healthDataController.getHealthDataById);

export default childRoutes;