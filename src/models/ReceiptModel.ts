import mongoose, { Model, Schema } from "mongoose";
import baseModelSchema from "./BaseModel";
import { IReceipt } from "../interfaces/IReceipt";

const ReceiptSchema = new Schema<IReceipt>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
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
        enums: ["USD", "VND"],
      },
    },
    paymentMethod: {
      type: String,
      required: true,
      enums: ["PAYPAL", "VISA", "MASTERCARD", "CREDITCARD"],
    },
    paymentGateway: {
      type: String,
      required: true,
      enums: ["PAYPAL"],
    },
    type: {
      type: String,
      required: true,
      enums: ["PAYMENT", "PAYOUT"],
    },
    ...baseModelSchema.obj,
  },
  { timestamps: true }
);

const ReceiptModel: Model<IReceipt> = mongoose.model<IReceipt>(
  "receipt",
  ReceiptSchema
);

export default ReceiptModel;
