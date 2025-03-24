import dotenv from "dotenv";
import Database from "../utils/database";
// import SessionRepository from "../repositories/SessionRepository";
import { ISession } from "../interfaces/ISession";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { ISessionService } from "../interfaces/services/ISessionService";
import ISessionRepository from "../interfaces/repositories/ISessionRepository";

dotenv.config();

class SessionService implements ISessionService {
  private sessionRepository: ISessionRepository;
  private database: Database;

  constructor(sessionRepository: ISessionRepository) {
    this.sessionRepository = sessionRepository;
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

      await this.database.commitTransaction(session);
      return newSession;
    } catch (error) {
      await this.database.abortTransaction(session);
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
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

      await this.database.commitTransaction(session);
      return isDeleted;
    } catch (error) {
      await this.database.abortTransaction(session);
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
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

      await this.database.commitTransaction(session);
      return deletedCount;
    } catch (error) {
      await this.database.abortTransaction(session);
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
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

      await this.database.commitTransaction(session);

      return result;
    } catch (error) {
      await this.database.abortTransaction(session);
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }
}

export default SessionService;
