import express from "express";
import AuthController from "../controllers/AuthController";
import AuthHandler from "../handlers/AuthHandler";
import passport from "../config/passportConfig";

const authController = new AuthController();
const authHandler = new AuthHandler();

const authRoutes = express.Router();

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

authRoutes.get("/logout", () => {} );

authRoutes.post("/renew-access-token", authController.renewAccessToken);

authRoutes.post(
  "/verify-email",
  authHandler.verifyEmail,
  authController.verifyEmail
);

authRoutes.post(
  "/confirm-email-verification-pin",
  authController.confirmEmailVerificationPin
);

authRoutes.post(
  "/reset-password",
  authHandler.resetPassword,
  authController.resetPassword
);

authRoutes.put(
  "/change-password",
  authHandler.changePassword,
  authController.changePassword
);

authRoutes.get("/reset-password-pin", authController.sendResetPasswordPin);

authRoutes.post(
  "/confirm-reset-password-pin",
  authController.confirmResetPasswordPin
);

authRoutes.get("/test", () => {});

export default authRoutes;
