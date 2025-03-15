import express from "express";

import AuthMiddleware from "../middlewares/AuthMiddleware";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";

import ChildHandler from "../handlers/ChildHandler";
import GrowthDataHandler from "../handlers/GrowthDataHandler";

import ChildController from "../controllers/ChildController";
import GrowthDataController from "../controllers/GrowthDataController";

import ChildService from "../services/ChildService";
import GrowthDataService from "../services/GrowthDataService";

import ChildRepository from "../repositories/ChildRepository";
import UserRepository from "../repositories/UserRepository";
import MembershipPackageRepository from "../repositories/MembershipPackageRepository";
import GrowthDataRepository from "../repositories/GrowthDataRepository";
import ConfigRepository from "../repositories/ConfigRepository";
import GrowthMetricsRepository from "../repositories/GrowthMetricsRepository";
import validateMembership from "../middlewares/MembershipMiddleware";

const growthMetricsRepository = new GrowthMetricsRepository();
const configRepository = new ConfigRepository();
const growthDataRepository = new GrowthDataRepository();
const childRepository = new ChildRepository();
const userRepository = new UserRepository();
const membershipPackageRepository = new MembershipPackageRepository();

const childService = new ChildService(
  childRepository,
  userRepository,
  membershipPackageRepository
);
const growthDataService = new GrowthDataService(
  growthDataRepository,
  userRepository,
  childRepository,
  configRepository,
  growthMetricsRepository
);

const childController = new ChildController(childService);
const growthDataController = new GrowthDataController(growthDataService);

const childHandler = new ChildHandler();
const growthDataHandler = new GrowthDataHandler();

const childRoutes = express.Router();

childRoutes.use(AuthMiddleware);

childRoutes.post(
  "/growth-data/public",
  growthDataHandler.publicGenerateGrowthData,
  growthDataController.publicGenerateGrowthData
);

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
  "/:childId/growth-velocity",
  growthDataHandler.getGrowthDataByChildId,
  RoleMiddleware([UserEnum.MEMBER, UserEnum.DOCTOR]),
  growthDataController.generateGrowthVelocityByChildId
);

childRoutes.get(
  "/:childId/growth-data",
  growthDataHandler.getGrowthDataByChildId,
  RoleMiddleware([UserEnum.MEMBER, UserEnum.DOCTOR]),
  growthDataController.getGrowthDataByChildId
);

childRoutes.post(
  "/:childId/growth-data",
  validateMembership("updateChildDataLimit"),
  growthDataHandler.createGrowthData,
  RoleMiddleware([UserEnum.MEMBER]),
  growthDataController.createGrowthData
);

childRoutes.put(
  "/:childId/growth-data/:growthDataId",
  growthDataHandler.updateGrowthData,
  RoleMiddleware([UserEnum.MEMBER]),
  growthDataController.updateGrowthData
);

childRoutes.delete(
  "/:childId/growth-data/:growthDataId",
  growthDataHandler.deleteGrowthData,
  RoleMiddleware([UserEnum.MEMBER]),
  growthDataController.deleteGrowthData
);

childRoutes.get(
  "/:childId/growth-data/:growthDataId",
  growthDataHandler.getGrowthDataById,
  RoleMiddleware([UserEnum.MEMBER, UserEnum.DOCTOR]),
  growthDataController.getGrowthDataById
);

export default childRoutes;
