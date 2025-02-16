import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import validator from "validator";
import { validateMongooseObjectId } from "../utils/validator";

class GrowthDataHandler {
  /**
   * Validate input for creating a growthData.
   */
  createGrowthData = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const { inputDate, height, weight, headCircumference, armCircumference } =
      req.body;

    const validationErrors: { field: string; error: string }[] = [];

    // Validate required fields (height, weight)
    const requiredFields = { height, weight };
    for (const [field, value] of Object.entries(requiredFields)) {
      if (value === undefined || value === null || value === "") {
        validationErrors.push({ field, error: `${field} is required` });
      } else if (typeof value !== "number" || isNaN(value)) {
        validationErrors.push({
          field,
          error: `${field} must be a valid number`,
        });
      } else if (value <= 0) {
        validationErrors.push({
          field,
          error: `${field} must be greater than zero`,
        });
      }
    }

    // Validate optional fields if provided (headCircumference, armCircumference)
    const optionalFields = { headCircumference, armCircumference };
    for (const [field, value] of Object.entries(optionalFields)) {
      if (value !== undefined && value !== null && value !== "") {
        if (typeof value !== "number" || isNaN(value)) {
          validationErrors.push({
            field,
            error: `${field} must be a valid number`,
          });
        } else if (value <= 0) {
          validationErrors.push({
            field,
            error: `${field} must be greater than zero`,
          });
        }
      }
    }

    // Validate inputDate
    if (!inputDate || !validator.isISO8601(inputDate)) {
      validationErrors.push({
        field: "inputDate",
        error: "Input date must be a valid ISO 8601 date",
      });
    } else if (new Date(inputDate) > new Date()) {
      validationErrors.push({
        field: "inputDate",
        error: "Input date must be a valid past or present date",
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

  /**
   * Validate input for updating a growthData.
   */
  updateGrowthData = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const { growthDataId } = req.params;
    const { inputDate, height, weight, headCircumference, armCircumference } =
      req.body;

    const validationErrors: { field: string; error: string }[] = [];

    // Validate growthDataId
    if (!validateMongooseObjectId(growthDataId)) {
      validationErrors.push({
        field: "growthDataId",
        error: "Invalid growthData ID",
      });
    }

    // Validate optional fields if provided (headCircumference, armCircumference)
    const optionalFields = {
      height,
      weight,
      headCircumference,
      armCircumference,
    };
    for (const [field, value] of Object.entries(optionalFields)) {
      if (value !== undefined && value !== null && value !== "") {
        if (typeof value !== "number" || isNaN(value)) {
          validationErrors.push({
            field,
            error: `${field} must be a valid number`,
          });
        } else if (value <= 0) {
          validationErrors.push({
            field,
            error: `${field} must be greater than zero`,
          });
        }
      }
    }

    // Validate inputDate
    if (inputDate && !validator.isISO8601(inputDate)) {
      validationErrors.push({
        field: "inputDate",
        error: "Input date must be a valid ISO 8601 date",
      });
    } else if (inputDate && new Date(inputDate) > new Date()) {
      validationErrors.push({
        field: "inputDate",
        error: "Input date must be a valid past or present date",
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

  /**
   * Validate input for deleting a growthData.
   */
  deleteGrowthData = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const { growthDataId } = req.params;

    const validationErrors: { field: string; error: string }[] = [];

    // Validate growthDataId
    if (!validateMongooseObjectId(growthDataId)) {
      validationErrors.push({
        field: "growthDataId",
        error: "Invalid growthData ID",
      });
    } else {
      next();
    }
  };

  /**
   * Validate input for getting a single growthData.
   */
  getGrowthData = (req: Request, res: Response, next: NextFunction): void => {
    const { growthDataId } = req.params;

    const validationErrors: { field: string; error: string }[] = [];

    // Validate growthDataId
    if (!validateMongooseObjectId(growthDataId)) {
      validationErrors.push({
        field: "growthDataId",
        error: "Invalid growthData ID",
      });
    } else {
      next();
    }
  };

  /**
   * Validate input for getting all growthData.
   */
  getGrowthDataByChildId = (req: Request, res: Response, next: NextFunction): void => {
    const { page, size, order } = req.query;

    const validationErrors: { field: string; error: string }[] = [];

    // Validate order (enum: 'ascending', 'descending')
    const validOrder = ["ascending", "descending"];
    if (order && !validOrder.includes(order as string)) {
      validationErrors.push({
        field: "order",
        error: `Order must be one of: ${validOrder.join(", ")}`,
      });
    }

    // Validate page (minimum 1)
    const parsedPage = parseInt(page as string, 10);
    if (page && (!Number.isInteger(parsedPage) || parsedPage < 1)) {
      validationErrors.push({
        field: "page",
        error: "Page must be an integer greater than or equal to 1",
      });
    }

    // Validate size (minimum 1)
    const parsedSize = parseInt(size as string, 10);
    if (size && (!Number.isInteger(parsedSize) || parsedSize < 1)) {
      validationErrors.push({
        field: "size",
        error: "Size must be an integer greater than or equal to 1",
      });
    }

    if (validationErrors.length > 0) {
      res.status(StatusCodeEnum.BadRequest_400).json({
        message: "Validation failed",
        validationErrors,
      });
    } else {
      req.query.order = order || "descending";
      req.query.page = page ? parsedPage.toString() : "1";
      req.query.size = size ? parsedSize.toString() : "10";

      next();
    }
  };
}

export default GrowthDataHandler;
