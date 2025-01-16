import { Router } from "express";
import ReceiptController from "../controllers/ReceiptController";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
const receiptController = new ReceiptController();
const router = Router();

router.get(
  "/",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.SUPER_ADMIN]),
  receiptController.getAllReceipts
);
router.get("/by-userId", receiptController.getReceiptsByUserId);
router.get("/:id", receiptController.getReceiptById);
router.delete("/:id", receiptController.deleteReceiptById);

export default router;
