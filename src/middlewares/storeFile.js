const { default: mongoose } = require("mongoose");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");
const getLogger = require("../utils/logger");
const logger = getLogger("FILE_UPLOAD");
const { spawn } = require("child_process");
const CoreException = require("../exceptions/CoreException");
const StatusCodeEnums = require("../enums/StatusCodeEnum");
require("dotenv").config();
const removeFileName = async (filePath) => {
  // Get the directory name by removing the file name
  return path.dirname(filePath);
};

const removeExtension = async (filePath) => {
  return path.join(path.dirname(filePath), path.parse(filePath).name);
};
const extractFilenameFromPath = async (filePath) => {
  try {
    // Use path.basename to get the filename from the given path
    const filename = path.basename(filePath);
    return filename;
  } catch (err) {
    console.error(`Error extracting filename from path: ${err.message}`);
    return null; // or handle error as needed
  }
};
const extractFilenameFromUrl = async (inputUrl) => {
  try {
    // Parse the URL
    const parsedUrl = new URL(inputUrl);

    // Get the pathname from the parsed URL
    const pathname = parsedUrl.pathname;

    // Use path.basename to extract the filename
    const filename = path.basename(pathname);

    return filename;
  } catch (err) {
    console.error(`Error extracting filename from URL: ${err.message}`);
    return null; // or handle error as needed
  }
};

const convertMp4ToHls = async (filePath) => {
  return new Promise((resolve, reject) => {
    const dirPath = path.dirname(filePath);
    const baseName = path.parse(filePath).name;
    const outputDir = dirPath; // Directory to save the output
    const m3u8File = path.join(outputDir, `output_${baseName}.m3u8`); // M3U8 playlist file
    const segmentPath = path.join(outputDir, `${baseName}_%03d.ts`); // TS segment path
    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    // Spawn FFmpeg process
    const ffmpeg = spawn(
      "ffmpeg",
      [
        "-i",
        filePath, // Input file
        "-c:v",
        "copy", // Copy video codec
        "-c:a",
        "copy", // Copy audio codec
        "-f",
        "hls", // Output format
        "-hls_time",
        "10", // Duration of each segment
        "-hls_list_size",
        "0", // All segments in playlist
        "-hls_flags",
        "split_by_time", // Split segments by time
        "-hls_segment_filename",
        segmentPath, // Segment filename pattern
        "-reset_timestamps",
        "1", // Reset timestamps for each segment
        m3u8File, // Output M3U8 file
      ],
      { detached: true, stdio: "ignore" }
    );

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        logger.info(`File converted to HLS: ${m3u8File}`);
        resolve(m3u8File);
      } else {
        logger.error(`FFmpeg process exited with code: ${code}`);
        reject(new Error(`FFmpeg process exited with code: ${code}`));
      }
    });

    ffmpeg.on("error", (err) => {
      logger.error(`Failed to start FFmpeg: ${err.message}`);
      reject(err);
    });
  });
};

const convertTsSegmentsToM3u8 = async (folderPath) => {
  return new Promise((resolve, reject) => {
    const absoluteFolderPath = path.resolve(folderPath);

    // Specify the output m3u8 file name
    const m3u8FilePath = path.join(absoluteFolderPath, "output.m3u8");

    // Collect all .ts files in the folder and sort them to maintain order
    const tsFiles = fs
      .readdirSync(absoluteFolderPath)
      .filter((file) => file.endsWith(".ts"))
      .sort(); // Sort if order matters

    if (tsFiles.length === 0) {
      return reject(new Error("No .ts files found in the folder"));
    }

    // Create the M3U8 playlist content
    let m3u8Content = `#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:10\n`;

    tsFiles.forEach((file, index) => {
      // Get the duration of each TS file (optional, here it is hardcoded as 1 second)
      m3u8Content += `#EXTINF:10.000,\n${file}\n`;
    });

    // Mark the end of the playlist
    m3u8Content += `#EXT-X-ENDLIST`;

    // Write the M3U8 content to the output file
    fs.writeFileSync(m3u8FilePath, m3u8Content, { encoding: "utf8" });
    logger.info(`M3U8 playlist created at ${m3u8FilePath}`);

    resolve(m3u8FilePath);
  });
};

