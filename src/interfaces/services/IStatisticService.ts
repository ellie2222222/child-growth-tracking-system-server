import { INewUsers, IRevenue } from "../../services/StatisticService";

export interface IStatisticService {
  getRevenue: (
    time: string,
    unit: string,
    value?: number
  ) => Promise<IRevenue[]>;

  getNewUsers: (time: string, value?: number) => Promise<INewUsers[]>;
}
