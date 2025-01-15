import { NextFunction, Request, Response } from "express";
import { client, redirectUrl } from "../config/paypalConfig";
import paypal from "@paypal/checkout-server-sdk";
import { v4 as uuidv4 } from "uuid";
import StatusCodeEnums from "../enums/StatusCodeEnum";

class PaymentController {
  async createPaymentController(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { price } = req.body;
    const uniqueInvoiceId = uuidv4();

    try {
      // Create a new order request
      const request = new paypal.orders.OrdersCreateRequest();
      request.requestBody({
        intent: "CAPTURE",
        purchase_units: [
          {
            invoice_id: uniqueInvoiceId,
            amount: {
              currency_code: "USD",
              value: price,
            },
          },
        ],
        application_context: {
          brand_name: "Your Company Name",
          landing_page: "LOGIN",
          shipping_preference: "GET_FROM_FILE",
          user_action: "PAY_NOW",
          return_url: `${redirectUrl.return_url}`,
          cancel_url: `${redirectUrl.cancel_url}`,
        },
      });

      // Execute the request
      const response = await client.execute(request);

      // Find the approval link
      const approvalLink = response.result.links?.find(
        (link: any) => link.rel === "approve"
      )?.href;

      if (approvalLink) {
        res.status(StatusCodeEnums.OK_200).json({ link: approvalLink });
      } else {
        res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: "Approval link not found." });
      }
    } catch (error) {
      next(error);
    }
  }
  async successPaymentController(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const { token } = req.query;
    console.log("Token: ", token);
    if (!token) {
      return res
        .status(StatusCodeEnums.BadRequest_400)
        .json({ message: "Missing payment token." });
    }
    try {
      const request = new paypal.orders.OrdersCaptureRequest(token as string);
      const response = await client.execute(request);
      const { status, purchase_units } = response.result;
      if (status === "COMPLETED") {
        const capturedPaymentDetails =
          purchase_units?.[0].payments?.captures?.[0];
        const transactionId = capturedPaymentDetails?.id;

        //bussiness logic

        return res.status(StatusCodeEnums.OK_200).json({
          message: "Payment processed successfully.",
          transactionId,
          details: response.result,
        });
      } else {
        return res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: "Failed to process payment.", status });
      }
    } catch (error) {
      next(error);
    }
  }
  async canceledPaymentController(
    req: Request,
    res: Response
    // next: NextFunction
  ): Promise<void> {
    res
      .status(StatusCodeEnums.BadRequest_400)
      .json("Payment request was canceled");
  }
}

export default PaymentController;