const getTsFileDuration = (tsFilePath) => {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      tsFilePath,
    ]);

    let output = "";
    ffprobe.stdout.on("data", (data) => {
      output += data;
    });

    ffprobe.on("close", (code) => {
      if (code === 0) {
        resolve(parseFloat(output));
      } else {
        reject(new Error(`Failed to get duration for file: ${tsFilePath}`));
      }
    });
  });
};

const findClosetTsFile = async (directory) => {
  try {
    const files = fs.readdirSync(directory);
    let totalDuration = 0;
    const durations = [];

    // Filter .ts files and get their durations
    for (const file of files) {
      if (path.extname(file) === ".ts") {
        const filePath = path.join(directory, file);
        const duration = await getTsFileDuration(filePath);
        durations.push({ file, duration });
        totalDuration += duration;
        console.log(`File: ${file}, Duration: ${duration.toFixed(2)} seconds`);
      }
    }

    // Calculate 10% of the total duration
    const tenPercentDuration = totalDuration * 0.1;
    console.log(`Total duration: ${totalDuration.toFixed(2)} seconds`);
    console.log(
      `10% of the total duration: ${tenPercentDuration.toFixed(2)} seconds`
    );

    // Find the first file that causes the cumulative duration to exceed or get close to 10%
    let cumulativeDuration = 0;
    let selectedFile = null;

    for (const { file, duration } of durations) {
      cumulativeDuration += duration;

      // If cumulative duration exceeds 10% or is closest to it, return that file
      if (cumulativeDuration >= tenPercentDuration) {
        selectedFile = { file, duration };
        break;
      }
    }

    console.log(
      `File closest to 10% of total duration: ${
        selectedFile.file
      }, Duration: ${selectedFile.duration.toFixed(2)} seconds`
    );
    return { selectedFile: selectedFile, duration: totalDuration.toFixed(2) };
  } catch (error) {
    console.error("Error finding file closest to 10%:", error);
    throw error;
  }
};

const createThumbnailFromTsFile = async (tsFilePath, outputDir) => {
  try {
    console.log(`Creating thumbnail for: ${tsFilePath}`);

    // Check if the ts file exists before generating the thumbnail
    if (!fs.existsSync(tsFilePath)) {
      throw new Error(`TS file not found: ${tsFilePath}`);
    }

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFileName = `${path.basename(tsFilePath, ".ts")}-thumbnail.png`;
    const outputPath = path.join(outputDir, outputFileName);

    // Generate a thumbnail using ffmpeg from 5 seconds
    await new Promise((resolve, reject) => {
      const ffmpeg = spawn("ffmpeg", [
        "-analyzeduration",
        "100M", // Increase probe duration
        "-probesize",
        "100M", // Increase probe size
        "-ss",
        "00:00:05", // Seek to 5 seconds
        "-i",
        tsFilePath,
        "-vf",
        "thumbnail",
        "-frames:v",
        "1", // Get only one frame
        "-update",
        "1", // Update the output file
        outputPath,
      ]);

      ffmpeg.stderr.on("data", (data) => {
        console.error(`FFmpeg stderr: ${data?.toString()}`);
      });

      ffmpeg.stdout.on("data", (data) => {
        console.log(`FFmpeg stdout: ${data?.toString()}`);
      });

      ffmpeg.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(
            new Error(
              `Failed to create thumbnail, ffmpeg exited with code ${code}`
            )
          );
        }
      });

      ffmpeg.on("error", (error) => {
        reject(
          new Error(
            `Failed to create thumbnail, ffmpeg error: ${error.message}`
          )
        );
      });
    });

    console.log(`Thumbnail created at: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error("Error creating thumbnail:", error);
    throw error;
  }
};

const replaceTsSegmentLinksInM3u8 = async (filePath, videoId) => {
  logger.info(`Replacing TS segment links in M3U8 file: ${filePath}`);

  // Update the URL to use BUNNY_DOMAIN_STORAGE_ZONE
  const url = `https://${process.env.BUNNY_DOMAIN_STORAGE_ZONE}/video/${videoId}/`;
  let m3u8Content = fs.readFileSync(filePath, { encoding: "utf8" });

  // logger.info(`Current M3U8 Content:\n${m3u8Content}`);

  // Adjust regex based on the actual TS file naming format
  const regex = new RegExp(`${videoId}[-\\w]+\\.ts`, "g");
  const matches = m3u8Content.match(regex);

  logger.info(`Regex pattern: ${regex}`);
  logger.info(`Matches found: ${matches ? matches.length : 0}`);

  // Replace TS segment links with the constructed URL
  m3u8Content = m3u8Content.replace(regex, (match) => {
    return `${url}${match}`; // Use the new base URL
  });

  fs.writeFileSync(filePath, m3u8Content);
  // logger.info(`Updated M3U8 Content:\n${m3u8Content}`);
};

