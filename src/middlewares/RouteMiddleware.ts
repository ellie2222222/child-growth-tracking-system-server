import { match } from "path-to-regexp";
import publicRoutes from "../routes/PublicRoute";
import { Request, Response, NextFunction } from "express";

const RouteMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const path = req.originalUrl;
  const method = req.method;
  const pathname = path.split("?")[0];

  const matchedRoute = publicRoutes.find((route) => {
    const matchFn = match(route.path, { decode: decodeURIComponent });
    const matched = matchFn(pathname) || pathname.startsWith("/api-docs");
    return matched && route.method === method;
  });
  
  req.isProtectedRoute = !matchedRoute;

  next();
};

export default RouteMiddleware;
