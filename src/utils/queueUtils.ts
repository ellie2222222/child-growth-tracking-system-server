import amqp, { Channel, Connection } from "amqplib";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";

const RABBITMQ_URL =
  "amqps://tkbxfmbb:ozTJgfQPA299-hhETVjgLGIqQwI71-WR@armadillo.rmq.cloudamqp.com/tkbxfmbb";

const createConnection = async (): Promise<{
  connection: Connection;
  channel: Channel;
}> => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
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
