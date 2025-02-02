import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
import ReceiptService from "../services/ReceiptService";
import UserService from "../services/UserService";
import { closeConnection, createConnection } from "../utils/queueUtils";

const PAYMENT_QUEUE_NAME = "Payment_queue";
class PaymentQueue {
  private receiptService: ReceiptService;
  private userService: UserService;

  constructor() {
    this.receiptService = new ReceiptService();
    this.userService = new UserService();
  }
  sendPaymentData = async (data: object) => {
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

  consumePaymentData = async () => {
    const { connection, channel } = await createConnection();
    let receipt = {};
    try {
      await channel.assertQueue(PAYMENT_QUEUE_NAME, { durable: true });

      await new Promise<void>((resolve, reject) => {
        channel.consume(
          PAYMENT_QUEUE_NAME,
          async (msg) => {
            if (msg) {
              try {
                const data = JSON.parse(msg.content.toString());

                receipt = await this.receiptService.createReceipt(
                  data.userId,
                  data.transactionId,
                  data.membershipPackageId,
                  data.totalAmount,
                  data.paymentGateway,
                  data.paymentMethod,
                  data.type
                );

                await this.userService.updatesubscription(
                  data.userId,
                  data.membershipPackageId
                );

                channel.ack(msg);
                resolve();
              } catch (processingError) {
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
    return receipt;
  };
}

export default PaymentQueue;
