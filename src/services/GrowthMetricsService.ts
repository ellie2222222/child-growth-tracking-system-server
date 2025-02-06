import { UpdateWriteOpResult } from "mongoose";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
import { IBmi } from "../interfaces/IBmi";
import { ILhfa } from "../interfaces/ILhfa";
import { IWfa } from "../interfaces/IWfa";
import GrowthMetricsRepository, {
  GrowthMetricsQuery,
} from "../repositories/GrowthMetricsRepository";
import Database from "../utils/database";
import { Request } from "express";
import { ProgressBar } from "../utils/progressBar";

class GrowthMetricsService {
  private growthMetricsRepository: GrowthMetricsRepository;
  private database;

  constructor() {
    this.growthMetricsRepository = new GrowthMetricsRepository();
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
    const session = await this.database.startTransaction();
    try {

      // Prepare return data
      let result: Array<object> = [];
      let updatedCount = 0;
      let insertedCount = 0;

      switch (metric) {
        case "BMI":
          const bmiTransformedData: Partial<IBmi>[] = excelJsonData.map(
            ({ gender, agemonth, agemonthrange, l, m, s, ...percentiles }) => ({
              gender,
              ageMonth: agemonth,
              ageMonthRange:
                agemonthrange !== undefined
                  ? `${Math.floor(agemonthrange)}-${Math.ceil(agemonthrange)}`
                  : agemonthrange,
              percentiles: {
                L: l,
                M: m,
                S: s,
                values: Object.entries(percentiles)
                  .filter(([key]) => key.startsWith("p"))
                  .map(([key, value]) => ({
                    percentile: parseFloat(key.replace(/^p/i, "")),
                    value: value as number,
                  })),
              },
            })
          );

          const bmiTotalRecords = bmiTransformedData.length;
          const bmiProgressBar = new ProgressBar(bmiTotalRecords);

          for (const data of bmiTransformedData) {
            result.push(data);
            const resultData: UpdateWriteOpResult =
              await this.growthMetricsRepository.updateBmiData(data, session);
            updatedCount += resultData.modifiedCount;
            insertedCount += resultData.upsertedCount;
            bmiProgressBar.update();
          }

          bmiProgressBar.complete(insertedCount, updatedCount);

          break;

        case "LHFA":
          const lhfaTransformedData: Partial<ILhfa>[] = excelJsonData.map(
            ({ gender, agemonth, agemonthrange, l, m, s, ...percentiles }) => ({
              gender,
              ageMonth: agemonth,
              ageMonthRange:
                agemonthrange !== undefined
                  ? `${Math.floor(agemonthrange)}-${Math.ceil(agemonthrange)}`
                  : agemonthrange,
              percentiles: {
                L: l,
                M: m,
                S: s,
                values: Object.entries(percentiles)
                  .filter(([key]) => key.startsWith("p"))
                  .map(([key, value]) => ({
                    percentile: parseFloat(key.replace(/^p/i, "")),
                    value: value as number,
                  })),
              },
            })
          );

          const lhfaTotalRecords = lhfaTransformedData.length;
          const lhfaProgressBar = new ProgressBar(lhfaTotalRecords);

          for (const data of lhfaTransformedData) {
            result.push(data);
            const resultData: UpdateWriteOpResult =
              await this.growthMetricsRepository.updateLhfaData(data, session);
            updatedCount += resultData.modifiedCount;
            insertedCount += resultData.upsertedCount;
            lhfaProgressBar.update();
          }

          lhfaProgressBar.complete(insertedCount, updatedCount);

          break;

        case "WFA":
          const wfaTransformedData: Partial<IWfa>[] = excelJsonData.map(
            ({ gender, agemonth, agemonthrange, l, m, s, ...percentiles }) => ({
              gender,
              ageMonth: agemonth,
              ageMonthRange:
                agemonthrange !== undefined
                  ? `${Math.floor(agemonthrange)}-${Math.ceil(agemonthrange)}`
                  : agemonthrange,
              percentiles: {
                L: l,
                M: m,
                S: s,
                values: Object.entries(percentiles)
                  .filter(([key]) => key.startsWith("p"))
                  .map(([key, value]) => ({
                    percentile: parseFloat(key.replace(/^p/i, "")),
                    value: value as number,
                  })),
              },
            })
          );

          const wfaTotalRecords = wfaTransformedData.length;
          const wfaProgressBar = new ProgressBar(wfaTotalRecords);

          for (const data of wfaTransformedData) {
            result.push(data);
            const resultData: UpdateWriteOpResult =
              await this.growthMetricsRepository.updateWfaData(data, session);
            updatedCount += resultData.modifiedCount;
            insertedCount += resultData.upsertedCount;
            wfaProgressBar.update();
          }

          wfaProgressBar.complete(insertedCount, updatedCount);

          break;

        default:
          break;
      }

      await this.database.commitTransaction(session);

      return {
        result,
        insertedCount,
        updatedCount,
      };
    } catch (error) {
      await this.database.abortTransaction(session);
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
