import { Router } from "express";
import PaymentController from "../controllers/PaymentController";
import PaymentHandler from "../handlers/PaymentHandler";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import PaymentService from "../services/PaymentService";
import PaymentQueue from "../queue/PaymentQueue";

const route = Router();
const paymentService = new PaymentService();
const paymentQueue = new PaymentQueue();
const paymentController = new PaymentController(paymentQueue, paymentService);
const handler = new PaymentHandler();

route.use(AuthMiddleware);

route.post(
  "/paypal/create",
  RoleMiddleware([UserEnum.DOCTOR, UserEnum.MEMBER]),
  handler.createPaypalPayment,
  paymentController.createPaypalPayment
);
route.get("/paypal/success", paymentController.successPaypalPayment);
route.get("/paypal/failed", paymentController.canceledPaypalPayment);

route.post(
  "/vnpay/create",
  RoleMiddleware([UserEnum.DOCTOR, UserEnum.MEMBER]),
  handler.createVnpayPayment,
  paymentController.createVnpayPayment
);
route.get("/vnpay/callback", paymentController.vnpayPaymentReturn);

export default route;
