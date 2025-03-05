import mongoose from "mongoose";
import { ISession } from "../ISession";

interface ISessionRepository {
  createSession(
    sessionData: Partial<ISession>,
    session?: mongoose.ClientSession
  ): Promise<ISession>;

  deleteSessionById(
    sessionId: string,
    session?: mongoose.ClientSession
  ): Promise<boolean>;

  deleteSessionsByUserId(
    userId: string,
    session?: mongoose.ClientSession
  ): Promise<number>;

  findSessionById(sessionId: string): Promise<ISession | null>;

  findSessionsByUserId(userId: string): Promise<ISession[]>;

  updateSession(
    sessionId: string,
    sessionData: Partial<ISession>,
    session?: mongoose.ClientSession
  ): Promise<boolean>;
}

export default ISessionRepository;