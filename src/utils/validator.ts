import validator from "validator";
import mongoose, { Document } from "mongoose";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";

// Validates if the ID is a valid Mongoose ObjectId
const validateMongooseObjectId = (id: string): boolean => {
  try {
    return mongoose.Types.ObjectId.isValid(id);
  } catch (error) {
    if (error instanceof Error || error instanceof CustomException) {
      throw error;
    }
    throw new CustomException(
      StatusCodeEnum.InternalServerError_500,
      "Internal Server Error"
    );
  }
};

// Validates the name length and character requirements
const validateName = (name: string): void => {
  if (!name) {
    throw new CustomException(
      StatusCodeEnum.BadRequest_400,
      "Name is required"
    );
  }
  if (!validator.isLength(name, { min: 2, max: 50 })) {
    throw new CustomException(
      StatusCodeEnum.BadRequest_400,
      "Name is invalid. It must be between 2 and 50 characters."
    );
  }
};

// Validates if the email is correct
const validateEmail = (email: string): void => {
  if (!email) {
    throw new CustomException(
      StatusCodeEnum.BadRequest_400,
      "Email is required"
    );
  }
  if (!validator.isEmail(email)) {
    throw new CustomException(
      StatusCodeEnum.BadRequest_400,
      "Email is invalid"
    );
  }
};

// Validates the password strength
const validatePassword = (password: string): void => {
  if (!password) {
    throw new CustomException(
      StatusCodeEnum.BadRequest_400,
      "Password is required"
    );
  }
  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    throw new CustomException(
      StatusCodeEnum.BadRequest_400,
      "Password is invalid. It must be at least 8 characters, with 1 lowercase, 1 uppercase, 1 number, and 1 symbol."
    );
  }
};

// Validates the phone number
const validatePhoneNumber = (phoneNumber: string): void => {
  if (!phoneNumber) {
    throw new CustomException(
      StatusCodeEnum.BadRequest_400,
      "Phone number is required"
    );
  }
  if (!validator.isMobilePhone(phoneNumber, "vi-VN")) {
    throw new CustomException(
      StatusCodeEnum.BadRequest_400,
      "Phone number is invalid"
    );
  }
};

// Checks if the content has special characters
const hasSpecialCharacters = (content: string): boolean => {
  const regex = /^[a-zA-Z0-9\s]+$/;
  return !regex.test(content);
};

// Capitalizes the first letter of each word in a string
const capitalizeWords = (str: string): string => {
  const newString = str.trim().replace(/\s+/g, " ").toLowerCase();

  return newString
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Validates the length of a string within specified min and max limits
const validateLength = (
  min: number,
  max: number,
  string: string,
  type: string
): void => {
  const trimmedString = string.trim();

  if (!validator.isLength(trimmedString, { min, max })) {
    throw new CustomException(
      StatusCodeEnum.BadRequest_400,
      `${type} is invalid. It must be between ${min} and ${max} characters.`
    );
  }

  if (trimmedString.length === 0) {
    throw new CustomException(
      StatusCodeEnum.BadRequest_400,
      `${type} cannot be blank.`
    );
  }
};

// Converts an ID to a Mongoose ObjectId
const convertToMongoObjectId = (id: string): mongoose.Types.ObjectId => {
  return new mongoose.Types.ObjectId(id);
};

// Checks if an entry exists by ID in the specified model
const checkExistById = async (
  model: mongoose.Model<Document>,
  id: string
): Promise<Document | null> => {
  return await model.findOne({ _id: convertToMongoObjectId(id) });
};

export {
  validateMongooseObjectId,
  validateName,
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  hasSpecialCharacters,
  capitalizeWords,
  validateLength,
  checkExistById,
  convertToMongoObjectId,
};
