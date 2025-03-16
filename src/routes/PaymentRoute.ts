import { Router } from "express";

import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import AuthMiddleware from "../middlewares/AuthMiddleware";

import PaymentHandler from "../handlers/PaymentHandler";
import PaymentController from "../controllers/PaymentController";
import PaymentService from "../services/PaymentService";
import PaymentQueue from "../queue/PaymentQueue";

import MembershipPackageRepository from "../repositories/MembershipPackageRepository";
import UserRepository from "../repositories/UserRepository";
import ConsultationRepository from "../repositories/ConsultationRepository";
import SessionRepository from "../repositories/SessionRepository";
import MembershipPackageService from "../services/MembershipPackagesService";
import SessionService from "../services/SessionService";
import UserService from "../services/UserService";
import ReceiptRepository from "../repositories/ReceiptRepository";
import ReceiptService from "../services/ReceiptService";

const sessionRepository = new SessionRepository();
const userRepository = new UserRepository();
const membershipPackageRepository = new MembershipPackageRepository();
const consultationRepository = new ConsultationRepository();
const receiptRepository = new ReceiptRepository();

const membershipPackageService = new MembershipPackageService(
  membershipPackageRepository,
  userRepository
);

const sessionService = new SessionService(sessionRepository);
const userService = new UserService(
  userRepository,
  sessionService,
  membershipPackageRepository,
  consultationRepository
);

const paymentService = new PaymentService(
  membershipPackageService,
  userService
);

const receiptService = new ReceiptService(
  receiptRepository,
  membershipPackageRepository,
  userRepository
);
const paymentQueue = new PaymentQueue(receiptService, userService);
const paymentController = new PaymentController(paymentQueue, paymentService);
const handler = new PaymentHandler();

const route = Router();

route.use(AuthMiddleware);

route.post(
  "/paypal/create",
  RoleMiddleware([UserEnum.MEMBER]),
  handler.createPaypalPayment,
  paymentController.createPaypalPayment
);
route.get("/paypal/success", paymentController.successPaypalPayment);
route.get("/paypal/failed", paymentController.canceledPaypalPayment);

route.post(
  "/vnpay/create",
  RoleMiddleware([UserEnum.MEMBER]),
  handler.createVnpayPayment,
  paymentController.createVnpayPayment
);
route.get("/vnpay/callback", paymentController.vnpayPaymentReturn);

export default route;
