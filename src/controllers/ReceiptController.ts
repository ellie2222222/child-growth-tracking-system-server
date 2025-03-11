import { NextFunction, Request, Response } from "express";
// import ReceiptService from "../services/ReceiptService";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { IReceiptService } from "../interfaces/services/IReceiptService";

class ReceiptController {
  private receiptService: IReceiptService;

  constructor(receiptService: IReceiptService) {
    this.receiptService = receiptService;
  }

  getAllReceipts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { page, size, search, order, sortBy } = req.query;
      const requesterId = req.userInfo.userId;
      const receipts = await this.receiptService.getAllReceipts(
        {
          page: parseInt(page as string) || 1,
          size: parseInt(size as string) || 10,
          search: search as string,
          order: (order as "ascending" | "descending") || "ascending",
          sortBy: (sortBy as "date") || "date",
        },
        requesterId
      );
      res.status(StatusCodeEnum.OK_200).json({
        ...receipts,
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
      const { userId } = req.params;
      const { page, size, search, order, sortBy } = req.query;

      const receipts = await this.receiptService.getReceiptsByUserId(
        {
          page: parseInt(page as string) || 1,
          size: parseInt(size as string) || 10,
          search: search as string,
          order: (order as "ascending" | "descending") || "ascending",
          sortBy: (sortBy as "date") || "date",
        },
        userId as string,
        requesterId
      );
      res.status(StatusCodeEnum.OK_200).json({
        ...receipts,
        Message: "Get all receipts successfully",
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
