import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response, NextFunction, Application } from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server as SocketIO } from "socket.io";
import getLogger from "./utils/logger";
import limiter from "./middlewares/rateLimiter";
import socket from "./socket/socket";
import authRoutes from "./routes/AuthRoute";
import ErrorLogMiddleware from "./middlewares/ErrorLogMiddleware";
import AuthMiddleware from "./middlewares/AuthMiddleware";
import SessionMiddleware from "./middlewares/SessionMiddleware";
import CSRFMiddleware from "./middlewares/CSRFMiddleware";
import securityHeaders from "./middlewares/SecurityHeaders";

process.env.TZ = "Asia/Ho_Chi_Minh";

// Type declarations
const app: Application = express();
const server: http.Server = http.createServer(app);

// Socket setup
const chatIo: SocketIO = new SocketIO(server, {
  path: "/socket/chat",
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
socket(chatIo);

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/", express.static(__dirname));

// Rate limiter middleware
app.use(limiter(15, 100000));

// Apply security headers middleware globally
app.use(securityHeaders);

// CSRF middleware to ensure CSRF protection
// app.use(CSRFMiddleware);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Log API requests
app.use((req: Request, res: Response, next: NextFunction) => {
  const logger = getLogger("API");

  const startTime = new Date();

  res.on("finish", () => {
    const duration = new Date().getTime() - startTime.getTime();
    const logMessage = `${req.ip} ${req.method} ${req.originalUrl} ${req.protocol.toUpperCase()}/${req.httpVersion} ${res.statusCode} ${
      res.get("Content-Length") || 0
    } ${req.get("User-Agent")} ${duration}ms`;
    logger.info(logMessage);
  });

  next();
});

// Routers
app.use(SessionMiddleware);
app.use(AuthMiddleware);
app.use("/api/auth", authRoutes);

app.use(ErrorLogMiddleware);

// Start server
const port: number = Number(process.env.DEVELOPMENT_PORT) || 4000;

server.listen(port, async (err?: Error) => {
  const logger = getLogger("APP");
  if (err) {
    logger.error("Failed to start server:", err);
    process.exit(1);
  } else {
    logger.info(`Server is running at port ${port}`);
  }
});
