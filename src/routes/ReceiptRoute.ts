import { Router } from "express";
import ReceiptController from "../controllers/ReceiptController";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import ReceiptHandler from "../handlers/ReceiptHandler";
const receiptController = new ReceiptController();
const router = Router();

const receiptHandler = new ReceiptHandler();

router.get(
  "/",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.SUPER_ADMIN]),
  receiptHandler.getAllReceipts,
  receiptController.getAllReceipts
);

router.get(
  "/by-userId",
  RoleMiddleware([
    UserEnum.ADMIN,
    UserEnum.SUPER_ADMIN,
    UserEnum.MEMBER,
    UserEnum.DOCTOR,
  ]),
  receiptHandler.getReceiptsByUserId,
  receiptController.getReceiptsByUserId
);

router.get(
  "/:id",
  RoleMiddleware([
    UserEnum.ADMIN,
    UserEnum.SUPER_ADMIN,
    UserEnum.MEMBER,
    UserEnum.DOCTOR,
  ]),
  receiptHandler.getReceiptById,
  receiptController.getReceiptById
);

//can be commented?
router.delete(
  "/:id",
  RoleMiddleware([UserEnum.MEMBER, UserEnum.DOCTOR]),
  receiptHandler.deleteReceiptById,
  receiptController.deleteReceiptById
);

export default router;
