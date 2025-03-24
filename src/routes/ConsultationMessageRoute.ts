import { Router } from "express";

import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import { uploadFile } from "../middlewares/storeFile";
import AuthMiddleware from "../middlewares/AuthMiddleware";

import ConsultationMessageHandler from "../handlers/ConsultationMessageHandler";

import ConsultationMessageController from "../controllers/ConsultationMessageController";

import ConsultationMessageService from "../services/ConsultationMessageService";

import ConsultationRepository from "../repositories/ConsultationRepository";
import UserRepository from "../repositories/UserRepository";
import ConsultationMessageRepository from "../repositories/ConsultationMessageRepository";

const consultationRepository = new ConsultationRepository();
const userRepository = new UserRepository();
const consultationMessageRepository = new ConsultationMessageRepository();

const consultationMessageService = new ConsultationMessageService(
  consultationRepository,
  userRepository,
  consultationMessageRepository
);

const consultationMessageController = new ConsultationMessageController(
  consultationMessageService
);
const consultationMessageHandler = new ConsultationMessageHandler();
const consultationMessageRouter = Router();

consultationMessageRouter.use(AuthMiddleware);

consultationMessageRouter.post(
  "/",
  RoleMiddleware([UserEnum.DOCTOR, UserEnum.MEMBER]),
  uploadFile.array("messageAttachments"),
  consultationMessageHandler.createConsultationMessage,
  consultationMessageController.createConsultationMessage
);

consultationMessageRouter.get(
  "/consultations/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.DOCTOR, UserEnum.MEMBER, UserEnum.ADMIN]),
  consultationMessageHandler.getConsultationMessages,
  consultationMessageController.getConsultationMessages
);

consultationMessageRouter.get(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.DOCTOR, UserEnum.MEMBER, UserEnum.ADMIN]),
  consultationMessageHandler.getConsultationMessage,
  consultationMessageController.getConsultationMessage
);

consultationMessageRouter.put(
  "/:id",
  RoleMiddleware([UserEnum.DOCTOR, UserEnum.MEMBER]),
  uploadFile.array("messageAttachments"),
  consultationMessageHandler.updateConsultationMessage,
  consultationMessageController.updateConsultationMessage
);

consultationMessageRouter.delete(
  "/:id",
  RoleMiddleware([UserEnum.MEMBER, UserEnum.DOCTOR]),
  consultationMessageHandler.deleteConsultationMessage,
  consultationMessageController.deleteConsultationMessage
);

export default consultationMessageRouter;
