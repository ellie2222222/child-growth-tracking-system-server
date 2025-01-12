import { createLogger, format, transports, Logger } from "winston";

const { combine, timestamp, label, printf, colorize } = format;

// ANSI color codes for label styling
const coloredLabel = (text: string) => `\x1b[33m${text}\x1b[0m`; // Purple

// Define the log format with a colored label
const logFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${coloredLabel(String(label))}] ${level}: ${message}`;
});

/**
 * Creates a Winston logger with a custom label styled in color.
 *
 * @param customLabel - The label to associate with the logger.
 * @returns A configured Winston logger.
 */
const getLogger = (customLabel: string): Logger => {
  return createLogger({
    format: combine(
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      label({ label: customLabel }),
      logFormat
    ),
    transports: [
      new transports.Console({
        format: combine(colorize(), logFormat),
      }),
    ],
  });
};

export default getLogger;
