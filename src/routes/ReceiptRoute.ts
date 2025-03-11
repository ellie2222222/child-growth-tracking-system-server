import { Router } from "express";

import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import AuthMiddleware from "../middlewares/AuthMiddleware";

import ReceiptHandler from "../handlers/ReceiptHandler";
import ReceiptController from "../controllers/ReceiptController";

import ReceiptService from "../services/ReceiptService";

import UserRepository from "../repositories/UserRepository";
import MembershipPackageRepository from "../repositories/MembershipPackageRepository";
import ReceiptRepository from "../repositories/ReceiptRepository";

const userRepository = new UserRepository();
const membershipPackageRepository = new MembershipPackageRepository();
const receiptRepository = new ReceiptRepository();

const receiptService = new ReceiptService(
  receiptRepository,
  membershipPackageRepository,
  userRepository
);

const receiptController = new ReceiptController(receiptService);
const receiptHandler = new ReceiptHandler();

const router = Router();

router.use(AuthMiddleware);

router.get(
  "/",
  RoleMiddleware([UserEnum.ADMIN]),
  receiptHandler.getAllReceipts,
  receiptController.getAllReceipts
);

router.get(
  "/users/:userId",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.MEMBER, UserEnum.DOCTOR]),
  receiptHandler.getReceiptsByUserId,
  receiptController.getReceiptsByUserId
);

router.get(
  "/:id",
  RoleMiddleware([UserEnum.ADMIN, UserEnum.MEMBER, UserEnum.DOCTOR]),
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
