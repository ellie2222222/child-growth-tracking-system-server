import { UpdateWriteOpResult } from "mongoose";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
import GrowthMetricsRepository from "../repositories/GrowthMetricsRepository";
import Database from "../utils/database";
import { Request } from "express";
import { ProgressBar } from "../utils/progressBar";
import ConfigRepository from "../repositories/ConfigRepository";
import getLogger from "../utils/logger";
const logger = getLogger("GROWTH_METRICS_SERVICE");

class GrowthMetricsService {
  private growthMetricsRepository: GrowthMetricsRepository;
  private configRepository: ConfigRepository;
  private database;

  constructor() {
    this.growthMetricsRepository = new GrowthMetricsRepository();
    this.configRepository = new ConfigRepository();
    this.database = Database.getInstance();
  }

  uploadGrowthMetricsFile = async (
    metric: string,
    excelJsonData: Request["excelJsonData"]
  ): Promise<{
    result: Array<object>;
    insertedCount: number;
    updatedCount: number;
  }> => {
    try {
      // Prepare return data and counters
      let result: Array<object> = [];
      let updatedCount = 0;
      let insertedCount = 0;

      switch (metric) {
        case "HCFA":
        case "ACFA":
        case "BFA":
        case "LHFA":
        case "WFA": {
          const conversionRate = await this.configRepository.getConfig(
            "WHO_MONTH_TO_DAY_CONVERSION_RATE"
          );
          if (!conversionRate) {
            logger.error("Config not found");
            throw new CustomException(
              StatusCodeEnum.InternalServerError_500,
              "Internal Server Error"
            );
          }

          // Transform the input data
          const transformedData = excelJsonData.map(
            ({ gender, ageindays, ageinmonths, l, m, s, ...percentiles }) => {
              const inDays =
                ageindays !== undefined
                  ? ageindays
                  : ageinmonths * parseFloat(conversionRate.value);
              const inMonths =
                ageinmonths !== undefined
                  ? ageinmonths
                  : ageindays / parseFloat(conversionRate.value);

              return {
                gender,
                age: {
                  inDays,
                  inMonths,
                },
                percentiles: {
                  L: l,
                  M: m,
                  S: s,
                  values: Object.entries(percentiles)
                    .filter(([key]) => key.startsWith("p"))
                    .map(([key, value]) => ({
                      percentile: parseFloat(key.replace(/^p/i, "")),
                      value: Number(value),
                    })),
                },
              };
            }
          );

          // Setup a progress bar (optional)
          const totalRecords = transformedData.length;
          const progressBar = new ProgressBar(totalRecords);

          // Helper: split an array into chunks of specified size
          const chunkArray = <T>(arr: T[], chunkSize: number): T[][] => {
            const chunks: T[][] = [];
            for (let i = 0; i < arr.length; i += chunkSize) {
              chunks.push(arr.slice(i, i + chunkSize));
            }
            return chunks;
          };

          const batchSize = 100;
          const batches = chunkArray(transformedData, batchSize);

          // Process each batch in its own transaction session
          for (const batch of batches) {
            const session = await this.database.startTransaction();
            let committed: boolean = false;
            try {
              for (const data of batch) {
                result.push(data);
                const resultData: UpdateWriteOpResult = await this.growthMetricsRepository.upsertGrowthMetricsForAgeData(
                  data,
                  metric,
                  session
                );

                updatedCount += resultData.modifiedCount;
                insertedCount += resultData.upsertedCount;
                progressBar.update();
              }

              await this.database.commitTransaction(session);
              committed = true;
            } catch (error) {
              if (!committed) {
                await this.database.abortTransaction(session);
              }
              throw error;
            }
          }
          progressBar.complete(insertedCount, updatedCount);
          break;
        }

        case "WFLH":
          const transformedData = excelJsonData.map(
            ({ gender, height, l, m, s, ...percentiles }) => {
              return {
                gender,
                height,
                percentiles: {
                  L: l,
                  M: m,
                  S: s,
                  values: Object.entries(percentiles)
                    .filter(([key]) => key.startsWith("p"))
                    .map(([key, value]) => ({
                      percentile: parseFloat(key.replace(/^p/i, "")),
                      value: Number(value),
                    })),
                },
              };
            }
          );

          // Setup a progress bar (optional)
          const totalRecords = transformedData.length;
          const progressBar = new ProgressBar(totalRecords);

          // Helper: split an array into chunks of specified size
          const chunkArray = <T>(arr: T[], chunkSize: number): T[][] => {
            const chunks: T[][] = [];
            for (let i = 0; i < arr.length; i += chunkSize) {
              chunks.push(arr.slice(i, i + chunkSize));
            }
            return chunks;
          };

          const batchSize = 100;
          const batches = chunkArray(transformedData, batchSize);

          // Process each batch in its own transaction session
          for (const batch of batches) {
            const session = await this.database.startTransaction();
            let committed: boolean = false;
            try {
              for (const data of batch) {
                result.push(data);
                const resultData: UpdateWriteOpResult = await this.growthMetricsRepository.upsertWflhData(data, session);
                updatedCount += resultData.modifiedCount;
                insertedCount += resultData.upsertedCount;
                progressBar.update();
              }
              await this.database.commitTransaction(session);
              committed = true;
            } catch (error) {
              if (!committed) {
                await this.database.abortTransaction(session);
              }
              throw error;
            }
          }

          progressBar.complete(insertedCount, updatedCount);
          break;

        case "WV":
        case "HV":
        case "HCV": {
          const conversionRate = await this.configRepository.getConfig(
            "WHO_MONTH_TO_DAY_CONVERSION_RATE"
          );
          if (!conversionRate) {
            logger.error("Config not found");
            throw new CustomException(
              StatusCodeEnum.InternalServerError_500,
              "Internal Server Error"
            );
          }

          // Transform the input data
          const transformedData = excelJsonData.map(
            ({ gender, interval, l, m, s, delta, ...percentiles }) => {
              // Convert the configuration value from string to number
              const conversionRateValue = parseFloat(conversionRate.value); // e.g., 30.4375
          
              // Split the interval string using a regex to catch both hyphen and en dash
              const parts = interval.split(/[-–]/).map((part: string) => part.trim());
              // Expect two parts: first interval and last interval
              const firstPart = parts[0];
              const lastPart = parts[1];
          
              // Parse each part to extract the numeric value and unit
              const firstIntervalParsed = this.parseIntervalPart(firstPart);
              const lastIntervalParsed = this.parseIntervalPart(lastPart);
          
              // Convert the parsed intervals to months, weeks, and days
              const firstIntervalConverted = this.convertInterval(
                firstIntervalParsed.value,
                firstIntervalParsed.unit,
                conversionRateValue
              );
              const lastIntervalConverted = this.convertInterval(
                lastIntervalParsed.value,
                lastIntervalParsed.unit,
                conversionRateValue
              );
          
              return {
                gender,
                firstInterval: {
                  inMonths: firstIntervalConverted.inMonths,
                  inWeeks: firstIntervalConverted.inWeeks,
                  inDays: firstIntervalConverted.inDays,
                },
                lastInterval: {
                  inMonths: lastIntervalConverted.inMonths,
                  inWeeks: lastIntervalConverted.inWeeks,
                  inDays: lastIntervalConverted.inDays,
                },
                percentiles: {
                  L: l,
                  M: m,
                  S: s,
                  delta,
                  values: Object.entries(percentiles)
                    .filter(([key]) => key.toLowerCase().startsWith("p"))
                    .map(([key, value]) => ({
                      percentile: parseFloat(key.replace(/^p/i, "")),
                      value: Number(value),
                    })),
                },
              };
            }
          );

          // Setup a progress bar (optional)
          const totalRecords = transformedData.length;
          const progressBar = new ProgressBar(totalRecords);

          // Helper: split an array into chunks of specified size
          const chunkArray = <T>(arr: T[], chunkSize: number): T[][] => {
            const chunks: T[][] = [];
            for (let i = 0; i < arr.length; i += chunkSize) {
              chunks.push(arr.slice(i, i + chunkSize));
            }
            return chunks;
          };

          const batchSize = 100;
          const batches = chunkArray(transformedData, batchSize);

          // Process each batch in its own transaction session
          for (const batch of batches) {
            const session = await this.database.startTransaction();
            let committed: boolean = false;
            try {
              for (const data of batch) {
                result.push(data);
                const resultData: UpdateWriteOpResult = await this.growthMetricsRepository.upsertGrowthVelocityData(
                  data,
                  metric,
                  session
                );

                updatedCount += resultData.modifiedCount;
                insertedCount += resultData.upsertedCount;
                progressBar.update();
              }
              await this.database.commitTransaction(session);
              committed = true;
            } catch (error) {
              if (!committed) {
                await this.database.abortTransaction(session);
              }
              throw error;
            }
          }
          progressBar.complete(insertedCount, updatedCount);
          break;
        }

        default:
          throw new CustomException(
            StatusCodeEnum.BadRequest_400,
            "Unsupported metric"
          );
      }
      
      return {
        result,
        insertedCount,
        updatedCount,
      };
    } catch (error) {
      // Any error outside the batch processing gets thrown here
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

    /**
   * Parses a part of the interval string.
   * Example inputs: "4wks", "2 mo", "0"
   */
  private parseIntervalPart(part: string): { value: number; unit: string } {
    // Match a number (possibly with decimals) and optional unit (letters)
    const match = part.match(/(\d+(?:\.\d+)?)(?:\s*([a-zA-Z]+))?/);
    if (match) {
      const value = parseFloat(match[1]);
      // If unit is not provided, you might decide on a default (here we default to months)
      const unit = match[2] ? match[2].toLowerCase() : "mo";
      return { value, unit };
    }
    // Fallback default if no match is found
    return { value: 0, unit: "mo" };
  }

  /**
   * Converts a numeric value from a given unit to months, weeks, and days.
   * @param value - The numeric value.
   * @param unit - The unit string (e.g., "mo", "wks", "day").
   * @param conversionRateValue - The conversion rate from day to month (e.g., 30.4375).
   */
  private convertInterval(
    value: number,
    unit: string,
    conversionRateValue: number
  ): { inMonths: number; inWeeks: number; inDays: number } {
    let inMonths: number, inWeeks: number, inDays: number;

    switch (unit) {
      case "mo":
      case "month":
      case "months":
        inMonths = value;
        inDays = value * conversionRateValue;
        inWeeks = inDays / 7;
        break;
      case "wk":
      case "wks":
      case "week":
      case "weeks":
        inWeeks = value;
        inDays = value * 7;
        inMonths = inDays / conversionRateValue;
        break;
      case "day":
      case "days":
      case "d":
        inDays = value;
        inWeeks = inDays / 7;
        inMonths = inDays / conversionRateValue;
        break;
      default:
        throw new CustomException(StatusCodeEnum.BadRequest_400, "Unspecified unit")
    }
    return { inMonths, inWeeks, inDays };
  }
}

export default GrowthMetricsService;
