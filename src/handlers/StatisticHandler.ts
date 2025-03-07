import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";

class StatisticHandler {
  getRevenue = async (req: Request, res: Response, next: NextFunction) => {
    const validationErrors: { field: string; error: string }[] = [];

    const { time, unit, value } = req.query;

    if (!time) {
      validationErrors.push({ field: "time", error: "time is required" });
    }

    if (!["DAY", "WEEK", "MONTH", "YEAR"].includes(time as string)) {
      validationErrors.push({ field: "time", error: "Invalid time" });
    }

    if (!unit) {
      validationErrors.push({ field: "unit", error: "unit is required" });
    }

    if (!["VND", "USD"].includes(unit as string)) {
      validationErrors.push({ field: "unit", error: "Invalid unit" });
    }

    if (value) {
      if (isNaN(parseInt(value as string))) {
        validationErrors.push({ field: "value", error: "Invalid value" });
      }

      if (
        time === "YEAR" &&
        parseInt(value as string) > new Date().getFullYear()
      ) {
        validationErrors.push({ field: "value", error: "Invalid year" });
      }

      if (
        time === "MONTH" &&
        (parseInt(value as string) < 1 || parseInt(value as string) > 12)
      ) {
        validationErrors.push({ field: "value", error: "Invalid month" });
      }
    }
    if (validationErrors.length > 0) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: "Validation failed",
        validationErrors,
      });
    } else {
      next();
    }
  };
}

export default StatisticHandler;
