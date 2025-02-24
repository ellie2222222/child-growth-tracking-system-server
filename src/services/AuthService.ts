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
import { IVerificationTokenPayload } from "../interfaces/IJwtPayload";
import path from "path";
import ejs from "ejs";

dotenv.config();

const emailTemplatePath = path.resolve(__dirname, "../templates/EmailVerification.ejs");
const resetPasswordTemplatePath = path.resolve(__dirname, "../templates/ResetPassword.ejs");

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
  private generateAccessToken = (attributes: object): string => {
    try {
      const accessTokenSecret: string = process.env.ACCESS_TOKEN_SECRET!;
      const accessTokenExpiration: string =
        process.env.ACCESS_TOKEN_EXPIRATION!;

      return jwt.sign(attributes, accessTokenSecret, {
        expiresIn: accessTokenExpiration,
      });
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  /**
   * Generates a Refresh Token.
   *
   * @param attributes - The payload attributes to include in the token.
   * @returns The signed JWT as a string.
   */
  private generateRefreshToken = (attributes: object): string => {
    try {
      const refreshTokenSecret: string = process.env.REFRESH_TOKEN_SECRET!;
      const refreshTokenExpiration: string =
        process.env.REFRESH_TOKEN_EXPIRATION!;

      return jwt.sign(attributes, refreshTokenSecret, {
        expiresIn: refreshTokenExpiration,
      });
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
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
        const user = await this.userRepository.getUserById(
          payload.userId,
          false
        );

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
    } catch (error) {
      if (error as Error) {
        if ((error as Error).name === "TokenExpiredError") {
          throw new CustomException(
            StatusCodeEnum.Unauthorized_401,
            "Token expired"
          );
        } else if ((error as Error).name === "JsonWebTokenError") {
          throw new CustomException(
            StatusCodeEnum.Unauthorized_401,
            "Invalid refresh token"
          );
        }
      } else if (error as CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
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
      const user: IUser | null = await this.userRepository.getUserByEmail(
        email
      );

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
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  logout = async (userId: string): Promise<void> => {
    const session = await this.database.startTransaction();
    try {
      const user = await this.userRepository.getUserById(userId, false);
      if (!user) {
        throw new CustomException(StatusCodeEnum.NotFound_404, "User not found");
      }

      await this.sessionService.deleteSessionsByUserId(userId);

      await this.database.commitTransaction(session);
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

  loginGoogle = async (
    googleUser: any,
    sessionData: Partial<ISession>
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    sessionId: string;
  }> => {
    try {
      const { email, name, picture, sub } = googleUser._json as {
        email: string;
        name: string;
        picture: string;
        sub: string;
      };

      // Check if user already exists
      let user: IUser | null = await this.userRepository.getGoogleUser(
        email,
        sub
      );

      // If the user doesn't exist, create a new user
      if (!user) {
        user = await this.userRepository.createUser({
          email,
          name,
          avatar: picture,
          googleId: sub,
        });
      }

      // Create session data
      const sessionDataCreation: Partial<ISession> = {
        userId: user._id as Schema.Types.ObjectId,
        userAgent: sessionData.userAgent,
        ipAddress: sessionData.ipAddress,
        browser: sessionData.browser,
        device: sessionData.device,
        os: sessionData.os,
      };

      // Create the session
      const sessionResult = await this.sessionService.createSession(
        sessionDataCreation
      );

      // Generate tokens
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
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
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
    try {
      const existingUser = await this.userRepository.getUserByEmail(email);

      if (existingUser) {
        throw new CustomException(
          StatusCodeEnum.Conflict_409,
          "Email already exists"
        );
      }

      this.sendVerificationEmail(email, password, name);

      return;
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
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
      const user = await this.userRepository.getUserById(userId, false);

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

      const resetPasswordHtml = await ejs.renderFile(resetPasswordTemplatePath, { 
        name: user.name,
        pin: pin,
      });

      const mailOptions: Mail.Options = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `Reset Password PIN: ${pin}`,
        html: resetPasswordHtml,
      };

      await sendMail(mailOptions);

      await this.database.commitTransaction(session);
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
      const user = await this.userRepository.getUserById(userId, false);

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

      if (
        !user.resetPasswordPin.expiresAt ||
        user.resetPasswordPin.expiresAt < new Date()
      ) {
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

      await this.database.commitTransaction(session);
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
      const user = await this.userRepository.getUserById(userId, false);

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

      await this.sessionService.deleteSessionsByUserId(userId);

      await this.database.commitTransaction(session);
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
      const user = await this.userRepository.getUserById(userId, false);

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

      await this.sessionService.deleteSessionsByUserId(userId);

      await this.database.commitTransaction(session);
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
  };

  /**
   * Sends a verification email to the user.
   * @param email - The user's email address.
   * @param password - The user's password.
   * @param name - The user's name.
   * @returns A void promise.
   */
  private sendVerificationEmail = async (email: string, password: string, name: string): Promise<void> => {
    try {
      // Generate token
      const token = jwt.sign(
        { email, password, name },
        process.env.EMAIL_TOKEN_SECRET as string,
        { expiresIn: process.env.EMAIL_TOKEN_EXPIRATION }
      );

      const emailHtml = await ejs.renderFile(emailTemplatePath, { 
        name: name,
        verificationLink: `${process.env.FRONTEND_URL}/verify-email?verificationToken=${token}`
      });

      const mailOptions: Mail.Options = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Email Verification`,
        html: emailHtml,
      };

      await sendMail(mailOptions);

      return;
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
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
      const payload = jwt.verify(token, process.env.EMAIL_TOKEN_SECRET!) as IVerificationTokenPayload;
      const { name, email, password } = payload;

      // Check if user already exists
      const existingUser = await this.userRepository.getUserByEmail(email);
      if (existingUser) {
        throw new CustomException(
          StatusCodeEnum.Conflict_409,
          "Email is already verified"
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

      await this.database.commitTransaction(session);
    } catch (error) {
      await this.database.abortTransaction(session);

      if (error as Error) {
        if ((error as Error).name === "TokenExpiredError") {
          throw new CustomException(
            StatusCodeEnum.Unauthorized_401,
            "Email verification token expired"
          );
        }
        if ((error as Error).name === "JsonWebTokenError") {
          throw new CustomException(
            StatusCodeEnum.Unauthorized_401,
            "Invalid email verification token"
          );
        }
      } else if (error as CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };
}

export default AuthService;
