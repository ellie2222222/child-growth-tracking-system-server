import { ObjectId } from "mongoose";

export interface IPaymentService {
  createPaypalPayment: (
    price: number,
    packageId: string | ObjectId,
    userId: string
  ) => Promise<string>;

  createVnpayPayment: (
    price: number,
    userId: string,
    packageId: string,
    ipAddr: string,
    bankCode?: string
  ) => Promise<string>;
}
