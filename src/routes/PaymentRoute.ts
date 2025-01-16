import { Router } from "express";
import PaymentController from "../controllers/PaymentController";

const route = Router();
const paymentController = new PaymentController();

route.post("/paypal/create", paymentController.createPaymentController);
route.get("/paypal/success", paymentController.successPaymentController);
route.get("/paypal/failed", paymentController.canceledPaymentController);
export default route;
