import { Router } from "express";
import ConsultationHandler from "../handlers/ConsultationHandler";
import ConsultationController from "../controllers/ConsultationController";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import ConsultationService from "../services/ConsultationService";

const consultationRouter = Router();
const consultationService = new ConsultationService();
const consultationHandler = new ConsultationHandler();
const consultationController = new ConsultationController(consultationService);

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
  RoleMiddleware([UserEnum.ADMIN, UserEnum.DOCTOR, UserEnum.MEMBER]),
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
