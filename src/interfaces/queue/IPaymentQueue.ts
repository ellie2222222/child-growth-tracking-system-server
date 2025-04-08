import { IReceipt } from "../models/IReceipt";

export interface IPaymentQueue {
  sendPaymentData: (data: object) => Promise<void>;
  consumePaymentData: () => Promise<IReceipt>;
}
