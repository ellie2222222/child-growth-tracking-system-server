import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import UserRepository from "../repositories/UserRepository";
import bcrypt from "bcrypt";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import Database from "../utils/database";
import SessionService from "./SessionService";
import { ISession } from "../interfaces/ISession";
import { IUser } from "../interfaces/IUser";
import { Schema } from "mongoose";
import sendMail from "../utils/mailer";
import Mail from "nodemailer/lib/mailer";

dotenv.config();

class AuthService {
  private userRepository: UserRepository;
  private sessionService: SessionService;
  private database: Database;

  constructor() {
    this.userRepository = new UserRepository();
    this.sessionService = new SessionService();
    this.database = Database.getInstance();
  }

  /**
   * Generates an Access Token.
   *
   * @param attributes - The payload attributes to include in the token.
   * @returns The signed JWT as a string.
   */
  private generateAccessToken = (attributes: Object): string => {
    try {
      const accessTokenSecret: string = process.env.ACCESS_TOKEN_SECRET!;
      const accessTokenExpiration: string =
        process.env.ACCESS_TOKEN_EXPIRATION!;

      return jwt.sign(attributes, accessTokenSecret, {
        expiresIn: accessTokenExpiration,
      });
    } catch (error) {
      throw error;
    }
  };

  /**
   * Generates a Refresh Token.
   *
   * @param attributes - The payload attributes to include in the token.
   * @returns The signed JWT as a string.
   */
  private generateRefreshToken = (attributes: Object): string => {
    try {
      const refreshTokenSecret: string = process.env.REFRESH_TOKEN_SECRET!;
      const refreshTokenExpiration: string =
        process.env.REFRESH_TOKEN_EXPIRATION!;

      return jwt.sign(attributes, refreshTokenSecret, {
        expiresIn: refreshTokenExpiration,
      });
    } catch (error) {
      throw error;
    }
  };

