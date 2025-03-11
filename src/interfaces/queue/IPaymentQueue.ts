import { IReceipt } from "../IReceipt";

export interface IPaymentQueue {
  sendPaymentData: (data: object) => Promise<void>;
  consumePaymentData: () => Promise<IReceipt>;
}
