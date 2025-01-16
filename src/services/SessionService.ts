import dotenv from "dotenv";
import Database from "../utils/database";
import SessionRepository from "../repositories/SessionRepository";
import { ISession } from "../interfaces/ISession";

dotenv.config();

class SessionService {
  private sessionRepository: SessionRepository;
  private database: Database;

  constructor() {
    this.sessionRepository = new SessionRepository();
    this.database = Database.getInstance();
  }

  /**
   * Creates a new session for a user.
   * @param sessionData - The session details.
   * @returns The created session document.
   */
  async createSession(sessionData: Partial<ISession>): Promise<ISession> {
    const session = await this.database.startTransaction();

    try {
      const newSession = await this.sessionRepository.createSession(
        sessionData,
        session
      );

      await session.commitTransaction();
      return newSession;
    } catch (error: any) {
      await session.abortTransaction();
      throw error;
    }
  }

  /**
   * Deletes a session by its ID.
   * @param sessionId - The ID of the session to delete.
   * @returns True if the session was deleted, false otherwise.
   */
  async deleteSessionById(sessionId: string): Promise<boolean> {
    const session = await this.database.startTransaction();

    try {
      const isDeleted = await this.sessionRepository.deleteSessionById(
        sessionId,
        session
      );

      await session.commitTransaction();
      return isDeleted;
    } catch (error: any) {
      await session.abortTransaction();
      throw error;
    }
  }

  /**
   * Deletes all sessions for a specific user.
   * @param userId - The user ID whose sessions should be deleted.
   * @returns The count of sessions deleted.
   */
  async deleteSessionsByUserId(userId: string): Promise<number> {
    const session = await this.database.startTransaction();

    try {
      const deletedCount = await this.sessionRepository.deleteSessionsByUserId(
        userId,
        session
      );

      await session.commitTransaction();
      return deletedCount;
    } catch (error: any) {
      await session.abortTransaction();
      throw error;
    }
  }

  /**
   * Extends a session's expiration time by updating the `expiresAt` field.
   * @param sessionId - The ID of the session to extend.
   * @param newExpiresAt - The new expiration date.
   * @returns The updated session document.
   */
  async extendSessionExpiration(
    sessionId: string,
    newExpiresAt: Date
  ): Promise<boolean> {
    const session = await this.database.startTransaction();

    try {
      const result = await this.sessionRepository.updateSession(
        sessionId,
        { expiresAt: newExpiresAt },
        session
      );

      await this.database.commitTransaction();

      return result;
    } catch (error: any) {
      await this.database.abortTransaction();
      throw error;
    }
  }
}

export default SessionService;
