import { Request, Response, NextFunction } from "express";
import getLogger from "../utils/logger";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { UAParser } from "ua-parser-js";
import geoIp from "geoip-lite";
import CustomException from "../exceptions/CustomException";
import SessionRepository from "../repositories/SessionRepository";

const logger = getLogger("SESSION");

const SessionMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Attach information to req for further process
    const ipAddress =
      typeof req.headers["x-forwarded-for"] === "string"
        ? req.headers["x-forwarded-for"].split(",")[0]!
        : req.socket.remoteAddress!;
    const userAgent: string = req.headers["user-agent"]!;
    const location = geoIp.lookup(ipAddress);

    const countryData = location?.country || "Unknown";
    const regionData = location?.region || "Unknown";
    const timezoneData = location?.timezone || "Unknown";
    const cityData = location?.city || "Unknown";
    const llData = location?.ll || [];

    const parser = new UAParser();
    const parsedDevice = parser.setUA(userAgent).getResult();

    const userAgentData = parsedDevice.ua;
    const browserData = {
      name: parsedDevice.browser.name,
      version: parsedDevice.browser.version,
    };
    const osData = {
      name: parsedDevice.os.name,
      version: parsedDevice.os.version,
    };
    const deviceData = {
      type: parsedDevice.device.type,
      model: parsedDevice.device.model,
      vendor: parsedDevice.device.vendor,
    };

    req.userInfo = {
      ...req.userInfo,
      ipAddress,
      userAgent: userAgentData,
      browser: browserData,
      os: osData,
      device: deviceData,
      countryData: countryData,
      region: regionData,
      timezone: timezoneData,
      city: cityData,
      ll: llData,
    };

    // Verify request's session ID
    if (process.env.NODE_ENV === "PRODUCTION") {
      const sessionId = req.cookies["sessionId"];
      if (!sessionId) {
        res.status(StatusCodeEnum.Unauthorized_401).json({
          message: "Session ID is required",
        });
        return;
      }
      const sessionRepository = new SessionRepository();
      const isExist = await sessionRepository.findSessionById(sessionId);
      if (!isExist) {
        res.status(StatusCodeEnum.Unauthorized_401).json({
          message: "Invalid session ID",
        });
        return;
      }
    }

    next();
  } catch (error) {
    logger.error(
      `Error extracting user request info: ${
        (error as Error | CustomException).message
      }`
    );
    res
      .status(StatusCodeEnum.InternalServerError_500)
      .json({ message: "Internal Server Error" });
  }
};

export default SessionMiddleware;
