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
  receiptController.getAllReceipts
);
router.get(
  "/by-userId",
  receiptHandler.getReceiptsByUserId,
  receiptController.getReceiptsByUserId
);
router.get(
  "/:id",
  receiptHandler.getReceiptById,
  receiptController.getReceiptById
);
router.delete(
  "/:id",
  receiptHandler.deleteReceiptById,
  receiptController.deleteReceiptById
);

export default router;
