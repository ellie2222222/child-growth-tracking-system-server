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
import SessionMiddleware from "./middlewares/SessionMiddleware";
import securityHeaders from "./middlewares/SecurityHeaders";
import helmet from "helmet";
import RouteMiddleware from "./middlewares/RouteMiddleware";
import passport from "./config/passportConfig";
import session from "express-session";
import userRoutes from "./routes/UserRoute";
import childRoutes from "./routes/ChildRoute";
import postRoute from "./routes/PostRoute";
import commentRoute from "./routes/CommentRoute";
import membershipPackageRoute from "./routes/MembershipPackageRoute";
import requestRouter from "./routes/RequestRoute";
import cronJob from "./utils/cron";
import growthMetricsRoute from "./routes/GrowthMetricsRoute";
import tierRoutes from "./routes/TierRoute";
import consultationRouter from "./routes/ConsultationRoute";
import consultationMessageRouter from "./routes/ConsultationMessageRoute";
import statisticRouter from "./routes/StatisticRoute";
import { swaggerDoc } from "./config/swaggerConfig";
import limiter from "./middlewares/rateLimiter";

process.env.TZ = "Asia/Ho_Chi_Minh";

const app: Application = express();

// Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
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
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(cookieParser());

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
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/children", childRoutes);
app.use("/api/posts", postRoute);
app.use("/api/comments", commentRoute);
app.use("/api/growth-metrics", growthMetricsRoute);
app.use("/api/receipts", receiptRoutes);
app.use("/api/tiers", tierRoutes);
app.use("/api/membership-packages", membershipPackageRoute);
app.use("/api/requests", requestRouter);
app.use("/api/consultations", consultationRouter);
app.use("/api/consultation-messages", consultationMessageRouter);
app.use("/api/statistics", statisticRouter);
// Google Login
app.get("/", (req, res) => {
  res.send("<a href='/api/auth/google'>Login with Google</a><br>");
});

// Middleware for error logging
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
    swaggerDoc(app);
  }
});
