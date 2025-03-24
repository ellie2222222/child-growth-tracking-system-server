import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { GrowthMetricsEnum } from "../enums/GrowthMetricsEnum";
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

    if (!metric) {
      validationErrors.push({
        field: "metric",
        error: `Unsupported metric. Must be one of: ${this.validMetrics.join(", ")}`,
      });
    }

    if (validationErrors.length > 0) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: "Validation failed",
        validationErrors,
      });
      return;
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
          field: "gender",
          error: `Expected gender field and value`
        });
      }

      if (
        item.gender !== undefined &&
        (!Number.isInteger(item.gender) ||
          (item.gender !== 0 && item.gender !== 1))
      ) {
        validationErrors.push({
          field: "gender",
          error: `Invalid gender ${item.gender}. Expected either 0: Boy or 1: Girl`
        });
      }

      if (item.l === undefined || item.l === null) {
        validationErrors.push({
          field: "L",
          error: `Expected L field and value`
        });
      }

      if (item.m === undefined || item.m === null) {
        validationErrors.push({
          field: "M",
          error: `Expected M field and value`
        });
      }

      if (item.s === undefined || item.s === null) {
        validationErrors.push({
          field: "S",
          error: `Expected S field and value`
        });
      }

      if (!Number.isFinite(item.l)) {
        validationErrors.push({
          field: "L",
          error: `Invalid L value ${item.l}. Expected a valid floating-point number`
        });
      }

      if (!Number.isFinite(item.m)) {
        validationErrors.push({
          field: "M",
          error: `Invalid M value ${item.m}. Expected a valid floating-point number`
        });
      }

      if (!Number.isFinite(item.s)) {
        validationErrors.push({
          field: "S",
          error: `Invalid S value ${item.s}. Expected a valid floating-point number`
        });
      }

      const invalidEntry = Object.entries(item).find(([key, value]) => {
        if (key.toLowerCase().startsWith("p") && Number.isFinite(value)) {
          const numericKey = parseFloat(key.slice(1).replace(",", "."));
          return numericKey < 0.1 || numericKey > 99.9;
        }
        return key.toLowerCase().startsWith("p") && !Number.isFinite(value);
      });
      
      if (invalidEntry) {
        const [invalidKey, invalidValue] = invalidEntry;
      
        validationErrors.push({
          field: invalidKey.toUpperCase(),
          error: `Invalid P value ${invalidValue}. Expected a valid floating-point number between P0.1 and P99.9`,
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
              field: "age",
              error: `Row ${index + 1}: Either field ageInDays or ageInMonths value is required`
            });
          }

          if (item.ageindays !== undefined && (!Number.isInteger(item.ageindays) || item.ageindays < 0)) {
            validationErrors.push({
              field: "ageIndDays",
              error: `Invalid ageInDays ${item.ageindays}. Expected a positive whole number`
            });
          }

          if (item.ageinmonths !== undefined && (!Number.isInteger(item.ageinmonths) || item.ageinmonths < 0)) {
            validationErrors.push({
              field: "ageInMonths",
              error: `Invalid ageInMonths ${item.ageinmonths}. Expected a positive whole number`
            });
          }   

          break;

        case "WFLH":
          if (!item.height) {
            validationErrors.push({
              field: "height",
              error: `Expected height field and value`
            });
          }
          
          break;

        case "WV":
        case "HV":
          if (item.delta === undefined || item.delta === null) {
            validationErrors.push({
              field: "delta",
              error: `Expected delta field and value`
            });
          }
          if (!Number.isFinite(item.delta)) {
            validationErrors.push({
              field: "delta",
              error: `Invalid delta value ${item.delta}. Expected a valid floating-point number`
            });
          }
          break;

        case "HCV":
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
      return;
    } else {
      next();
    }
  };
}

export default GrowthMetricsHandler;
