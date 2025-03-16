import { Router } from "express";

import AuthMiddleware from "../middlewares/AuthMiddleware";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";

import RequestHandler from "../handlers/RequestHandler";
import RequestController from "../controllers/RequestController";
import RequestService from "../services/RequestService";

import UserRepository from "../repositories/UserRepository";
import ConsultationRepository from "../repositories/ConsultationRepository";
import ChildRepository from "../repositories/ChildRepository";
import RequestRepository from "../repositories/RequestRepository";

const consultationRepository = new ConsultationRepository();
const userRepository = new UserRepository();
const childRepository = new ChildRepository();
const requestRepository = new RequestRepository();

const requestService = new RequestService(
  requestRepository,
  userRepository,
  childRepository,
  consultationRepository
);

const requestController = new RequestController(requestService);
const requestHandler = new RequestHandler();

const requestRouter = Router();
requestRouter.use(AuthMiddleware);

requestRouter.put(
  "/status/:id",
  RoleMiddleware([UserEnum.DOCTOR, UserEnum.MEMBER, UserEnum.ADMIN]),
  requestHandler.updateRequestStatus,
  requestController.updateRequestStatus
);

requestRouter.post(
  "/",
  RoleMiddleware([UserEnum.MEMBER]),
  requestHandler.createRequest,
  requestController.createRequest
);

requestRouter.delete(
  "/:id",
  RoleMiddleware([UserEnum.MEMBER]),
  requestHandler.deleteRequest,
  requestController.deleteRequest
);

requestRouter.get(
  "/",
  RoleMiddleware([UserEnum.ADMIN]),
  requestHandler.getAllRequests,
  requestController.getAllRequests
);

requestRouter.get(
  "/users/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.DOCTOR, UserEnum.MEMBER]),
  requestHandler.getRequestsByUserId,
  requestController.getRequestsByUserId
);

requestRouter.get(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.DOCTOR, UserEnum.MEMBER]),
  requestHandler.getRequest,
  requestController.getRequest
);

export default requestRouter;
