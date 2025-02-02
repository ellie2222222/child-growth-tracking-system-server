import amqp, { Channel, Connection } from "amqplib";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import dotenv from "dotenv";

dotenv.config();
const RABBITMQ_URL = process.env.RABBITMQ_URL;

const createConnection = async (): Promise<{
  connection: Connection;
  channel: Channel;
}> => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL as string);
    const channel = await connection.createChannel();
    return { connection, channel };
  } catch (error) {
    if (error as Error | CustomException) {
      throw error;
    }
    throw new CustomException(
      StatusCodeEnum.InternalServerError_500,
      "Internal server error"
    );
  }
};

const closeConnection = async (connection: Connection, channel: Channel) => {
  try {
    if (channel) {
      await channel.close();
    }
    if (connection) {
      await connection.close();
    }
  } catch (error) {
    if (error as Error | CustomException) {
      throw error;
    }
    throw new CustomException(
      StatusCodeEnum.InternalServerError_500,
      "Internal server error"
    );
  }
};
export { createConnection, closeConnection };
