import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { validateMongooseObjectId } from "../utils/validator";

class PaymentHandler {
  createPaypalPayment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const validationErrors: { field: string; error: string }[] = [];
    const { price, packageId, purchaseType } = req.body;

    console.log(typeof price, price, packageId, purchaseType);
    if (!purchaseType) {
      validationErrors.push({
        field: "purchaseType",
        error: "purchaseType is required",
      });
    }

    try {
      await validateMongooseObjectId(packageId);
    } catch {
      validationErrors.push({
        field: "packageId",
        error: `Invalid membership package Id`,
      });
    }

    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      validationErrors.push({
        field: "price",
        error: `Invalid price`,
      });
    }

    if (validationErrors.length > 0) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: "Validation failed",
        validationErrors,
      });
    } else {
      next();
    }
  };
  createVnpayPayment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const validationErrors: { field: string; error: string }[] = [];
    const { price, packageId, purchaseType } = req.body;

    if (!purchaseType) {
      validationErrors.push({
        field: "purchaseType",
        error: "purchaseType is required",
      });
    }
    try {
      await validateMongooseObjectId(packageId);
    } catch {
      validationErrors.push({
        field: "packageId",
        error: `Invalid membership package Id`,
      });
    }

    if (
      isNaN(parseFloat(price)) ||
      parseFloat(price) < 10000 ||
      parseFloat(price) > 1000000000
    ) {
      res.status(400).json({
        message:
          "Số tiền giao dịch không hợp lệ. Số tiền hợp lệ từ 10,000 đến dưới 1 tỷ đồng",
      });
      return;
    }

    if (validationErrors.length > 0) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: "Validation failed",
        validationErrors,
      });
    } else {
      next();
    }
  };
}

export default PaymentHandler;
