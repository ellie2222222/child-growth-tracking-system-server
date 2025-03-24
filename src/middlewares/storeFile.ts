import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import getLogger from "../utils/logger";
import dotenv from "dotenv";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
const logger = getLogger("FILE_UPLOAD");
dotenv.config();

type DestinationCallback = (error: Error | null, destination: string) => void;

type FileNameCallback = (error: Error | null, filename: string) => void;

const checkFileSuccess = async (filePath: string) => {
  logger.info(`Checking file ${filePath} for success...`);
  return new Promise((resolve, reject) => {
    const dirPath = path.dirname(filePath);
    const baseName = path.parse(filePath).name;

    fs.readdir(dirPath, async (err, files) => {
      if (err) {
        logger.error(`Failed to read directory ${dirPath}: ${err.message}`);
        return reject(err);
      }
      for (const file of files) {
        const existingBaseName = path.parse(file).name;
        logger.info(`Existing Base Name: ${existingBaseName}`);
        if (existingBaseName !== baseName) {
          const existingFilePath = path.join(dirPath, file);
          try {
            await deleteFile(existingFilePath);
          } catch (unlinkErr) {
            return reject(unlinkErr);
          }
        }
      }
    });
    resolve(true);
  });
};

const deleteFile = async (filePath: string) => {
  return new Promise<void>((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        logger.error(`Failed to delete file ${filePath}: ${err.message}`);
        return reject(err); // Reject the promise with the error
      }
      logger.info(`Delete file ${filePath} successfully`);
      resolve(); // Resolve the promise on success
    });
  });
};

const deleteFolder = async (folderPath: string) => {
  return new Promise<void>((resolve, reject) => {
    fs.rm(folderPath, { recursive: true }, (err) => {
      if (err) {
        logger.error(`Failed to delete folder ${folderPath}: ${err.message}`);
        return reject(err);
      }
      logger.info(`Delete folder ${folderPath} successfully`);
      resolve();
    });
  });
};

const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: DestinationCallback
  ) => {
    let dir = "";
    let userId = req.userInfo.userId;
    // let postId;

    switch (file.fieldname) {
      case "avatar":
        userId = req.userInfo.userId;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          logger.error(`Invalid user ID: ${userId}`);
          return cb(
            new CustomException(
              StatusCodeEnum.BadRequest_400,
              "Invalid user ID"
            ),
            ""
          );
        }
        dir = path.join(`assets/images/${userId}/avatar/`);
        break;

      case "postAttachments":
        userId = req.userInfo.userId;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          logger.error(`Invalid user ID: ${userId}`);
          return cb(
            new CustomException(
              StatusCodeEnum.BadRequest_400,
              "Invalid user ID"
            ),
            ""
          );
        }
        dir = path.join(`assets/images/${userId}/post-attachments`);
        break;

      case "postThumbnail":
        userId = req.userInfo.userId;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          logger.error(`Invalid user ID: ${userId}`);
          return cb(
            new CustomException(
              StatusCodeEnum.BadRequest_400,
              "Invalid user ID"
            ),
            ""
          );
        }
        dir = path.join(`assets/images/${userId}/post-thumbnail`);
        break;
      case "excelFile":
        dir = path.join(`assets/growth-metrics`);
        break;

      case "messageAttachments":
        userId = req.userInfo.userId;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          logger.error(`Invalid user ID: ${userId}`);
          return cb(
            new CustomException(
              StatusCodeEnum.BadRequest_400,
              "Invalid user ID"
            ),
            ""
          );
        }
        dir = path.join(`assets/images/${userId}/message-attachments`);
        break;

      default:
        logger.error(`Unknown field name: ${file.fieldname}`);
        return cb(
          new CustomException(
            StatusCodeEnum.BadRequest_400,
            `Unknown field name '${file.fieldname}'`
          ),
          ""
        );
    }

    fs.mkdir(dir, { recursive: true }, (err) => {
      if (err) {
        logger.error(`Failed to create directory ${dir}: ${err.message}`);
        return cb(
          new CustomException(
            StatusCodeEnum.InternalServerError_500,
            `${err.message}`
          ),
          ""
        );
      }

      cb(null, dir);
    });
  },

  filename: async (
    req: Request,
    file: Express.Multer.File,
    cb: FileNameCallback
  ) => {
    const baseName = req.headers["content-length"] + "_" + Date.now(); // the file is named by the size of the file
    const ext = path.extname(file.originalname);

    let fileName = "";
    let dirPath = "";
    // let postId;
    let userId = req.userInfo.userId;

    switch (file.fieldname) {
      case "avatar":
        userId = req.userInfo.userId;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          logger.error(`Invalid user ID: ${userId}`);
          return cb(
            new CustomException(
              StatusCodeEnum.BadRequest_400,
              "Invalid user ID"
            ),
            ""
          );
        }
        fileName = `${baseName}${ext}`;
        dirPath = path.join(`assets/images/${userId}/avatar/`);
        break;

      case "postAttachments":
        userId = req.userInfo.userId;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          logger.error(`Invalid user ID: ${userId}`);
          return cb(
            new CustomException(
              StatusCodeEnum.BadRequest_400,
              "Invalid user ID"
            ),
            ""
          );
        }
        fileName = `${baseName}${ext}`;
        dirPath = path.join(`assets/images/${userId}/post-attachments`);
        break;

      case "postThumbnail":
        userId = req.userInfo.userId;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          logger.error(`Invalid user ID: ${userId}`);
          return cb(
            new CustomException(
              StatusCodeEnum.BadRequest_400,
              "Invalid user ID"
            ),
            ""
          );
        }
        fileName = `${baseName}${ext}`;
        dirPath = path.join(`assets/images/${userId}/post-thumbnail`);
        break;
      case "excelFile":
        fileName = `${baseName}${ext}`;
        dirPath = path.join(`assets/growth-metrics`);
        break;

      case "messageAttachments":
        userId = req.userInfo.userId;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          logger.error(`Invalid user ID: ${userId}`);
          return cb(
            new CustomException(
              StatusCodeEnum.BadRequest_400,
              "Invalid user ID"
            ),
            ""
          );
        }

        fileName = `${baseName}${ext}`;
        dirPath = path.join(`assets/images/${userId}/message-attachments`);

        break;
      default:
        logger.error(`Unknown field name: ${file.fieldname}`);
        return cb(
          new CustomException(
            StatusCodeEnum.BadRequest_400,
            `Unknown field name '${file.fieldname}'`
          ),
          ""
        );
    }
    logger.info(`Saving file ${fileName} successfully to ${dirPath}`);
    cb(null, fileName);
  },
});

