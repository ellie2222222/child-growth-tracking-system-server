import { Request } from "express";

export interface IGrowthMetricsService {
  uploadGrowthMetricsFile: (
    metric: string,
    excelJsonData: Request["excelJsonData"]
  ) => Promise<{
    result: Array<object>;
    insertedCount: number;
    updatedCount: number;
  }>;
}
