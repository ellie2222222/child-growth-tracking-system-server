import { Document, Schema } from "mongoose";

export interface IReceipt extends Document {
  userId: Schema.Types.ObjectId | string;
  transactionId: string;
  totalAmount: {
    value: number;
    currency: string;
  };
  paymentMethod: string;
  paymentGateway: string;
  bankCode: string;
  type: string; //payment or payout
  createdAt: Date;
}
