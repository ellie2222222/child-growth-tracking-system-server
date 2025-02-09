import dotenv from "dotenv";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { deleteFile } from "../middlewares/storeFile";
import { JSDOM } from "jsdom";
import sanitizeHtml from "sanitize-html";
dotenv.config();

const formatPathSingle = (file: Express.Multer.File) => {
  try {
    const returnUrl = `${process.env.SERVER_URL}/${file.path.replace(
      /\\/g,
      "/"
    )}`;
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
        returnArray.push(
          `${process.env.SERVER_URL}/${file.path.replace(/\\/g, "/")}`
        );
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

//create
const cleanUpFile = async (
  file: Express.Multer.File | string,
  usage: "create" | "update"
) => {
  try {
    switch (usage) {
      case "create":
        await deleteFile((file as Express.Multer.File).path);
        break;
      case "update":
        await deleteFile(
          (file as string).split(`${process.env.SERVER_URL}/`).pop() as string
        );
        break;
      default:
        break;
    }
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

const cleanUpFileArray = async (
  files: Express.Multer.File[] | Array<string>,
  usage: "create" | "update"
) => {
  try {
    if (Array.isArray(files) && files.length > 0) {
      switch (usage) {
        case "create":
          (files as Express.Multer.File[]).forEach(async (file) => {
            await deleteFile(file.path);
          });
          break;
        case "update":
          (files as Array<string>).forEach(async (file) => {
            const filePath = file.split(`${process.env.SERVER_URL}/`).pop();
            await deleteFile(filePath as string);
          });
          break;
        default:
          throw new CustomException(
            StatusCodeEnum.InternalServerError_500,
            "Unknown clean up field"
          );
      }
    } else {
      throw new CustomException(
        StatusCodeEnum.BadRequest_400,
        "Invalid files array"
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

const extractAndReplaceImages = (
  content: string,
  attachments: string[]
): string => {
  if (!content || !attachments.length) return content;

  // First, sanitize the HTML to remove any potential XSS scripts
  const cleanContent = sanitizeHtml(content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
    allowedAttributes: {
      img: ["src", "alt", "width", "height"],
    },
  });

  // Parse the sanitized HTML using JSDOM
  const dom = new JSDOM(cleanContent);
  const document = dom.window.document;
  const images = document.querySelectorAll("img");

  // Replace image sources with uploaded URLs
  images.forEach((img, index) => {
    if (attachments[index]) {
      img.src = attachments[index]; // Replace Base64 with actual URL
    }
  });

  return document.body.innerHTML;
};

export {
  formatPathSingle,
  formatPathArray,
  cleanUpFileArray,
  extractAndReplaceImages,
  cleanUpFile,
};
