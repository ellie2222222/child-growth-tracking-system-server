import { ObjectId } from "mongoose";
import CustomException from "../exceptions/CustomException";
import { ILimitObject, ITier } from "../interfaces/ITier";
import TierRepository from "../repositories/TierRepository";
import Database from "../utils/database";
import UserRepository from "../repositories/UserRepository";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import UserEnum from "../enums/UserEnum";
import { IQuery } from "../interfaces/IQuery";

class TierService {
  private tierRepository: TierRepository;
  private database: Database;
  private userRepository: UserRepository;

  constructor() {
    this.tierRepository = new TierRepository();
    this.database = Database.getInstance();
    this.userRepository = new UserRepository();
  }

  createTier = async (
    tier: number,
    childrenLimit: number,
    postsLimitValue: number,
    postLimitTime: number,
    updateRecordsLimitValue: number,
    updateRecordsLimitTime: number,
    viewRecordsLimitValue: number,
    viewRecordsLimitTime: number
  ) => {
    const session = await this.database.startTransaction();

    try {
      const data: Partial<ITier> = {
        tier: tier,
        childrenLimit: childrenLimit,

        postsLimit: {
          value: postsLimitValue,
          time: postLimitTime,
          description: `this tier's user can post ${postsLimitValue} in an interval of ${postLimitTime} day(s)`,
        } as ILimitObject,

        updateRecordsLimit: {
          value: updateRecordsLimitValue,
          time: updateRecordsLimitTime,
          description: `this tier's user can add child record ${updateRecordsLimitValue} in an interval of ${updateRecordsLimitTime} day(s)`,
        } as ILimitObject,

        viewRecordsLimit: {
          value: viewRecordsLimitValue,
          time: viewRecordsLimitTime,
          description: `this tier's user can view child record ${viewRecordsLimitValue} in an interval of ${viewRecordsLimitTime} day(s)`,
        } as ILimitObject,
      };

      const createdTier = await this.tierRepository.createTier(data, session);

      await this.database.commitTransaction(session);

      return createdTier;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error as Error | CustomException) {
        throw error;
      }
    } finally {
      session.endSession();
    }
  };

  updateTier = async (
    id: string | ObjectId,
    childrenLimit: number,
    postsLimitValue: number,
    postLimitTime: number,
    updateRecordsLimitValue: number,
    updateRecordsLimitTime: number,
    viewRecordsLimitValue: number,
    viewRecordsLimitTime: number
  ) => {
    const session = await this.database.startTransaction();
    try {
      const oldTier = await this.tierRepository.getTier(id, false);

      const formatedPostLimit: ILimitObject = oldTier.postsLimit;
      const formatedUpdateRecordsLimit: ILimitObject =
        oldTier.updateRecordsLimit;
      const formatedViewRecordLimit: ILimitObject = oldTier.viewRecordsLimit;

      let isModify = false;

      if (postLimitTime && postLimitTime !== oldTier.postsLimit.time) {
        formatedPostLimit.time = postLimitTime;
        isModify = true;
      }

      if (postsLimitValue && postsLimitValue !== oldTier.postsLimit.value) {
        formatedPostLimit.value = postsLimitValue;
        isModify = true;
      }

      if (isModify) {
        formatedPostLimit.description = `this tier's user can post ${formatedPostLimit.value} in an interval of ${formatedPostLimit.time} day(s)`;
      }

      if (
        updateRecordsLimitTime &&
        updateRecordsLimitTime !== oldTier.updateRecordsLimit.time
      ) {
        formatedUpdateRecordsLimit.time = updateRecordsLimitTime;
        isModify = true;
      }

      if (
        updateRecordsLimitValue &&
        updateRecordsLimitValue !== oldTier.updateRecordsLimit.value
      ) {
        formatedUpdateRecordsLimit.value = updateRecordsLimitValue;
        isModify = true;
      }

      if (isModify) {
        formatedUpdateRecordsLimit.description = `this tier's user can update records ${formatedUpdateRecordsLimit.value} in an interval of ${formatedUpdateRecordsLimit.time} day(s)`;
      }

      if (
        viewRecordsLimitTime &&
        viewRecordsLimitTime !== oldTier.viewRecordsLimit.time
      ) {
        formatedViewRecordLimit.time = viewRecordsLimitTime;
        isModify = true;
      }

      if (
        viewRecordsLimitValue &&
        viewRecordsLimitValue !== oldTier.viewRecordsLimit.value
      ) {
        formatedViewRecordLimit.value = viewRecordsLimitValue;
        isModify = true;
      }

      if (isModify) {
        formatedViewRecordLimit.description = `this tier's user can view records ${formatedViewRecordLimit.value} in an interval of ${formatedViewRecordLimit.time} day(s)`;
      }

      const data: Partial<ITier> = {
        childrenLimit: childrenLimit ? childrenLimit : oldTier.childrenLimit,
        postsLimit: formatedPostLimit,
        updateRecordsLimit: formatedUpdateRecordsLimit,
        viewRecordsLimit: formatedViewRecordLimit,
      };

      const updatedTier = await this.tierRepository.updateTier(
        id,
        data,
        session
      );

      await this.database.commitTransaction(session);

      return updatedTier;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error as Error | CustomException) {
        throw error;
      }
    } finally {
      session.endSession();
    }
  };

  getTier = async (id: string | ObjectId, requesterId: string) => {
    try {
      const checkRequester = await this.userRepository.getUserById(
        requesterId,
        false
      );

      if (!checkRequester) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Requester not found"
        );
      }

      const shouldIgnoreDeleted = [
        UserEnum.ADMIN,
        UserEnum.SUPER_ADMIN,
      ].includes(checkRequester?.role);

      const tierInfo = await this.tierRepository.getTier(
        id,
        shouldIgnoreDeleted
      );

      return tierInfo;
    } catch (error) {
      if (error as Error | CustomException) {
        throw error;
      }
    }
  };

  getTiers = async (
    query: IQuery,
    requesterId: string,
    ignoreDeleted: boolean
  ) => {
    try {
      const checkRequester = await this.userRepository.getUserById(
        requesterId,
        false
      );

      if (!checkRequester) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Requester not found"
        );
      }

      const shouldIgnoreDeleted =
        [UserEnum.ADMIN, UserEnum.SUPER_ADMIN].includes(checkRequester?.role) &&
        Boolean(ignoreDeleted);

      const TiersInfo = await this.tierRepository.getTiers(
        query,
        shouldIgnoreDeleted
      );

      return TiersInfo;
    } catch (error) {
      if (error as Error | CustomException) {
        throw error;
      }
    }
  };
}

export default TierService;
