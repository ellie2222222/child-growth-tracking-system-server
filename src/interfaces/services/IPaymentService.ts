import { ObjectId } from "mongoose";

export interface IPaymentService {
  createPaypalPayment: (
    price: number,
    packageId: string | ObjectId,
    userId: string,
    purchaseType?: string
  ) => Promise<string>;

  createVnpayPayment: (
    price: number,
    userId: string,
    packageId: string,
    ipAddr: string,
    bankCode?: string,
    purchaseType?: string
  ) => Promise<string>;
}
