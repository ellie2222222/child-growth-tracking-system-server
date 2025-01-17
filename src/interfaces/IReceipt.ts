import { Schema } from "mongoose";
import { IBaseEntity } from "../models/BaseModel";

export enum Currency {
  USD = "USD",
  VND = "VND",
}

export enum PaymentMethod {
  PAYPAL = "PAYPAL",
  VISA = "VISA",
  MASTERCARD = "MASTERCARD",
  CREDITCARD = "CREDITCARD",
}

export enum PaymentGateway {
  PAYPAL = "PAYPAL",
}

export enum TransactionType {
  PAYMENT = "PAYMENT",
  PAYOUT = "PAYOUT",
}

export interface IReceipt extends IBaseEntity {
  userId: Schema.Types.ObjectId | string;
  transactionId: string;
  totalAmount: {
    value: number;
    currency: Currency;
  };
  paymentMethod: PaymentMethod;
  paymentGateway: PaymentGateway;
  bankCode?: string;
  type: TransactionType;
  createdAt: Date;
  updatedAt: Date;
}
