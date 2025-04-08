import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
import { IConfig } from "../interfaces/models/IConfig";
import { IConfigRepository } from "../interfaces/repositories/IConfigRepository";
import ConfigModel from "../models/ConfigModel";

class ConfigRepository implements IConfigRepository {
  async getConfig(key: string): Promise<IConfig | null> {
    try {
      const data = await ConfigModel.findOne({ key });
      return data;
    } catch (error) {
      if (error as Error) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to retrieve config info: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  async getConfigs(): Promise<IConfig[]> {
    try {
      const data = await ConfigModel.find();
      return data;
    } catch (error) {
      if (error as Error) {
        throw new CustomException(
          StatusCodeEnum.InternalServerError_500,
          `Failed to retrieve config info: ${(error as Error).message}`
        );
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }
}

export default ConfigRepository;
