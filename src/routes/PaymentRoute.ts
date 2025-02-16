import { Router } from "express";
import PaymentController from "../controllers/PaymentController";
import PaymentHandler from "../handlers/PaymentHandler";
import RoleMiddleware from "../middlewares/RoleMiddleware";
import UserEnum from "../enums/UserEnum";
import AuthMiddleware from "../middlewares/AuthMiddleware";
const route = Router();
const paymentController = new PaymentController();
const handler = new PaymentHandler();

route.use(AuthMiddleware);

route.post(
  "/paypal/create",
  RoleMiddleware([
    UserEnum.ADMIN,
    UserEnum.SUPER_ADMIN,
    UserEnum.DOCTOR,
    UserEnum.MEMBER,
  ]),
  handler.createPaypalPayment,
  paymentController.createPaypalPayment
);
route.get("/paypal/success", paymentController.successPaypalPayment);
route.get("/paypal/failed", paymentController.canceledPaypalPayment);

route.post(
  "/vnpay/create",
  RoleMiddleware([
    UserEnum.ADMIN,
    UserEnum.SUPER_ADMIN,
    UserEnum.DOCTOR,
    UserEnum.MEMBER,
  ]),
  handler.createVnpayPayment,
  paymentController.createVnpayPayment
);
route.get("/vnpay/callback", paymentController.vnpayPaymentReturn);

export default route;
