import { Router } from "express";
import PaymentController from "../controllers/PaymentController";

const route = Router();
const paymentController = new PaymentController();

route.post("/paypal/create", paymentController.createPaypalPayment);
route.get("/paypal/success", paymentController.successPaypalPayment);
route.get("/paypal/failed", paymentController.canceledPaypalPayment);
export default route;
