import dotenv from "dotenv";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { deleteFile } from "../middlewares/storeFile";
dotenv.config();

const formatPathSingle = (file: Express.Multer.File) => {
  try {
    const returnUrl = `${process.env.SERVER_URL}/${file.path}`;
    return returnUrl;
  } catch (error) {
    if (error as Error | CustomException) {
      throw error;
    }
    throw new CustomException(
      StatusCodeEnum.InternalServerError_500,
      "Internal Server Error"
    );
  }
};

const formatPathArray = (files: Express.Multer.File[]) => {
  try {
    let returnUrl;
    if (Array.isArray(files)) {
      const returnArray: Array<string> = [];
      files.forEach((file) => {
        returnArray.push(`${process.env.SERVER_URL}/${file.path}`);
      });
      returnUrl = returnArray;
    } else {
      throw new CustomException(
        StatusCodeEnum.BadRequest_400,
        "Invalid multer file type"
      );
    }
    return returnUrl;
  } catch (error) {
    if (error as Error | CustomException) {
      throw error;
    }
    throw new CustomException(
      StatusCodeEnum.InternalServerError_500,
      "Internal Server Error"
    );
  }
};
const cleanUpFileArray = async (files: Express.Multer.File[]) => {
  try {
    if (Array.isArray(files)) {
      files.forEach(async (file) => {
        await deleteFile(file.path);
      });
    } else {
      throw new CustomException(
        StatusCodeEnum.BadRequest_400,
        "Invalid multer file type"
      );
    }
    return true;
  } catch (error) {
    if (error as Error | CustomException) {
      throw error;
    }
    throw new CustomException(
      StatusCodeEnum.InternalServerError_500,
      "Internal Server Error"
    );
  }
};
const cleanUpOldAttachments = async (files: Array<string>) => {
  try {
    files.forEach(async (file) => {
      const filePath = file.split(`${process.env.SERVER_URL}/`).pop();
      await deleteFile(filePath as string);
    });
    return true;
  } catch (error) {
    if (error as Error | CustomException) {
      throw error;
    }
    throw new CustomException(
      StatusCodeEnum.InternalServerError_500,
      "Internal Server Error"
    );
  }
};
export {
  formatPathSingle,
  formatPathArray,
  cleanUpFileArray,
  cleanUpOldAttachments,
};
