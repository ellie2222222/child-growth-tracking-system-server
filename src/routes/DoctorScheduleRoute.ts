import { Router } from "express";

import RoleMiddleware from "../middlewares/RoleMiddleware";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import UserEnum from "../enums/UserEnum";
import DoctorScheduleController from "../controllers/DoctorScheduleController";
import DoctorScheduleHandler from "../handlers/DoctorScheduleHandler";
import DoctorScheduleService from "../services/DoctorScheduleService";
import DoctorScheduleRepository from "../repositories/DoctorScheduleRepository";
import UserRepository from "../repositories/UserRepository";

const doctorScheduleRepository = new DoctorScheduleRepository();
const userRepository = new UserRepository();
const doctorScheduleService = new DoctorScheduleService(doctorScheduleRepository, userRepository);
const scheduleController = new DoctorScheduleController(doctorScheduleService);
const scheduleHandler = new DoctorScheduleHandler();

const scheduleRouter = Router();

scheduleRouter.use(AuthMiddleware);

scheduleRouter.post(
  "/",
  RoleMiddleware([UserEnum.DOCTOR]),
  scheduleHandler.createSchedule,
  scheduleController.createSchedule
);

scheduleRouter.get(
  "/:scheduleId",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.DOCTOR, UserEnum.MEMBER]),
  scheduleHandler.getSchedule,
  scheduleController.getSchedule
);

scheduleRouter.put(
  "/:scheduleId",
  RoleMiddleware([UserEnum.DOCTOR, UserEnum.ADMIN]),
  scheduleHandler.updateSchedule,
  scheduleController.updateSchedule
);

scheduleRouter.delete(
  "/:scheduleId",
  RoleMiddleware([UserEnum.DOCTOR, UserEnum.ADMIN]),
  scheduleHandler.deleteSchedule,
  scheduleController.deleteSchedule
);

scheduleRouter.get(
  "/users/:userId",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.DOCTOR, UserEnum.MEMBER]),
  scheduleHandler.getSchedulesByUserId,
  scheduleController.getSchedulesByUserId
);

export default scheduleRouter;
