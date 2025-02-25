import { Request, Response, NextFunction } from "express";
import AuthService from "../services/AuthService";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import ms from "ms";
import { ISession } from "../interfaces/ISession";
import UserService from "../services/UserService";
class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Handles user login.
   */
  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password } = req.body;
      const sessionData: Partial<ISession> = req.userInfo;

      const { accessToken, refreshToken, sessionId } =
        await this.authService.login(email, password, sessionData);

      // Set Refresh Token and session ID in cookies
      const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION!;
      const refreshTokenMaxAge = ms(REFRESH_TOKEN_EXPIRATION);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "PRODUCTION",
        sameSite: "strict",
        maxAge: refreshTokenMaxAge,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "PRODUCTION",
        sameSite: "strict",
        maxAge: refreshTokenMaxAge,
      });

      // Set session ID in cookies
      res.cookie("sessionId", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "PRODUCTION",
        sameSite: "strict",
        maxAge: refreshTokenMaxAge, // 30 days
      });

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success",
        accessToken
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refreshToken;

      await this.authService.logout(refreshToken);
      
      res.clearCookie("sessionId", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "PRODUCTION",
        sameSite: "strict",
      });

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "PRODUCTION",
        sameSite: "strict",
      });

      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "PRODUCTION",
        sameSite: "strict",
      });

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success"
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle Google login 
   */
  loginGoogle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const googleUser = req.user;
      const sessionData: Partial<ISession> = req.userInfo;

      const { accessToken, refreshToken, sessionId } = await this.authService.loginGoogle(googleUser, sessionData);

      // Set Refresh Token and session ID in cookies
      const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION!;
      const refreshTokenMaxAge = ms(REFRESH_TOKEN_EXPIRATION);
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "PRODUCTION",
        sameSite: "strict",
        maxAge: refreshTokenMaxAge,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "PRODUCTION",
        sameSite: "strict",
        maxAge: refreshTokenMaxAge,
      });

      // Set session ID in cookies
      res.cookie("sessionId", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "PRODUCTION",
        sameSite: "strict",
        maxAge: refreshTokenMaxAge, // 30 days
      });

      res.redirect(`${process.env.FRONTEND_URL}`)
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles user signup.
   */
  signup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { name, email, password } = req.body;

      await this.authService.signup(name, email, password);

      res.status(StatusCodeEnum.Created_201).json({
        message: "Success",
      });
    } catch (error) {
      next(error);
    }
  };

  getUserByToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const accessToken = req.cookies?.accessToken;

      const user = await this.authService.getUserByToken(accessToken);

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success",
        user
      })
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles refreshing of an access token.
   */
  renewAccessToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const accessToken = req.cookies?.accessToken;
      const refreshToken = req.cookies?.refreshToken;

      const newAccessToken = await this.authService.renewAccessToken(
        accessToken,
        refreshToken
      );

      const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION!;
      const refreshTokenMaxAge = ms(REFRESH_TOKEN_EXPIRATION);
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "PRODUCTION",
        sameSite: "strict",
        maxAge: refreshTokenMaxAge,
      });

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
  sendResetPasswordPin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId } = req.userInfo;

      await this.authService.sendResetPasswordPin(userId);

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles confirming reset password PIN
   */
  confirmResetPasswordPin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { pin } = req.body;
      const { userId } = req.userInfo;

      await this.authService.confirmResetPasswordPin(userId, pin);

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles resetting password
   */
  resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { newPassword } = req.body;
      const { userId } = req.userInfo;

      await this.authService.resetPassword(userId, newPassword);

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles changing password
   */
  changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { oldPassword, newPassword } = req.body;
      const { userId } = req.userInfo;

      await this.authService.changePassword(userId, oldPassword, newPassword);

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles verifying token
   */
  confirmEmailVerificationToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { token } = req.body;

      await this.authService.confirmEmailVerificationToken(token);

      res.status(StatusCodeEnum.OK_200).json({
        message: "Success",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
