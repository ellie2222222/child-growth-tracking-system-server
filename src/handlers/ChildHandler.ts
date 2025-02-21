import { NextFunction, Request, Response } from "express";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import validator from "validator";
import { validateMongooseObjectId } from "../utils/validator";
import GenderEnum from "../enums/GenderEnum";

class ChildHandler {
  private validRelationships = ["Parent", "Guardian", "Sibling", "Other"];

  /**
   * Validate input for creating a child.
   */
  createChild = (req: Request, res: Response, next: NextFunction): void => {
    const { name, gender, birthDate, note, relationship } = req.body;

    const validationErrors: { field: string; error: string }[] = [];

    // Validate name
    if (!name || !validator.isLength(name, { min: 1, max: 100 })) {
      validationErrors.push({
        field: "name",
        error: "Name is required and must be between 1-100 characters",
      });
    }

    // Validate gender (0 or 1 expected)
    if (gender !== GenderEnum.BOY && gender !== GenderEnum.GIRL) {
      validationErrors.push({
        field: "gender",
        error: "Gender must be 0 (Boy) or 1 (Girl)",
      });
    }

    // Validate birthDate
    if (!birthDate || !validator.isISO8601(birthDate)) {
      validationErrors.push({
        field: "birthDate",
        error: "Birth date must be a valid ISO 8601 date",
      });
    } else if (new Date(birthDate) > new Date()) {
      validationErrors.push({
        field: "birthDate",
        error: "Birth date must be a valid past or present date",
      });
    }

    // Validate note
    if (note && !validator.isLength(note, { max: 500 })) {
      validationErrors.push({
        field: "note",
        error: "Note must not exceed 500 characters",
      });
    }

    // Validate relationship
    if (!relationship || !this.validRelationships.includes(relationship)) {
      validationErrors.push({
        field: "relationship",
        error: `Relationship must be one of: ${this.validRelationships.join(
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

  /**
   * Validate input for updating a child.
   */
  updateChild = (req: Request, res: Response, next: NextFunction): void => {
    const { childId } = req.params;
    const { name, gender, birthDate, note } = req.body;

    const validationErrors: { field: string; error: string }[] = [];

    // Validate childId
    if (!validateMongooseObjectId(childId)) {
      validationErrors.push({
        field: "childId",
        error: "Invalid child ID",
      });
    }

    // Validate name
    if (name && !validator.isLength(name, { min: 1, max: 100 })) {
      validationErrors.push({
        field: "name",
        error: "Name must be between 1-100 characters",
      });
    }

    // Validate gender (0 or 1 expected)
    if (gender !== GenderEnum.BOY && gender !== GenderEnum.GIRL) {
      validationErrors.push({
        field: "gender",
        error: "Gender must be 0 (Boy) or 1 (Girl)",
      });
    }

    // Validate birthDate
    if (birthDate && !validator.isISO8601(birthDate)) {
      validationErrors.push({
        field: "birthDate",
        error: "Birth date must be a valid ISO 8601 date",
      });
    } else if (new Date(birthDate) > new Date()) {
      validationErrors.push({
        field: "birthDate",
        error: "Birth date must be a valid past or present date",
      });
    }

    // Validate note
    if (note && !validator.isLength(note, { max: 500 })) {
      validationErrors.push({
        field: "note",
        error: "Note must not exceed 500 characters",
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
   * Validate input for deleting a child.
   */
  deleteChild = (req: Request, res: Response, next: NextFunction): void => {
    const { childId } = req.params;

    const validationErrors: { field: string; error: string }[] = [];

    // Validate child ID
    if (!validateMongooseObjectId(childId)) {
      validationErrors.push({
        field: "childId",
        error: "Invalid child ID",
      });
    } else {
      next();
    }
  };

  /**
   * Validate input for getting a single child.
   */
  getChildById = (req: Request, res: Response, next: NextFunction): void => {
    const { childId } = req.params;

    const validationErrors: { field: string; error: string }[] = [];

    // Validate child ID
    if (!validateMongooseObjectId(childId)) {
      validationErrors.push({
        field: "childId",
        error: "Invalid child ID",
      });
    } else {
      next();
    }
  };

  /**
   * Validate input for getting all children.
   */
  getChildrenByUserId = (req: Request, res: Response, next: NextFunction): void => {
    const { page, size, order, sortBy } = req.query;

    const validationErrors: { field: string; error: string }[] = [];

    // Validate sortBy (enum: 'date', 'name')
    const validSortBy = ["date", "name"];
    if (sortBy && !validSortBy.includes(sortBy as string)) {
      validationErrors.push({
        field: "sortBy",
        error: `Sort by must be one of: ${validSortBy.join(", ")}`,
      });
    }

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
      req.query.sortBy = sortBy || "date";
      req.query.order = order || "descending";
      req.query.page = page ? parsedPage.toString() : "1";
      req.query.size = size ? parsedSize.toString() : "10";

      next();
    }
  };
}

export default ChildHandler;
