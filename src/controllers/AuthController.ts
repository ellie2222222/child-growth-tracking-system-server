import { Request, Response, NextFunction } from "express";
import AuthService from "../services/AuthService";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import ms from "ms";
import { ISession } from "../interfaces/ISession";

class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Handles user login.
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const sessionData: Partial<ISession> = req.userInfo;

      const { accessToken, refreshToken, sessionId } = await this.authService.login(email, password, sessionData);

      // Set Refresh Token in cookies
      const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION!;
      const refreshTokenMaxAge = ms(REFRESH_TOKEN_EXPIRATION);
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: refreshTokenMaxAge,
      });
      
      // Set session ID in cookies
      res.cookie("sessionId", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.status(StatusCodeEnum.OK_200).json({
        message: "Login successful",
        data: { 
          accessToken
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handle Google login 
   */
  loginGoogle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const googleUser = req.user;
      console.log(googleUser)

      // const user = await loginGoogle(googleUser);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles user signup.
   */
  signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password } = req.body;

      await this.authService.signup(name, email, password);

      res.status(StatusCodeEnum.Created_201).json({
        message: "Signup successful"
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles refreshing of an access token.
   */
  renewAccessToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      const newAccessToken = await this.authService.renewAccessToken(refreshToken);

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success",
        data: { 
          accessToken: newAccessToken
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles resetting password
   */
  sendResetPasswordPin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.userInfo;

      await this.authService.sendResetPasswordPin(userId);

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success"
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles confirming reset password PIN
   */
  confirmResetPasswordPin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { pin } = req.body;
      const { userId } = req.userInfo;

      await this.authService.confirmResetPasswordPin(userId, pin);

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success"
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles resetting password
   */
  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { newPassword } = req.body;
      const { userId } = req.userInfo;

      await this.authService.resetPassword(userId, newPassword);

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success"
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles changing password
   */
  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { oldPassword, newPassword } = req.body;
      const { userId } = req.userInfo;

      await this.authService.changePassword(userId, oldPassword, newPassword);

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success"
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles verifying token
   */
  confirmEmailVerificationToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.body;

      await this.authService.confirmEmailVerificationToken(token);

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success"
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles sending verification email
   */
  verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;

      await this.authService.verifyEmail(email);

      res.status(200).json({ message: "Success" });
    } catch (error: any) {
      next(error);
    }
  };
}

export default AuthController;
