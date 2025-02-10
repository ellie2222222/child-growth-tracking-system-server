import { UpdateWriteOpResult } from "mongoose";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
import { ILhfa } from "../interfaces/ILhfa";
import { IWfa } from "../interfaces/IWfa";
import GrowthMetricsRepository, {
  GrowthMetricsQuery,
} from "../repositories/GrowthMetricsRepository";
import Database from "../utils/database";
import { Request } from "express";
import { ProgressBar } from "../utils/progressBar";
import { IBfa } from "../interfaces/IBfa";
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
            try {
              for (const data of batch) {
                result.push(data);
                let resultData: UpdateWriteOpResult;

                switch (metric) {
                  case "BFA":
                    resultData =
                      await this.growthMetricsRepository.updateBfaData(
                        data,
                        session
                      );
                    break;
                    
                  case "LHFA":
                    resultData =
                      await this.growthMetricsRepository.updateLhfaData(
                        data,
                        session
                      );
                    break;

                  case "WFA":
                    resultData =
                      await this.growthMetricsRepository.updateWfaData(
                        data,
                        session
                      );
                    break;

                  case "HCFA":
                    resultData =
                      await this.growthMetricsRepository.updateHcfaData(
                        data,
                        session
                      );
                    break;

                  case "ACFA":
                    resultData =
                      await this.growthMetricsRepository.updateAcfaData(
                        data,
                        session
                      );
                    break;

                  default:
                    throw new CustomException(
                      StatusCodeEnum.BadRequest_400,
                      "Unsupported metric"
                    );
                }
                updatedCount += resultData.modifiedCount;
                insertedCount += resultData.upsertedCount;
                progressBar.update();
              }
              await this.database.commitTransaction(session);
            } catch (error) {
              await this.database.abortTransaction(session);
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
            try {
              for (const data of batch) {
                result.push(data);
                const resultData: UpdateWriteOpResult = await this.growthMetricsRepository.updateWflhData(data, session);
                updatedCount += resultData.modifiedCount;
                insertedCount += resultData.upsertedCount;
                progressBar.update();
              }
              await this.database.commitTransaction(session);
            } catch (error) {
              await this.database.abortTransaction(session);
              throw error;
            }
          }

          progressBar.complete(insertedCount, updatedCount);
          break;

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
}

export default GrowthMetricsService;
