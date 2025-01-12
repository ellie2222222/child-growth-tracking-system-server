import express from "express";
import AuthController from "../controllers/AuthController";
import AuthHandler from "../handlers/AuthHandler";

const authController = new AuthController();
const authHandler = new AuthHandler();

const authRoutes = express.Router();

authRoutes.post("/login", authHandler.loginHandler, authController.login);

authRoutes.post("/signup", authHandler.signupHandler, authController.signup);

authRoutes.post("/renew-access-token", authController.renewAccessToken);

authRoutes.post("/verify-email", authHandler.verifyEmailHandler, authController.verifyEmail);

authRoutes.post("/confirm-email-verification-token", authController.confirmEmailVerificationToken);

authRoutes.post("/reset-password", authHandler.resetPasswordHandler, authController.resetPassword);

authRoutes.put("/change-password", authHandler.changePasswordHandler, authController.changePassword);

authRoutes.get("/reset-password-pin", authController.sendResetPasswordPin);

authRoutes.post("/confirm-reset-password-pin", authController.confirmResetPasswordPin);

authRoutes.get("/test", () => {});

export default authRoutes;
