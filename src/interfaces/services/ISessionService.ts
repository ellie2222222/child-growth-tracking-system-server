import { ISession } from "../ISession";

export interface ISessionService {
  createSession: (sessionData: Partial<ISession>) => Promise<ISession>;
  deleteSessionById: (sessionId: string) => Promise<boolean>;
  deleteSessionsByUserId: (userId: string) => Promise<number>;
  extendSessionExpiration: (
    sessionId: string,
    newExpiresAt: Date
  ) => Promise<boolean>;
}
