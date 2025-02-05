import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response, NextFunction, Application } from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import getLogger from "./utils/logger";
import authRoutes from "./routes/AuthRoute";
import paymentRoutes from "./routes/PaymentRoute";
import receiptRoutes from "./routes/ReceiptRoute";
import ErrorLogMiddleware from "./middlewares/ErrorLogMiddleware";
import AuthMiddleware from "./middlewares/AuthMiddleware";
import SessionMiddleware from "./middlewares/SessionMiddleware";
// import CSRFMiddleware from "./middlewares/CSRFMiddleware";
import securityHeaders from "./middlewares/SecurityHeaders";
import helmet from "helmet";
import RouteMiddleware from "./middlewares/RouteMiddleware";
import passport from "./config/passportConfig";
import session from "express-session";
import userRoutes from "./routes/UserRoute";
import limiter from "./middlewares/rateLimiter";
import childRoutes from "./routes/ChildRoute";
import postRoute from "./routes/PostRoute";
import commentRoute from "./routes/CommentRoute";
import membershipPackageRoute from "./routes/MembershipPackageRoute";
import cronJob from "./utils/cron";
process.env.TZ = "Asia/Ho_Chi_Minh";

const app: Application = express();

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Files
app.use("/", express.static(__dirname));

// Session and passport
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Enable trust proxy
app.set("trust proxy", 1);

// Rate limiter middleware
app.use(limiter(15, 100000));

// Apply security headers middleware globally
app.use(securityHeaders);

// Helmet
app.use(helmet());

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
    const logMessage = `${req.ip} ${req.method} ${
      req.originalUrl
    } ${req.protocol.toUpperCase()}/${req.httpVersion} ${res.statusCode} ${
      res.get("Content-Length") || 0
    } ${req.get("User-Agent")} ${duration}ms`;
    logger.info(logMessage);
  });

  next();
});

// Serve assets correctly
app.use("/assets", express.static("assets"));

// Routers
app.use(RouteMiddleware);
app.use(SessionMiddleware);
app.use(AuthMiddleware);
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/children", childRoutes);
app.use("/api/posts", postRoute);
app.use("/api/comments", commentRoute);
app.get("/", (req, res) => {
  res.send("<a href='/api/auth/google'>Login with Google</a><br>");
});
app.use("/api/receipt", receiptRoutes);
app.use("/api/membership-packages", membershipPackageRoute);
app.use(ErrorLogMiddleware);
cronJob.start();
// Start server
const port: number = Number(process.env.DEVELOPMENT_PORT) || 4000;

const server: http.Server = http.createServer(app);

server.listen(port, async (err?: Error) => {
  const logger = getLogger("APP");
  if (err) {
    logger.error("Failed to start server:", err);
    process.exit(1);
  } else {
    logger.info(`Server is running at port ${port}`);
  }
});
