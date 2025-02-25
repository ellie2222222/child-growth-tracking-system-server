import express from "express";
import AuthController from "../controllers/AuthController";
import AuthHandler from "../handlers/AuthHandler";
import passport from "../config/passportConfig";
import AuthMiddleware from "../middlewares/AuthMiddleware";

const authController = new AuthController();
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

authRoutes.post("/login", authHandler.login, authController.login);

authRoutes.post("/signup", authHandler.signup, authController.signup);

authRoutes.post("/logout", authController.logout);

authRoutes.post("/me", authController.getUserByToken);

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

authRoutes.post("/send-reset-password-pin", authController.sendResetPasswordPin);

authRoutes.post(
  "/confirm-reset-password-pin",
  authController.confirmResetPasswordPin
);

export default authRoutes;
