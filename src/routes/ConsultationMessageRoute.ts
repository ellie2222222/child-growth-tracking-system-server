import { Router } from "express";
import ConsultationMessageController from "../controllers/ConsultationMessageController";
import ConsultationMessageHandler from "../handlers/ConsultationMessageHander";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import { uploadFile } from "../middlewares/storeFile";
import AuthMiddleware from "../middlewares/AuthMiddleware";

const consultationMessageController = new ConsultationMessageController();
const consultationMessageHandler = new ConsultationMessageHandler();
const consultationMessageRouter = Router();

consultationMessageRouter.use(AuthMiddleware);

consultationMessageRouter.post(
  "/",
  RoleMiddleware([UserEnum.DOCTOR, UserEnum.MEMBER]),
  uploadFile.array("messageAttachements"),
  consultationMessageHandler.createConsultationMessage,
  consultationMessageController.createConsultationMessage
);

consultationMessageRouter.get(
  "/consultations/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.DOCTOR, UserEnum.MEMBER]),
  consultationMessageHandler.getConsultationMessages,
  consultationMessageController.getConsultationMessages
);

consultationMessageRouter.get(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.DOCTOR, UserEnum.MEMBER]),
  consultationMessageHandler.getConsultationMessage,
  consultationMessageController.getConsultationMessage
);

consultationMessageRouter.put(
  "/:id",
  RoleMiddleware([UserEnum.DOCTOR, UserEnum.MEMBER]),
  uploadFile.array("messageAttachements"),
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
