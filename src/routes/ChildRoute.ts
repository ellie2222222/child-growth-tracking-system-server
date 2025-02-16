import express from "express";
import ChildHandler from "../handlers/ChildHandler";
import ChildController from "../controllers/ChildController";
import GrowthDataController from "../controllers/GrowthDataController";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import AuthMiddleware from "../middlewares/AuthMiddleware";

const childRoutes = express.Router();
const childHandler = new ChildHandler();
const childController = new ChildController();
const growthDataController = new GrowthDataController();

childRoutes.use(AuthMiddleware);

childRoutes.post(
  "/",
  RoleMiddleware([UserEnum.MEMBER]),
  childHandler.createChild,
  childController.createChild
);

childRoutes.get(
  "/",
  RoleMiddleware([UserEnum.MEMBER, UserEnum.DOCTOR]),
  childHandler.getChildrenByUserId,
  childController.getChildrenByUserId
);

childRoutes.put(
  "/:childId",
  RoleMiddleware([UserEnum.MEMBER]),
  childHandler.updateChild,
  childController.updateChild
);

childRoutes.delete(
  "/:childId",
  RoleMiddleware([UserEnum.MEMBER]),
  childHandler.deleteChild,
  childController.deleteChild
);

childRoutes.get(
  "/:childId",
  RoleMiddleware([UserEnum.MEMBER, UserEnum.DOCTOR]),
  childHandler.getChildById,
  childController.getChildById
);

childRoutes.get(
  "/:childId/growth-data",
  RoleMiddleware([UserEnum.MEMBER, UserEnum.DOCTOR]),
  growthDataController.getGrowthDataByChildId
);

childRoutes.post(
  "/:childId/growth-data",
  RoleMiddleware([UserEnum.MEMBER]),
  growthDataController.createGrowthData
);

childRoutes.put(
  "/:childId/growth-data/:growthDataId",
  RoleMiddleware([UserEnum.MEMBER]),
  growthDataController.updateGrowthData
);

childRoutes.delete(
  "/:childId/growth-data/:growthDataId",
  RoleMiddleware([UserEnum.MEMBER]),
  growthDataController.deleteGrowthData
);

childRoutes.get(
  "/:childId/growth-data/:growthDataId",
  RoleMiddleware([UserEnum.MEMBER, UserEnum.DOCTOR]),
  growthDataController.getGrowthDataById
);

export default childRoutes;
