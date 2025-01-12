import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

/**
 * Custom CSRF Middleware
 */
const CSRFMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const TOKEN_SECRET = "my_very_secure_secret_key"; // Use a strong, secure key

  // Utility function to create a unique CSRF token
  const createCsrfToken = (): string => {
    return crypto.randomBytes(32).toString("hex");
  };

  // Utility function to hash the CSRF token
  const hashToken = (token: string): string => {
    return crypto.createHmac("sha256", TOKEN_SECRET).update(token).digest("hex");
  };

  // 1. Check if the incoming request is a GET request
  if (req.method === "GET") {
    const csrfToken = createCsrfToken(); // Create a new CSRF token
    const csrfTokenHash = hashToken(csrfToken);

    // Store the hash in a secure, HttpOnly cookie (not accessible by JavaScript)
    res.cookie("csrf_token", csrfTokenHash, {
      httpOnly: true,
      sameSite: "strict", // Prevents cross-site cookie usage
      secure: process.env.NODE_ENV === "production", // Use Secure flag in production
    });

    // Expose the raw CSRF token in a non-HttpOnly cookie for frontend access
    res.cookie("csrf_token_client", csrfToken, {
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return next();
  }

  // 2. For POST, PUT, and DELETE requests, verify the CSRF token
  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    const csrfTokenClient = req.headers["x-csrf-token"] as string | undefined; // Token from the client request
    const csrfTokenServer = req.cookies ? req.cookies["csrf_token"] : null; // Hashed token from server-side cookie

    if (!csrfTokenClient || !csrfTokenServer) {
      res.status(403).json({ error: "Missing CSRF token" });
      return;
    }

    // 3. Validate the CSRF token
    const csrfTokenClientHash = hashToken(csrfTokenClient);
    if (csrfTokenClientHash !== csrfTokenServer) {
      res.status(403).json({ error: "Invalid CSRF token" });
      return;
    }

    return next();
  }

  next();
};

export default CSRFMiddleware;
