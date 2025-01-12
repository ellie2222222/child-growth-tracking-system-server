import { Request, Response, NextFunction } from "express";

/**
 * Security Headers Middleware
 */
const SecurityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  res.setHeader("X-Content-Type-Options", "nosniff"); // Prevents browsers from sniffing MIME types
  res.setHeader("X-XSS-Protection", "1; mode=block"); // Enables XSS protection
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains"); // HSTS for enforcing HTTPS
  res.setHeader("X-Frame-Options", "DENY"); // Prevents embedding in frames (clickjacking prevention)

  next();
};

export default SecurityHeaders;
