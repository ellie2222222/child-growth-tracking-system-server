import { IConfig } from "../IConfig";

export interface IConfigRepository {
  getConfig(key: string): Promise<IConfig | null>;
  getConfigs(): Promise<IConfig[]>;
}
