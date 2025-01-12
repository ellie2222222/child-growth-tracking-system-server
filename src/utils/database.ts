import mongoose, { ClientSession } from "mongoose";
import dotenv from "dotenv";
import getLoggers from "../utils/logger";

dotenv.config();

const logger = getLoggers("MONGOOSE");
const URI: string = process.env.DATABASE_URI || "mongodb+srv://tamlqhse182931:1q4QH9OtGaVzlAqk@app.3ujlt.mongodb.net/";
const DBName: string = process.env.DATABASE_NAME || "App";

class Database {
  private static instance: Database | null = null;
  private session: ClientSession | null = null;

  constructor() {
    this.session = null;
    this.connect().catch((error) => {
      logger.error(`Database connection error during constructor: ${error.message}`);
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
    } catch (error: any) {
      logger.error(`Database connection error: ${error.message}`);
      throw error;
    }
  }

  // Start a new database transaction
  public async startTransaction(): Promise<ClientSession> {
    try {
      this.session = await mongoose.startSession();
      this.session.startTransaction();
      return this.session;
    } catch (error: any) {
      logger.error("Error starting transaction:", error.message);
      throw new Error(error.message);
    }
  }

  // Commit the transaction
  public async commitTransaction(): Promise<void> {
    try {
      if (this.session) {
        await this.session.commitTransaction();
        logger.info("Commit change to database successfully!");
      }
    } catch (error: any) {
      logger.error("Error committing transaction:", error.message);
      throw new Error(error.message);
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
    } catch (error: any) {
      logger.error("Error aborting transaction:", error.message);
      throw new Error(error.message);
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
}

export default Database;