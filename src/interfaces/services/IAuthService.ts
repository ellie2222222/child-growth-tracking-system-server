import { ISession } from "../models/ISession";
import { IUser } from "../models/IUser";

export interface IAuthService {
  renewAccessToken: (
    accessToken: string,
    refreshToken: string
  ) => Promise<string>;

  login: (
    email: string,
    password: string,
    sessionData: Partial<ISession>
  ) => Promise<{
    accessToken: string;
    refreshToken: string;
    sessionId: string;
  }>;

  logout: (refreshToken: string) => Promise<void>;

  loginGoogle: (
    googleUser: any,
    sessionData: Partial<ISession>
  ) => Promise<{
    accessToken: string;
    refreshToken: string;
    sessionId: string;
  }>;

  signup: (name: string, email: string, password: string) => Promise<void>;

  getUserByToken: (accessToken: string) => Promise<IUser | null>;

  sendResetPasswordPin: (email: string) => Promise<void>;

  confirmResetPasswordPin: (email: string, pin: string) => Promise<void>;

  resetPassword: (userId: string, newPassword: string) => Promise<void>;

  changePassword: (
    email: string,
    oldPassword: string,
    newPassword: string
  ) => Promise<void>;

  confirmEmailVerificationToken: (token: string) => Promise<void>;
}
