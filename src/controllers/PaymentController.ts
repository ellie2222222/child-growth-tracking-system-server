import { NextFunction, Request, Response } from "express";
import { client, redirectUrl } from "../config/paypalConfig";
import paypal from "@paypal/checkout-server-sdk";
import { v4 as uuidv4 } from "uuid";
import StatusCodeEnums from "../enums/StatusCodeEnum";
import ReceiptService from "../services/ReceiptService";
interface ILink {
  href: string;
  rel: string;
  method: string;
}
class PaymentController {
  private receiptService: ReceiptService;

  constructor() {
    this.receiptService = new ReceiptService();
  }
  createPayment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { price } = req.body;
    const userId = req.userInfo.userId;
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
            custom_id: userId,
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
        (link: ILink) => link.rel === "approve"
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
  };
  successPayment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { token } = req.query;
    // console.log("Token: ", token);

    if (!token) {
      res
        .status(StatusCodeEnums.BadRequest_400)
        .json({ message: "Missing payment token." });
      return;
    }

    try {
      const request = new paypal.orders.OrdersCaptureRequest(token as string);
      const response = await client.execute(request);
      const { status, purchase_units } = response.result;

      if (status === "COMPLETED") {
        const capturedPaymentDetails =
          purchase_units?.[0].payments?.captures?.[0];
        const transactionId = capturedPaymentDetails?.id;

        const data = {
          userId: capturedPaymentDetails?.custom_id,
          totalAmount: {
            value: capturedPaymentDetails?.amount?.value,
            currency: capturedPaymentDetails?.amount?.currency_code,
          },
          paymentMethod: "PAYPAL",
          paymentGateway: "PAYPAL",
          type: "PAYMENT",
        };

        // const receipt =
        await this.receiptService.createReceipt(
          data.userId,
          transactionId,
          data.totalAmount,
          data.paymentGateway,
          data.paymentMethod,
          data.type
        );
        // if (!receipt) {
        //   console.log("Receipt not created");
        // } else {
        //   console.log("Receipt created", receipt);
        // }

        res.status(StatusCodeEnums.OK_200).json({
          message: "Payment processed successfully.",
          transactionId,
          details: response.result,
        });

        return;
      } else {
        res
          .status(StatusCodeEnums.InternalServerError_500)
          .json({ message: "Failed to process payment.", status });
        return;
      }
    } catch (error) {
      next(error);
    }
  };
  canceledPayment = async (
    req: Request,
    res: Response
    // next: NextFunction
  ): Promise<void> => {
    res
      .status(StatusCodeEnums.BadRequest_400)
      .json("Payment request was canceled");
  };
}

export default PaymentController;
