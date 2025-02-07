import mongoose from "mongoose";
import dotenv from "dotenv";
import getLoggers from "../utils/logger";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";

dotenv.config();

const logger = getLoggers("MONGOOSE");

if (!process.env.DATABASE_URI || !process.env.DATABASE_NAME) {
  logger.error(
    "Missing required environment variables: DATABASE_URI or DATABASE_NAME"
  );
}
const URI: string = process.env.DATABASE_URI!;
const DBName: string = process.env.DATABASE_NAME!;

class Database {
  private static instance: Database | null = null;

  private constructor() {
    this.connect().catch((error) => {
      logger.error(
        `Database connection error during constructor: ${error.message}`
      );
    });
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  // Connect to MongoDB
  private async connect(): Promise<void> {
    try {
      await mongoose.connect(URI, { dbName: DBName });
      logger.info(`Successfully connected to the database ${DBName}`);
    } catch (error) {
      logger.error(
        `Database connection error: ${
          (error as Error | CustomException).message
        }`
      );
      if (error as Error | CustomException) {
        throw error;
      }
    }
  }

  // Start a new database transaction
  public async startTransaction(): Promise<mongoose.ClientSession> {
    try {
      const session = await mongoose.startSession();
      session.startTransaction();
      return session;
    } catch (error) {
      logger.error(
        "Error starting transaction:",
        (error as Error | CustomException).message
      );
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        (error as Error | CustomException).message
      );
    }
  }

  // Commit the transaction (accept session as parameter)
  public async commitTransaction(
    session: mongoose.ClientSession
  ): Promise<void> {
    try {
      if (session) {
        await session.commitTransaction();
        logger.info("Commit change to database successfully!");
      }
    } catch (error) {
      logger.error(
        "Error committing transaction:",
        (error as Error | CustomException).message
      );
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        (error as Error | CustomException).message
      );
    } finally {
      await this.endSession(session); // Ensure session is ended after commit
    }
  }

  // Abort the transaction (accept session as parameter)
  public async abortTransaction(
    session: mongoose.ClientSession
  ): Promise<void> {
    try {
      if (session) {
        await session.abortTransaction();
        logger.info("Transaction aborted!");
      }
    } catch (error) {
      logger.error(
        "Error aborting transaction:",
        (error as Error | CustomException).message
      );
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        (error as Error | CustomException).message
      );
    } finally {
      await this.endSession(session); // Ensure session is ended after abort
    }
  }

  // End the session (accept session as parameter)
  private async endSession(session: mongoose.ClientSession): Promise<void> {
    try {
      if (session) {
        await session.endSession();
        logger.info("Session ended.");
      }
    } catch (error) {
      logger.error(
        `Error ending session: ${(error as Error | CustomException).message}`
      );
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        (error as Error | CustomException).message
      );
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      logger.info("Disconnected from the database.");
    } catch (error) {
      logger.error(
        `Error disconnecting from database: ${
          (error as Error | CustomException).message
        }`
      );
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        (error as Error | CustomException).message
      );
    }
  }

  public ensureObjectId(
    id: string | mongoose.Types.ObjectId
  ): mongoose.Types.ObjectId {
    if (typeof id === "string") {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Invalid ObjectId string: ${id}`
        );
      }
      return new mongoose.Types.ObjectId(id);
    }
    return id;
  }
}

export default Database;
