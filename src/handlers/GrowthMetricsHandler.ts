import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import GrowthMetricsEnum from "../enums/GrowthMetricsEnum";
import path from "path";
import fs from "fs";
import * as xlsx from "xlsx";
import { deleteFile } from "../middlewares/storeFile";

class GrowthMetricsHandler {
  private validMetrics = Object.keys(GrowthMetricsEnum);
  /**
   * Validates input growth metrics upload route.
   */
  uploadGrowthMetricsFile = (req: Request, res: Response, next: NextFunction): void => {
    const { metric } = req.body;

    const validationErrors: { field: string; error: string }[] = [];

    if (!req.file) {
      validationErrors.push({
        field: "excelFile",
        error: `No file uploaded`,
      });
    }

    // Parse file
    const filePath = path.join(req.file!.path);
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = xlsx.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);
    const lowerCaseJsonData = jsonData.map((item: any) => {
      return Object.keys(item).reduce((acc, key) => {
        acc[key.toLowerCase()] = item[key];
        return acc;
      }, {} as { [key: string]: any });
    });

    // Validate file data
    lowerCaseJsonData.some((item, index) => {
      if (item.gender === undefined || item.gender === null) {
        validationErrors.push({
          field: "excelFile",
          error: `Expected gender field and value`
        });
      }

      if (
        item.gender !== undefined &&
        (!Number.isInteger(item.gender) ||
          (item.gender !== 0 && item.gender !== 1))
      ) {
        validationErrors.push({
          field: "excelFile",
          error: `Invalid gender ${item.gender}. Expected either 0: Boy or 1: Girl`
        });
      }

      if (!Number.isFinite(item.l)) {
        validationErrors.push({
          field: "excelFile",
          error: `Invalid L value ${item.l} at row ${
            index + 1
          }. Expected a valid floating-point number`
        });
      }

      if (!Number.isFinite(item.m)) {
        validationErrors.push({
          field: "excelFile",
          error: `Invalid M value ${item.m} at row ${
            index + 1
          }. Expected a valid floating-point number`
        });
      }

      if (!Number.isFinite(item.s)) {
        validationErrors.push({
          field: "excelFile",
          error: `Invalid S value ${item.s} at row ${
            index + 1
          }. Expected a valid floating-point number`
        });
      }

      switch (metric) {
        case "HCFA":
        case "ACFA":
        case "BFA":
        case "WFA":
        case "LHFA":
          if (
            item.ageindays === undefined &&
            item.ageinmonths === undefined
          ) {
            validationErrors.push({
              field: "excelFile",
              error: `Row ${index + 1}: Either field ageInDays or ageInMonths value is required`
            });
          }

          if (item.ageindays !== undefined && (!Number.isInteger(item.ageindays) || item.ageindays < 0)) {
            validationErrors.push({
              field: "excelFile",
              error: `Invalid ageInDays ${item.ageindays}. Expected a positive whole number`
            });
          }

          if (item.ageinmonths !== undefined && (!Number.isInteger(item.ageinmonths) || item.ageinmonths < 0)) {
            validationErrors.push({
              field: "excelFile",
              error: `Invalid ageInMonths ${item.ageinmonths}. Expected a positive whole number`
            });
          }   

          break;

        case "WFLH":
          if (!item.height) {
            validationErrors.push({
              field: "excelFile",
              error: `Expected height field and value`
            });
          }
          
          break;
      }

      return validationErrors.length > 0;
    });

    // Attach json data to request
    req.excelJsonData = lowerCaseJsonData;

    // Delete after finish
    deleteFile(req.file!.path);

    // Validate metric
    if (!this.validMetrics.includes(metric.toUpperCase())) {
      validationErrors.push({
        field: "metric",
        error: `Metric must be one of: ${this.validMetrics.join(
          ", "
        )}`,
      });
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

export default GrowthMetricsHandler;
