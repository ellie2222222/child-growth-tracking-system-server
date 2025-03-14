import express from "express";

import AuthMiddleware from "../middlewares/AuthMiddleware";
import passport from "../config/passportConfig";

import AuthHandler from "../handlers/AuthHandler";
import AuthController from "../controllers/AuthController";
import AuthService from "../services/AuthService";
import SessionService from "../services/SessionService";
import UserRepository from "../repositories/UserRepository";
import SessionRepository from "../repositories/SessionRepository";

const userRepository = new UserRepository();
const sessionRepository = new SessionRepository();
const sessionService = new SessionService(sessionRepository);
const authService = new AuthService(userRepository, sessionService);
const authController = new AuthController(authService);
const authHandler = new AuthHandler();

const authRoutes = express.Router();

authRoutes.use(AuthMiddleware);

authRoutes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

authRoutes.get(
  "/google/redirect",
  passport.authenticate("google"),
  authController.loginGoogle
);

authRoutes.get(
  "/google/mobile/redirect",
  passport.authenticate("google"),
  authController.loginGoogleMobile
);

authRoutes.post("/login", authHandler.login, authController.login);

authRoutes.post("/signup", authHandler.signup, authController.signup);

authRoutes.post("/logout", authController.logout);

authRoutes.get("/me", authController.getUserByToken);

authRoutes.post("/renew-access-token", authController.renewAccessToken);

authRoutes.post(
  "/confirm-email-verification-token",
  authController.confirmEmailVerificationToken
);

authRoutes.put(
  "/reset-password",
  authHandler.resetPassword,
  authController.resetPassword
);

authRoutes.put(
  "/change-password",
  authHandler.changePassword,
  authController.changePassword
);

authRoutes.post(
  "/send-reset-password-pin",
  authHandler.sendResetPasswordPin,
  authController.sendResetPasswordPin
);

authRoutes.post(
  "/confirm-reset-password-pin",
  authController.confirmResetPasswordPin
);

export default authRoutes;
