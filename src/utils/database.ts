import mongoose, { ClientSession } from "mongoose";
import dotenv from "dotenv";
import getLoggers from "../utils/logger";
import CustomException from "../exceptions/CustomException";

dotenv.config();

const logger = getLoggers("MONGOOSE");
const URI: string = process.env.DATABASE_URI!;
const DBName: string = process.env.DATABASE_NAME!;

class Database {
  private static instance: Database | null = null;
  private session: ClientSession | null = null;

  constructor() {
    this.session = null;
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
  public async startTransaction(): Promise<ClientSession> {
    try {
      this.session = await mongoose.startSession();
      this.session.startTransaction();
      return this.session;
    } catch (error) {
      logger.error(
        "Error starting transaction:",
        (error as Error | CustomException).message
      );
      throw new Error((error as Error | CustomException).message);
    }
  }

  // Commit the transaction
  public async commitTransaction(): Promise<void> {
    try {
      if (this.session) {
        await this.session.commitTransaction();
        logger.info("Commit change to database successfully!");
      }
    } catch (error) {
      logger.error(
        "Error committing transaction:",
        (error as Error | CustomException).message
      );
      throw new Error((error as Error | CustomException).message);
    } finally {
      await this.endSession(); // Ensure session is ended after commit
    }
  }

  // Abort the transaction
  public async abortTransaction(): Promise<void> {
    try {
      if (this.session) {
        await this.session.abortTransaction();
        logger.info("Transaction aborted!");
      }
    } catch (error) {
      logger.error(
        "Error aborting transaction:",
        (error as Error | CustomException).message
      );
      throw new Error((error as Error | CustomException).message);
    } finally {
      await this.endSession(); // Ensure session is ended after abort
    }
  }

  // End the session
  private async endSession(): Promise<void> {
    if (this.session) {
      await this.session.endSession();
      this.session = null; // Clear session reference
      logger.info("Session ended.");
    }
  }
  public ensureObjectId(
    id: string | mongoose.Types.ObjectId
  ): mongoose.Types.ObjectId {
    if (typeof id === "string") {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid ObjectId string: ${id}`);
      }
      return new mongoose.Types.ObjectId(id);
    }
    return id;
  }
}
export default Database;
