import { Router } from "express";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import RequestHandler from "../handlers/RequestHandler";
import RequestController from "../controllers/RequestController";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import RequestService from "../services/RequestService";

const requestRouter = Router();
const requestService = new RequestService();
const requestHandler = new RequestHandler();
const requestController = new RequestController(requestService);

requestRouter.use(AuthMiddleware);

requestRouter.put(
  "/status/:id",
  RoleMiddleware([UserEnum.DOCTOR, UserEnum.MEMBER]),
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