const allowedFormats = {
  video: {
    regex: /\.(mp4|avi|flv|wmv)$/i,
    mime: ["video/mp4", "video/x-msvideo", "video/x-flv", "video/x-ms-wmv"],
    message: "Allowed formats: mp4, avi, flv, wmv",
  },
  img: {
    regex: /\.(jpeg|jpg|png|gif)$/i,
    mime: ["image/jpeg", "image/png", "image/gif"],
    message: "Allowed formats: jpeg, jpg, png, gif",
  },
  avatar: {
    regex: /\.(jpeg|jpg|png|gif)$/i,
    mime: ["image/jpeg", "image/png", "image/gif"],
    message: "Allowed formats: jpeg, jpg, png, gif",
  },
  excelFile: {
    regex: /\.(xls|xlsx)$/i,
    mime: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
    ],
    message: "Allowed format: xlsx or xls",
  },
  postAttachments: {
    regex: /\.(jpeg|jpg|png|gif)$/i,
    mime: ["image/jpeg", "image/png", "image/gif"],
    message: "Allowed formats: jpeg, jpg, png, gif",
  },
  postThumbnail: {
    regex: /\.(jpeg|jpg|png|gif)$/i,
    mime: ["image/jpeg", "image/png", "image/gif"],
    message: "Allowed formats: jpeg, jpg, png, gif",
  },
  messageAttachments: {
    regex: /\.(jpeg|jpg|png|gif)$/i,
    mime: ["image/jpeg", "image/png", "image/gif"],
    message: "Allowed formats: jpeg, jpg, png, gif",
  },
};

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const fileType = allowedFormats[file.fieldname as keyof typeof allowedFormats];

  if (!fileType) {
    return cb(new CustomException(StatusCodeEnum.BadRequest_400, "Invalid file field name."));
  }

  const isMimeTypeValid = fileType.mime.includes(file.mimetype);

  const expectedExtension = fileType.regex.test(`.${file.mimetype.split("/")[1]}`);

  if (isMimeTypeValid && expectedExtension) {
    return cb(null, true);
  } else {
    return cb(new CustomException(StatusCodeEnum.BadRequest_400, fileType.message));
  }
};

const uploadFile = multer({
  storage: storage,
  fileFilter: fileFilter,
});

export { uploadFile, deleteFile, deleteFolder, checkFileSuccess };
