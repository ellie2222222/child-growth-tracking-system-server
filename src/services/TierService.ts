import { ObjectId } from "mongoose";
import CustomException from "../exceptions/CustomException";
import { ITier } from "../interfaces/ITier";
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
    postsLimit: number
  ) => {
    const session = await this.database.startTransaction();

    try {
      const data: Partial<ITier> = {
        tier: tier,
        childrenLimit: childrenLimit,
        postsLimit: postsLimit,
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
    tier: number,
    childrenLimit: number,
    postsLimit: number
  ) => {
    const session = await this.database.startTransaction();
    try {
      const oldTier = await this.tierRepository.getTier(id, false);

      const data: Partial<ITier> = {
        tier: tier,
        childrenLimit: childrenLimit ? childrenLimit : oldTier.childrenLimit,
        postsLimit: postsLimit ? postsLimit : oldTier.postsLimit,
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