const convertMp4ToTsSegments = async (filePath) => {
  return new Promise((resolve, reject) => {
    const dirPath = path.dirname(filePath);
    const baseName = path.parse(filePath).name;
    const tsFilePattern = path.join(dirPath, `${baseName}_%03d.ts`);

    ffmpeg(filePath)
      .outputOptions(
        "-map",
        "0",
        "-segment_time",
        "10",
        "-f",
        "segment",
        "-reset_timestamps",
        "1"
      )
      .output(tsFilePattern)
      .on("end", () => {
        logger.info(`File converted to segments: ${tsFilePattern}`);
        resolve(`Segments created with pattern: ${tsFilePattern}`);
      })
      .on("error", (err) => {
        logger.error(`Failed to convert file: ${err.message}`);
        reject(err);
      })
      .run();
  });
};

const changeFileName = async (filePath, newName) => {
  return new Promise((resolve, reject) => {
    const dirPath = path.dirname(filePath);
    const ext = path.extname(filePath);
    const newFilePath = path.join(dirPath, newName + ext);

    fs.rename(filePath, newFilePath, (err) => {
      if (err) {
        logger.error(`Failed to change file name: ${err.message}`);
        return reject(err);
      }
      logger.info(`File name changed to ${newFilePath}`);
      resolve(newFilePath);
    });
  });
};

const splitVideo = async (filePath, parts = 10) => {
  return new Promise((resolve, reject) => {
    // Get the video duration first
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        logger.error(`Failed to get video metadata: ${err.message}`);
        return reject(err);
      }

      const duration = metadata.format.duration;
      const segmentDuration = duration / parts;

      const segmentPromises = [];

      for (let i = 0; i < parts; i++) {
        const start = i * segmentDuration;
        const outputFilePath = filePath.replace(
          path.extname(filePath),
          `_part${i + 1}${path.extname(filePath)}`
        );

        segmentPromises.push(
          new Promise((resolve, reject) => {
            ffmpeg(filePath)
              .setStartTime(start)
              .setDuration(segmentDuration)
              .output(outputFilePath)
              .on("end", () => {
                logger.info(`Segment ${i + 1} created at ${outputFilePath}`);
                resolve(outputFilePath);
              })
              .on("error", (err) => {
                logger.error(
                  `Failed to create segment ${i + 1}: ${err.message}`
                );
                reject(err);
              })
              .run();
          })
        );
      }

      // Wait for all segments to be created
      Promise.all(segmentPromises)
        .then((outputFiles) => resolve(outputFiles))
        .catch(reject);
    });
  });
};

