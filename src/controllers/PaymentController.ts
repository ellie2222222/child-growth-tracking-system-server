import { NextFunction, Request, Response } from "express";
import { client } from "../config/paypalConfig";
import paypal from "@paypal/checkout-server-sdk";
import StatusCodeEnums from "../enums/StatusCodeEnum";
// import PaymentQueue from "../queue/PaymentQueue";
import querystring from "qs";
import crypto from "crypto";
import { sortObject } from "../utils/payment";
import { vnpayConfig } from "../config/vnpayConfig";
// import PaymentService from "../services/PaymentService";
import { IPaymentQueue } from "../interfaces/queue/IPaymentQueue";
import { IPaymentService } from "../interfaces/services/IPaymentService";

export interface ILink {
  href: string;
  rel: string;
  method: string;
}

export interface VnpParams {
  vnp_Version: string;
  vnp_Command: string;
  vnp_TmnCode: string;
  vnp_Locale: string;
  vnp_Amount: string;
  vnp_CurrCode: string;
  vnp_OrderInfo: string;
  vnp_TxnRef: string;
  vnp_OrderType?: string;
  vnp_ReturnUrl?: string;
  vnp_BankCode?: string;
  [key: string]: string | number | undefined;
}

class PaymentController {
  private paymentQueue: IPaymentQueue;
  private paymentService: IPaymentService;

  constructor(paymentQueue: IPaymentQueue, paymentService: IPaymentService) {
    this.paymentQueue = paymentQueue;
    this.paymentService = paymentService;
  }

  createPaypalPayment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { price, packageId, purchaseType } = req.body;
    const userId = req.userInfo.userId;

    try {
      const approvalLink = await this.paymentService.createPaypalPayment(
        price,
        packageId,
        userId,
        purchaseType
      );

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

  successPaypalPayment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { token } = req.query;

    if (!token) {
      return res.render("PaymentReturn", {
        success: false,
        message: "Missing payment token.",
        frontendUrl: process.env.FRONTEND_URL,
      });
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
          userId: (capturedPaymentDetails?.custom_id as string).split("|")[0],
          membershipPackageId: (
            capturedPaymentDetails?.custom_id as string
          ).split("|")[1],
          totalAmount: {
            value: capturedPaymentDetails?.amount?.value,
            currency: capturedPaymentDetails?.amount?.currency_code,
          },
          transactionId,
          paymentMethod: "PAYPAL",
          paymentGateway: "PAYPAL",
          type: "PAYMENT",
        };

        await this.paymentQueue.sendPaymentData(data);
        const receipt = await this.paymentQueue.consumePaymentData();

        // Render EJS page
        return res.render("PaymentReturn", {
          success: true,
          message: "Payment processed successfully.",
          frontendUrl: process.env.FRONTEND_URL,
          receipt,
        });
      } else {
        return res.render("PaymentReturn", {
          success: false,
          message: "Failed to process payment.",
          frontendUrl: process.env.FRONTEND_URL,
        });
      }
    } catch (error) {
      next(error);
    }
  };

  canceledPaypalPayment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    res.render("PaymentReturn", {
      success: false,
      message: "Your payment request was canceled.",
      frontendUrl: process.env.FRONTEND_URL,
    });
  };

  createVnpayPayment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { price, packageId, bankCode, purchaseType } = req.body;
    const userId = req.userInfo.userId;
    const ipAddr =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    try {
      const vnpUrl = await this.paymentService.createVnpayPayment(
        parseFloat(price as string),
        userId,
        packageId,
        ipAddr as string,
        bankCode,
        purchaseType
      );
      res.status(200).json({ link: vnpUrl });
    } catch (error) {
      next(error);
    }
  };

  vnpayPaymentReturn = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    let vnp_Params = req.query;
    const secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);

    const secretKey = vnpayConfig.vnp_HashSecret;
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash === signed && vnp_Params["vnp_ResponseCode"] === "00") {
      try {
        const amount = parseFloat(vnp_Params.vnp_Amount as string) / 100; // Convert from VND cents

        const data = {
          userId: (vnp_Params.vnp_OrderInfo as string).split("%")[0],
          membershipPackageId: (vnp_Params.vnp_OrderInfo as string).split(
            "%7C"
          )[1],
          totalAmount: {
            value: amount,
            currency: vnp_Params.vnp_CurrCode || "VND",
          },
          transactionId: vnp_Params.vnp_TxnRef,
          paymentMethod: vnp_Params.vnp_CardType,
          paymentGateway: "VNPAY",
          type: "PAYMENT",
          bankCode: vnp_Params.vnp_BankCode,
        };

        await this.paymentQueue.sendPaymentData(data);
        const receipt = await this.paymentQueue.consumePaymentData();

        // Render EJS page
        return res.render("PaymentReturn", {
          success: true,
          message: "Payment processed successfully.",
          frontendUrl: process.env.FRONTEND_URL,
          receipt,
        });
      } catch (error) {
        next(error);
      }
    } else {
      return res.render("PaymentReturn", {
        success: false,
        message: "Payment failed or checksum validation failed.",
        frontendUrl: process.env.FRONTEND_URL,
      });
    }
  };
}
export default PaymentController;
