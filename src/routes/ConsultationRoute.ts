import { Router } from "express";

import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import AuthMiddleware from "../middlewares/AuthMiddleware";

import ConsultationHandler from "../handlers/ConsultationHandler";
import ConsultationController from "../controllers/ConsultationController";
import ConsultationService from "../services/ConsultationService";

import UserRepository from "../repositories/UserRepository";
import ConsultationRepository from "../repositories/ConsultationRepository";

const consultationRepository = new ConsultationRepository();
const userRepository = new UserRepository();

const consultationService = new ConsultationService(
  consultationRepository,
  userRepository
);

const consultationController = new ConsultationController(consultationService);
const consultationHandler = new ConsultationHandler();

const consultationRouter = Router();

consultationRouter.use(AuthMiddleware);

consultationRouter.put(
  "/status/:id",
  RoleMiddleware([UserEnum.MEMBER, UserEnum.ADMIN]),
  consultationHandler.updateConsultationStatus,
  consultationController.updateConsultationStatus
);

consultationRouter.get(
  "/",
  RoleMiddleware([UserEnum.ADMIN]),
  consultationHandler.getConsultations,
  consultationController.getConsultations
);

consultationRouter.get(
  "/users/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.DOCTOR, UserEnum.MEMBER]),
  consultationHandler.getConsultationsByUserId,
  consultationController.getConsultationsByUserId
);

consultationRouter.get(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.DOCTOR, UserEnum.MEMBER, UserEnum.ADMIN]),
  consultationHandler.getConsultation,
  consultationController.getConsultation
);

consultationRouter.delete(
  "/:id",
  RoleMiddleware([UserEnum.MEMBER, UserEnum.ADMIN]),
  consultationHandler.deleteConsultation,
  consultationController.deleteConsultation
);

export default consultationRouter;
