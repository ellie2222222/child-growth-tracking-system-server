import { NextFunction, Request, Response } from "express";
import ReceiptService from "../services/ReceiptService";
import StatusCodeEnum from "../enums/StatusCodeEnum";

class ReceiptController {
  private receiptService: ReceiptService;

  constructor() {
    this.receiptService = new ReceiptService();
  }
  getAllReceipts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const receipts = await this.receiptService.getAllReceipts();
      res.status(StatusCodeEnum.OK_200).json({
        receipts: receipts,
        message: "Get all receipts successfully",
      });
    } catch (error) {
      next(error);
    }
  };
  getReceiptsByUserId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requesterId = req.userInfo.userId;
      const { userId } = req.query;

      const receipts = await this.receiptService.getReceiptsByUserId(
        userId as string,
        requesterId
      );
      res.status(StatusCodeEnum.OK_200).json({
        receipts: receipts,
        message: "Get receipts by userId successfully",
      });
    } catch (error) {
      next(error);
    }
  };
  getReceiptById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const requesterId = req.userInfo.userId;
      const receipt = await this.receiptService.getReceiptById(id, requesterId);
      res.status(StatusCodeEnum.OK_200).json({
        receipts: receipt,
        message: "Get receipt successfully",
      });
    } catch (error) {
      next(error);
    }
  };
  deleteReceiptById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const requesterId = req.userInfo.userId;
      const receipt = await this.receiptService.deleteReceipt(id, requesterId);
      res.status(StatusCodeEnum.OK_200).json({
        receipt: receipt,
        message: "Delete receipt successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default ReceiptController;