const checkFileSuccess = async (filePath) => {
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

const deleteFile = async (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        logger.error(`Failed to delete file ${filePath}: ${err.message}`);
        return reject(err); // Reject the promise with the error
      }
      logger.info(`Deleted file ${filePath} successfully`);
      resolve(); // Resolve the promise on success
    });
  });
};

const deleteFolder = async (folderPath) => {
  return new Promise((resolve, reject) => {
    fs.rm(folderPath, { recursive: true }, (err) => {
      if (err) {
        logger.error(`Failed to delete folder ${folderPath}: ${err.message}`);
        return reject(err);
      }
      logger.info(`Deleted folder ${folderPath} successfully`);
      resolve();
    });
  });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir = "";
    switch (file.fieldname) {
      case "avatar":
        const { userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          logger.error(`Invalid user ID: ${userId}`);
          return cb("Error: Invalid user ID");
        }
        dir = path.join(`assets/images/users/${userId}`);
        break;
      case "categoryImg":
        const { categoryId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
          logger.error(`Invalid category ID: ${categoryId}`);
          return cb("Error: Invalid category ID");
        }
        dir = path.join(`assets/images/categories/${categoryId}`);
        break;
      case "categoryUrl":
        dir = path.join(`assets/images/categories/create`);
        break;
      case "video":
        const userIdFromToken = req.userId;
        dir = path.join(`assets/videos/${userIdFromToken}/${Date.now()}`);
        break;
      case "videoThumbnail":
        const { videoId } = req.params;
        dir = path.join(
          `assets/videos/${videoId}/${
            file.fieldname === "video" ? "source" : "thumbnail"
          }`
        );
        break;
      case "streamThumbnail":
        const { streamId } = req.params;
        dir = path.join(`assets/images/streams/${streamId}`);
        break;
      case "roomCreateImg":
        dir = path.join(`assets/images/room/create`);
        break;
      case "roomUpdateImg":
        const { roomId } = req.params;
        dir = path.join(`assets/images/room/${roomId}`);
        break;
      case "playlistCreate":
        dir = path.join(`assets/images/playlist/create`);
        break;
      case "playlistUpdate":
        const { playlistId } = req.params;
        dir = path.join(`assets/images/playlist/${playlistId}`);
        break;
      case "giftCreateImg":
        dir = path.join(`assets/images/gifts/create`);
        break;
      case "giftUpdateImg":
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
          logger.error(`Invalid gift ID: ${id}`);
          return cb("Error: Invalid gift ID");
        }
        dir = path.join(`assets/images/gifts/${id}`);
        break;
      default:
        logger.error(`Unknown field name: ${file.fieldname}`);
        return cb(`Error: Unknown field name '${file.fieldname}'`);
    }

    fs.mkdir(dir, { recursive: true }, (err) => {
      if (err) {
        logger.error(`Failed to create directory ${dir}: ${err.message}`);
        return cb(err);
      }
      cb(null, dir);
    });
  },
  filename: async (req, file, cb) => {
    let baseName = req.headers["content-length"] + "_" + Date.now(); // the file is named by the size of the file
    const ext = path.extname(file.originalname);
    let fileName = "";
    let dirPath = "";

    switch (file.fieldname) {
      case "avatar":
        const { userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          logger.error(`Invalid user ID: ${userId}`);
          return cb("Error: Invalid user ID");
        }
        fileName = `${baseName}${ext}`;
        dirPath = path.join(`assets/images/users/${userId}`);
        break;
      case "categoryUrl":
        fileName = `${baseName}${ext}`;
        dirPath = path.join(`assets/images/categories/create`);
        break;
      case "categoryImg":
        const { categoryId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
          logger.error(`Invalid category ID: ${categoryId}`);
          return cb("Error: Invalid category ID");
        }
        fileName = `${baseName}${ext}`;
        dirPath = path.join(`assets/images/categories/${categoryId}`);
        break;
      case "video":
        const userIdFromToken = req.userId;
        fileName = `${baseName}${ext}`;
        dirPath = path.join(`assets/videos/${userIdFromToken}/${Date.now()}`);
      case "videoThumbnail":
        const { videoId } = req.params;
        baseName = videoId;
        fileName = `${baseName}${ext}`;
        dirPath = path.join(
          `assets/videos/${videoId}/${
            file.fieldname === "video" ? "source" : "thumbnail"
          }`
        );
        break;
      case "streamThumbnail":
        const { streamId } = req.params;
        fileName = `${baseName}${ext}`;
        dirPath = path.join(`assets/images/streams/${streamId}`);
        break;
      case "playlistCreate":
        fileName = `${baseName}${ext}`;
        dirPath = path.join(`assets/images/playlist/create`);
        break;
      case "playlistUpdate":
        const { playlistId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(playlistId)) {
          logger.error(`Invalid playlist ID: ${playlistId}`);
          return cb("Error: Invalid playlist ID");
        }
        fileName = `${baseName}${ext}`;
        dirPath = path.join(`assets/images/playlist/${playlistId}`);
        break;
      case "roomCreateImg":
        fileName = `${baseName}${ext}`;
        dirPath = path.join(`assets/images/rooms/create`);
        break;
      case "roomUpdateImg":
        const { roomId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(roomId)) {
          logger.error(`Invalid room ID: ${roomId}`);
          return cb("Error: Invalid room ID");
        }
        fileName = `${baseName}${ext}`;
        dirPath = path.join(`assets/images/rooms/${roomId}`);
        break;
      case "giftCreateImg":
        fileName = `${baseName}${ext}`;
        dirPath = path.join(`assets/images/gifts/create`);
        break;
      case "giftUpdateImg":
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
          logger.error(`Invalid gift ID: ${id}`);
          return cb("Error: Invalid gift ID");
        }
        fileName = `${baseName}${ext}`;
        dirPath = path.join(`assets/images/gifts/${id}`);
        break;
      default:
        logger.error(`Unknown field name: ${file.fieldname}`);
        return cb(`Error: Unknown field name '${file.fieldname}'`);
    }
    logger.info(`Saving file ${fileName} successfully to ${dirPath}`);
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif/;
  const allowedVideoTypes = /mp4|avi|flv|wmv/;

  let allowedTypes, formatMessage;

  if (file.fieldname === "video") {
    allowedTypes = allowedVideoTypes;
    formatMessage = "Allowed formats: mp4, avi, flv, wmv";
  } else {
    allowedTypes = allowedImageTypes;
    formatMessage = "Allowed formats: jpeg, jpg, png, gif";
  }

  const isMimeTypeValid = allowedTypes.test(file.mimetype);
  const isExtensionValid = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (isMimeTypeValid && isExtensionValid) {
    return cb(null, true);
  }

  const errorMessage = `Invalid format. ${formatMessage}`;

  cb(new CoreException(StatusCodeEnums.BadRequest_400, errorMessage), false);
};

const videoFilter = (req, file, cb) => {
  const allowedTypes = /mp4|avi|flv|wmv/;
  const mimeType = allowedTypes.test(file.mimetype);
  const extName = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimeType && extName) {
    return cb(null, true);
  }
  logger.error("Error: Videos Only!");
};

const uploadFile = multer({
  storage: storage,
  fileFilter: fileFilter,
});

module.exports = {
  uploadFile,
  deleteFile,
  deleteFolder,
  checkFileSuccess,
  splitVideo,
  changeFileName,
  convertMp4ToTsSegments,
  convertTsSegmentsToM3u8,
  removeExtension,
  removeFileName,
  replaceTsSegmentLinksInM3u8,
  extractFilenameFromUrl,
  extractFilenameFromPath,
  convertMp4ToHls,
  createThumbnailFromTsFile,
  findClosetTsFile,
  getTsFileDuration,
};
