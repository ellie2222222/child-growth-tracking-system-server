import { Router } from "express";
import PaymentController from "../controllers/PaymentController";
import PaymentHandler from "../handlers/PaymentHandler";
const route = Router();
const paymentController = new PaymentController();
const handler = new PaymentHandler();
route.post(
  "/paypal/create",
  handler.createPaypalPayment,
  paymentController.createPaypalPayment
);
route.get("/paypal/success", paymentController.successPaypalPayment);
route.get("/paypal/failed", paymentController.canceledPaypalPayment);

route.post(
  "/vnpay/create",
  handler.createVnpayPayment,
  paymentController.createVnpayPayment
);
route.get("/vnpay/callback", paymentController.vnpayPaymentReturn);

export default route;