  /**
   * Renew an Access Token.
   *
   * @param refreshToken - The refresh token string.
   * @returns A promise that resolves to the new JWT Access Token.
   */
  renewAccessToken = async (refreshToken: string): Promise<string> => {
    try {
      const refreshTokenSecret: string = process.env.REFRESH_TOKEN_SECRET!;

      // Verify the refresh token
      const payload = jwt.verify(refreshToken, refreshTokenSecret);

      if (typeof payload === "object" && payload.userId) {
        const user = await this.userRepository.getUserById(payload.userId);

        if (!user) {
          throw new CustomException(
            StatusCodeEnum.Unauthorized_401,
            "User not found"
          );
        }

        const timestamp = new Date().toISOString();
        const newPayload = {
          userId: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          timestamp,
        };
        return this.generateAccessToken(newPayload);
      }

      throw new CustomException(
        StatusCodeEnum.Unauthorized_401,
        "Invalid refresh token payload"
      );
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        throw new CustomException(
          StatusCodeEnum.Unauthorized_401,
          "Token expired"
        );
      } else if (error.name === "JsonWebTokenError") {
        throw new CustomException(
          StatusCodeEnum.Unauthorized_401,
          "Invalid refresh token"
        );
      }
      throw error;
    }
  };

  /**
   * Logs in a user and generates an access token.
   *
   * @param email - The user's email address.
   * @param password - The user's password.
   * @returns A promise that resolves to the JWT if credentials are valid, or throws an error.
   */
  login = async (
    email: string,
    password: string,
    sessionData: Partial<ISession>
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    sessionId: string;
  }> => {
    try {
      const user: IUser | null = await this.userRepository.getUserByEmail(email);

      // Validate credentials
      if (!user) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Incorrect email or password"
        );
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!user || !isPasswordValid) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Incorrect email or password"
        );
      }

      // Create session
      const sessionDataCreation: Partial<ISession> = {
        userId: user._id as Schema.Types.ObjectId,
        userAgent: sessionData.userAgent,
        ipAddress: sessionData.ipAddress,
        browser: sessionData.browser,
        device: sessionData.device,
        os: sessionData.os,
      };
      const sessionResult = await this.sessionService.createSession(
        sessionDataCreation
      );

      // Generate access token
      const timestamp = new Date().toISOString();
      const payload = {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        timestamp,
      };
      const accessToken = this.generateAccessToken(payload);
      const refreshToken = this.generateRefreshToken(payload);
      const sessionId = sessionResult._id?.toString() as string;

      return {
        accessToken,
        refreshToken,
        sessionId,
      };
    } catch (error) {
      throw error;
    }
  };

  /**
   * Signs up a user and generates an access token.
   *
   * @param name - The user's name.
   * @param email - The user's email address.
   * @param password - The user's password.
   * @returns A promise that resolves to the JWT if credentials are valid, or throws an error.
   */
  signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<void> => {
    const session = await this.database.startTransaction();
    try {
      const existingUser = await this.userRepository.getUserByEmail(email);

      if (existingUser) {
        throw new CustomException(
          StatusCodeEnum.Conflict_409,
          "Email already exists"
        );
      }

      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);

      await this.userRepository.createUser(
        {
          name,
          email,
          password: hashedPassword,
        },
        session
      );

      await this.database.commitTransaction();
    } catch (error) {
      await this.database.abortTransaction();
      throw error;
    }
  };

  /**
   * Generates and send a reset password PIN.
   *
   * @param userId - The user ID.
   * @returns A void promise.
   */
  sendResetPasswordPin = async (userId: string): Promise<void> => {
    const session = await this.database.startTransaction();
    try {
      const user = await this.userRepository.getUserById(userId);

      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      // Hash and store PIN
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPin = await bcrypt.hash(pin, salt);
      const updateData: Partial<IUser> = {
        resetPasswordPin: {
          isVerified: false,
          value: hashedPin,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        },
      };
      await this.userRepository.updateUserById(userId, updateData, session);

      const mailOptions: Mail.Options = { 
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `Reset Password PIN: ${pin}`,
        html: `<p>Reset Password PIN: ${pin}</p>`,
      };

      await sendMail(mailOptions);

      await this.database.commitTransaction();
    } catch (error) {
      await this.database.abortTransaction();
      throw error;
    }
  };

  /**
   * Confirms a PIN.
   *
   * @param userId - The user ID.
   * @param pin - The reset password PIN.
   * @returns A void promise.
   */
  confirmResetPasswordPin = async (
    userId: string,
    pin: string
  ): Promise<void> => {
    const session = await this.database.startTransaction();
    try {
      // Validate user ID
      const user = await this.userRepository.getUserById(userId);

      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      if (!user.resetPasswordPin || !user.resetPasswordPin.value) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Invalid reset password PIN"
        );
      }

      const isPinValid = await bcrypt.compare(pin, user.resetPasswordPin.value);
      if (!isPinValid) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Invalid reset password PIN"
        );
      }

      if (!user.resetPasswordPin.expiresAt || user.resetPasswordPin.expiresAt < new Date()) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Reset password PIN expired"
        );
      }

      // Change verify flag to true
      const updatePinData: Partial<IUser> = {
        resetPasswordPin: {
          ...user.resetPasswordPin,
          isVerified: true,
        },
      };
      await this.userRepository.updateUserById(userId, updatePinData, session);
      
      await this.database.commitTransaction();
    } catch (error) {
      await this.database.abortTransaction();
      throw error;
    }
  };

  /**
   * Reset a password.
   *
   * @param userId - The user ID.
   * @param oldPassword - The user's old password.
   * @param newPassword - The user's new password.
   * @returns A void promise.
   */
  resetPassword = async (
    userId: string,
    newPassword: string
  ): Promise<void> => {
    const session = await this.database.startTransaction();
    try {
      // Validate user ID
      const user = await this.userRepository.getUserById(userId);

      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      if (user.resetPasswordPin.isVerified !== true) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Reset password PIN is not verified"
        );
      }

      // Hash new password
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Clear password reset PIN and update password
      const updatePinData: Partial<IUser> = {
        password: hashedPassword,
        resetPasswordPin: {
          isVerified: false,
          value: null,
          expiresAt: null,
        },
      };
      await this.userRepository.updateUserById(userId, updatePinData, session);

      await this.database.commitTransaction();
    } catch (error) {
      await this.database.abortTransaction();
      throw error;
    }
  };

  /**
   * Change a password.
   *
   * @param userId - The user ID.
   * @param oldPassword - The user's old password.
   * @param newPassword - The user's new password.
   * @returns A void promise.
   */
  changePassword = async (
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> => {
    const session = await this.database.startTransaction();
    try {
      const user = await this.userRepository.getUserById(userId);

      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

      if (!isPasswordValid) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Incorrect password"
        );
      }

      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      const updateData: Partial<IUser> = {
        password: hashedPassword,
      };

      await this.userRepository.updateUserById(userId, updateData, session);

      await this.database.commitTransaction();
    } catch (error) {
      await this.database.abortTransaction();
      throw error;
    }
  };

  /**
   * Sends a verification email to the user.
   * @param email - The user's email address.
   * @returns A void promise.
   */
  verifyEmail = async (email: string): Promise<void> => {
    const session = await this.database.startTransaction();
    try {
      const user = await this.userRepository.getUserByEmail(email);
      
      if (!user) {
        throw new CustomException(StatusCodeEnum.NotFound_404, "Email not found");
      }

      const token = jwt.sign(
        { userId: user._id },
        process.env.EMAIL_TOKEN_SECRET!,
        {
          expiresIn: "1h",
        }
      );

      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Email Verification",
        html: `<p>Click the link below to verify your email:</p>
              <a href="${verificationUrl}">${verificationUrl}</a>`,
      };

      // Hash and store verification token 
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedToken = await bcrypt.hash(token, salt);
      const updateData: Partial<IUser> = {
        verificationToken: {
          value: hashedToken,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        },
      };
      await this.userRepository.updateUserById(user._id as string, updateData, session);

      await sendMail(mailOptions);
      
      await this.database.commitTransaction();
    } catch (error) {
      await this.database.abortTransaction();
      throw error;
    }
  };

  /**
   * Verify the user's email using the token.
   * @param token - The JWT token from the verification email.
   * @returns A void promise.
   */
  confirmEmailVerificationToken = async (token: string): Promise<void> => {
    const session = await this.database.startTransaction();
    try {
      const payload: any = jwt.verify(token, process.env.EMAIL_TOKEN_SECRET!);

      const user = await this.userRepository.getUserById(payload.userId); 

      if (!user) {
        throw new CustomException(StatusCodeEnum.NotFound_404, "User not found");
      }

      if (user.isVerified) {
        throw new CustomException(StatusCodeEnum.BadRequest_400, "Email already verified");
      }

      if (!user.verificationToken || !user.verificationToken.value) {
        throw new CustomException(StatusCodeEnum.BadRequest_400, "Invalid email verification token");
      }
      
      const isTokenValid = await bcrypt.compare(token, user.verificationToken.value);
      if (!isTokenValid) {
        throw new CustomException(StatusCodeEnum.Unauthorized_401, "Invalid email verification token");
      }

      if (!user.verificationToken.expiresAt || user.verificationToken.expiresAt < new Date()) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Email verification token expired"
        );
      }

      // Clear verification token after verification
      const updateData: Partial<IUser> = {
        isVerified: true,
        verificationToken: {
          value: null,
          expiresAt: null,
        },
      }
      await this.userRepository.updateUserById(user._id as string, updateData, session);

      await this.database.commitTransaction();
    } catch (error: any) {
      await this.database.abortTransaction();
      if (error.name === "TokenExpiredError") {
        throw new CustomException(StatusCodeEnum.Unauthorized_401, "Email verification token expired");
      }
      if (error.name === "JsonWebTokenError") {
        throw new CustomException(StatusCodeEnum.Unauthorized_401, "Invalid email verification token");
      }
      throw error;
    }
  };
}

export default AuthService;
