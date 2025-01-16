import { Request, Response, NextFunction } from "express";

/**
 * Security Headers Middleware
 */
const SecurityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  res.setHeader("X-XSS-Protection", "1; mode=block"); // Enables XSS protection

  next();
};

export default SecurityHeaders;
