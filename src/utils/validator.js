const validator = require("validator");
const CoreException = require("../exceptions/CoreException");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
const mongoose = require("mongoose");
const banWords = require("../enums/BanWords");

const validMongooseObjectId =  (id) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new CoreException(StatusCodeEnums.BadRequest_400, "Invalid ID");
};
const validFullName = async (fullName) => {
  if (!fullName)
    throw new CoreException(
      StatusCodeEnums.BadRequest_400,
      "Full name is required"
    );
  if (!validator.isLength(fullName, { min: 6, max: 50 }))
    throw new CoreException(
      StatusCodeEnums.BadRequest_400,
      "Full name is invalid, must be a minimum of 6 characters and a maximum of 50 characters."
    );
  const regex = /^[a-zA-Z0-9]+$/;
  if (!regex.test(fullName)) {
    throw new CoreException(
      StatusCodeEnums.BadRequest_400,
      "Full name is invalid, full name just contains alphanumeric"
    );
  }
};

const validNickName = async (nickName) => {
  if (!validator.isLength(nickName, { min: 6, max: 50 }))
    throw new CoreException(
      StatusCodeEnums.BadRequest_400,
      "Nick name is invalid, must be a minimum of 6 characters and a maximum of 50 characters."
    );
  const regex = /^[a-zA-Z0-9_.-]+$/;
  if (!regex.test(nickName)) {
    throw new CoreException(
      StatusCodeEnums.BadRequest_400,
      "Nick name is invalid, nick name just contains alphanumeric, /./, /-/ and /_/"
    );
  }
};

const validEmail = async (email) => {
  if (!email)
    throw new CoreException(
      StatusCodeEnums.BadRequest_400,
      "Email is required"
    );
  if (!validator.isEmail(email))
    throw new CoreException(StatusCodeEnums.BadRequest_400, "Email is invalid");
};

const validPassword = async (password) => {
  if (!password) throw new Error("Password is required");
  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  )
    throw new CoreException(
      StatusCodeEnums.BadRequest_400,
      "Password is invalid. It must be at least 8 characters, 1 lowercase, 1 uppercase, 1 number, and 1 symbol"
    );
};

const validPhoneNumber = async (phoneNumber) => {
  if (!phoneNumber)
    throw new CoreException(
      StatusCodeEnums.BadRequest_400,
      "Phone number is required"
    );
  if (!validator.isMobilePhone(phoneNumber, "vi-VN"))
    throw new CoreException(
      StatusCodeEnums.BadRequest_400,
      "Phone number is invalid"
    );
};

const contentModeration = (content, type) => {
  try {
    const words = content.trim().replace(/\s+/g, " ").toLowerCase();
    const eachWord = words.split(" ");
    for (const word of eachWord) {
      if (banWords.includes(word)) {
        throw new Error(`This ${type} violates community guidelines`);
      }
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

const hasSpecialCharacters = (content) => {
  const regex = /^[a-zA-Z0-9\s]+$/;
  if (regex.test(content)) {
    return false;
  }
  return true;
};

const capitalizeWords = (str) => {
  const newString = str.trim().replace(/\s+/g, " ").toLowerCase();

  return newString
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const validLength = async (min, max, string, type) => {
  // Trim the string to remove leading and trailing whitespace
  const trimmedString = string.trim();

  // Check if the trimmed string is within the length limits
  if (!validator.isLength(trimmedString, { min, max })) {
    throw new CoreException(
      StatusCodeEnums.BadRequest_400,
      `${type} is invalid, must be a minimum of ${min} characters and a maximum of ${max} characters.`
    );
  }

  // Additional check for blank (empty or whitespace-only) strings
  if (trimmedString.length === 0) {
    throw new CoreException(
      StatusCodeEnums.BadRequest_400,
      `${type} cannot be blank.`
    );
  }
};

const convertToMongoObjectId = (id) => {
  return new mongoose.Types.ObjectId(id);
};

const checkExistById = async (model, id) => {
  return await model.findOne({ _id: convertToMongoObjectId(id) });
};

module.exports = {
  validNickName,
  validMongooseObjectId,
  validFullName,
  validEmail,
  validPassword,
  validPhoneNumber,
  contentModeration,
  hasSpecialCharacters,
  capitalizeWords,
  validLength,
  checkExistById,
  convertToMongoObjectId,
};
