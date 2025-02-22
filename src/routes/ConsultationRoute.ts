import { Router } from "express";
import ConsultationHandler from "../handlers/ConsultationHandler";
import ConsultationController from "../controllers/ConsultationController";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import AuthMiddleware from "../middlewares/AuthMiddleware";

const consultationRouter = Router();

const consultationHandler = new ConsultationHandler();
const consultationController = new ConsultationController();

consultationRouter.use(AuthMiddleware);

consultationRouter.put(
  "/update-status/:id",
  RoleMiddleware([UserEnum.MEMBER, UserEnum.ADMIN, UserEnum.SUPER_ADMIN]),
  consultationHandler.updateConsultationStatus,
  consultationController.updateConsultationStatus
);

consultationRouter.get(
  "/",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.SUPER_ADMIN]),
  consultationHandler.getConsultations,
  consultationController.getConsultations
);

consultationRouter.get(
  "/by-userId/:id",
  RoleMiddleware([
    UserEnum.ADMIN,
    UserEnum.SUPER_ADMIN,
    UserEnum.DOCTOR,
    UserEnum.MEMBER,
  ]),
  consultationHandler.getConsultationsByUserId,
  consultationController.getConsultationsByUserId
);

consultationRouter.get(
  "/:id",
  RoleMiddleware([
    UserEnum.ADMIN,
    UserEnum.SUPER_ADMIN,
    UserEnum.DOCTOR,
    UserEnum.MEMBER,
  ]),
  consultationHandler.getConsultation,
  consultationController.getConsultation
);

consultationRouter.delete(
  "/:id",
  RoleMiddleware([UserEnum.MEMBER, UserEnum.ADMIN, UserEnum.SUPER_ADMIN]),
  consultationHandler.deleteConsultation,
  consultationController.deleteConsultation
);

export default consultationRouter;
