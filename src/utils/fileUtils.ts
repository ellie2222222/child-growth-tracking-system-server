import dotenv from "dotenv";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import { deleteFile } from "../middlewares/storeFile";
import { JSDOM } from "jsdom";
import sanitizeHtml from "sanitize-html";
import fs from "fs/promises";
dotenv.config();

const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

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
    let filePath;
    switch (usage) {
      case "create":
        filePath = (file as Express.Multer.File).path;
        if (await fileExists(filePath)) {
          await deleteFile(filePath);
        }
        break;
      case "update":
        filePath = (file as string)
          .split(`${process.env.SERVER_URL}/`)
          .pop() as string;
        if (await fileExists(filePath)) {
          await deleteFile(filePath);
        }
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
          await Promise.all(
            (files as Express.Multer.File[]).map(async (file) => {
              if (await fileExists(file.path)) {
                await deleteFile(file.path);
              }
            })
          );
          break;
        case "update":
          await Promise.all(
            (files as Array<string>).map(async (file) => {
              const filePath = file
                .split(`${process.env.SERVER_URL}/`)
                .pop() as string;
              if (await fileExists(filePath)) {
                await deleteFile(filePath);
              }
            })
          );
          break;
        default:
          throw new CustomException(
            StatusCodeEnum.InternalServerError_500,
            "Unknown clean up field"
          );
      }
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

      const wrapper = document.createElement("div");
      wrapper.style.display = "flex";
      wrapper.style.justifyContent = "center"; // Horizontally center
      wrapper.style.alignItems = "center"; // Align if needed
      wrapper.style.width = "100%";

      img.style.width = "100%";
      img.style.height = "auto";
      img.style.maxWidth = "600px";

      wrapper.appendChild(img.cloneNode(true));
      img.replaceWith(wrapper); // Replace the original img with the wrapped version
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
