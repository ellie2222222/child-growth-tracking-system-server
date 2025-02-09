import mongoose, { Schema, Model } from "mongoose";
import {
  IReceipt,
  Currency,
  PaymentMethod,
  PaymentGateway,
  TransactionType,
} from "../interfaces/IReceipt";

const ReceiptSchema = new Schema<IReceipt>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    totalAmount: {
      value: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        require: true,
        enum: Object.values(Currency),
      },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: Object.values(PaymentMethod),
    },
    paymentGateway: {
      type: String,
      required: true,
      enum: Object.values(PaymentGateway),
    },
    bankCode: {
      type: String,
    },
    product: {
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        default: "",
      },
      id: {
        type: Schema.Types.ObjectId,
        ref: "MembershipPackage",
      },
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(TransactionType),
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
    strict: true
  }
);

const ReceiptModel: Model<IReceipt> = mongoose.model<IReceipt>(
  "Receipt",
  ReceiptSchema
);

export default ReceiptModel;
