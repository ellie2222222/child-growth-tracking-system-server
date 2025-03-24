import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
import { IReceipt } from "../interfaces/IReceipt";
import { IPaymentQueue } from "../interfaces/queue/IPaymentQueue";
import { IReceiptService } from "../interfaces/services/IReceiptService";
import { IUserService } from "../interfaces/services/IUserService";
import Database from "../utils/database";
// import ReceiptService from "../services/ReceiptService";
// import UserService from "../services/UserService";
import { closeConnection, createConnection } from "../utils/queueUtils";

const PAYMENT_QUEUE_NAME = "Payment_queue";
class PaymentQueue implements IPaymentQueue {
  private receiptService: IReceiptService;
  private userService: IUserService;

  constructor(receiptService: IReceiptService, userService: IUserService) {
    this.receiptService = receiptService;
    this.userService = userService;
  }

  sendPaymentData = async (data: object): Promise<void> => {
    const { connection, channel } = await createConnection();

    try {
      await channel.assertQueue(PAYMENT_QUEUE_NAME, { durable: true });
      channel.sendToQueue(
        PAYMENT_QUEUE_NAME,
        Buffer.from(JSON.stringify(data))
      );
    } catch (error) {
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    } finally {
      await closeConnection(connection, channel);
    }
  };

  consumePaymentData = async (): Promise<IReceipt> => {
    const { connection, channel } = await createConnection();
    let receipt = {};
    const database = Database.getInstance();
    try {
      await channel.assertQueue(PAYMENT_QUEUE_NAME, { durable: true });

      await new Promise<void>((resolve, reject) => {
        channel.consume(
          PAYMENT_QUEUE_NAME,
          async (msg) => {
            if (msg) {
              const session = await database.startTransaction();
              try {
                const data = JSON.parse(msg.content.toString());

                receipt = await this.receiptService.createReceipt(
                  data.userId,
                  data.transactionId,
                  data.membershipPackageId,
                  data.totalAmount,
                  data.paymentMethod,
                  data.paymentGateway,
                  data.type
                );

                // console.log("IN QUEUE");
                await this.userService.updateSubscription(
                  data.userId,
                  data.membershipPackageId
                );

                await database.commitTransaction(session);
                channel.ack(msg);
                resolve();
              } catch (processingError) {
                await database.abortTransaction(session);
                console.error("Error processing message:", processingError);
                // Optionally, you can move the message to a DLQ here
                channel.nack(msg, false, false); // Do not re-queue the message
                reject(processingError);
              }
            } else {
              console.log("No message returned");
              resolve();
            }
          },
          { noAck: false }
        );
      });
    } catch (error) {
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    } finally {
      await closeConnection(connection, channel);
    }
    return receipt as IReceipt;
  };
}

export default PaymentQueue;
