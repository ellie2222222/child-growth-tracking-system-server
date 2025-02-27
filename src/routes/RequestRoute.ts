import { Router } from "express";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import RequestHandler from "../handlers/RequestHandler";
import RequestController from "../controllers/RequestController";
import AuthMiddleware from "../middlewares/AuthMiddleware";

const requestRouter = Router();
const requestHandler = new RequestHandler();
const requestController = new RequestController();

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
  RoleMiddleware([UserEnum.ADMIN, UserEnum.SUPER_ADMIN]),
  requestHandler.getAllRequests,
  requestController.getAllRequests
);

requestRouter.get(
  "/users/:id",
  RoleMiddleware([
    UserEnum.ADMIN,
    UserEnum.SUPER_ADMIN,
    UserEnum.DOCTOR,
    UserEnum.MEMBER,
  ]),
  requestHandler.getRequestsByUserId,
  requestController.getRequestsByUserId
);

requestRouter.get(
  "/:id",
  RoleMiddleware([
    UserEnum.ADMIN,
    UserEnum.DOCTOR,
    UserEnum.MEMBER,
    UserEnum.SUPER_ADMIN,
  ]),
  requestHandler.getRequest,
  requestController.getRequest
);

export default requestRouter;
