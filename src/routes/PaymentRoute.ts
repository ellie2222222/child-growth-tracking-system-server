import { Router } from "express";
import PaymentController from "../controllers/PaymentController";

const route = Router();
const paymentController = new PaymentController();

route.post("/paypal/create", paymentController.createPayment);
route.get("/paypal/success", paymentController.successPayment);
route.get("/paypal/failed", paymentController.canceledPayment);
export default route;
