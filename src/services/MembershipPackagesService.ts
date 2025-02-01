import { ObjectId } from "mongoose";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
import MembershipPackageRepository from "../repositories/MembershipPackageRepository";
import UserRepository from "../repositories/UserRepository";
import Database from "../utils/database";
import UserEnum from "../enums/UserEnum";
import { IQuery } from "../interfaces/IQuery";

type PriceType = {
  value: number;
  unit: "USD" | "VND";
};
type DurationType = {
  value: number;
  unit: "DAY";
};
class MembershipPackageService {
  private membershipPackageRepository: MembershipPackageRepository;
  private userRepository: UserRepository;
  private database: Database;

  constructor() {
    this.membershipPackageRepository = new MembershipPackageRepository();
    this.userRepository = new UserRepository();
    this.database = Database.getInstance();
  }

  createMembershipPackage = async (
    name: string,
    description: string,
    price: PriceType,
    duration: DurationType,
    tier: number
  ) => {
    const session = await this.database.startTransaction();
    try {
      const membershipPackage =
        this.membershipPackageRepository.createMembershipPackage(
          {
            name,
            description,
            price,
            duration,
            tier,
          },
          session
        );

      await session.commitTransaction();
      return membershipPackage;
    } catch (error) {
      await session.abortTransaction();
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  getMembershipPackage = async (id: string | ObjectId, requesterId: string) => {
    try {
      let ignoreDeleted = false;

      const checkRequester = await this.userRepository.getUserById(
        requesterId,
        ignoreDeleted
      );

      if (!checkRequester) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Requester not found"
        );
      }

      if (
        [UserEnum.ADMIN, UserEnum.SUPER_ADMIN].includes(checkRequester?.role)
      ) {
        ignoreDeleted = true;
      }

      const membershipPackage =
        await this.membershipPackageRepository.getMembershipPackage(
          id,
          ignoreDeleted
        );
      return membershipPackage;
    } catch (error) {
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  getMembershipPackages = async (query: IQuery, requesterId: string) => {
    try {
      let ignoreDeleted = false;

      const checkRequester = await this.userRepository.getUserById(
        requesterId,
        ignoreDeleted
      );

      if (!checkRequester) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Requester not found"
        );
      }

      if (
        [UserEnum.ADMIN, UserEnum.SUPER_ADMIN].includes(checkRequester?.role)
      ) {
        ignoreDeleted = true;
      }

      const memberships =
        await this.membershipPackageRepository.getMembershipPackages(
          query,
          ignoreDeleted
        );
      return memberships;
    } catch (error) {
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  updateMembershipPackage = async (
    id: string | ObjectId,
    name: string,
    description: string,
    price: PriceType,
    duration: DurationType,
    tier: number
  ) => {
    const session = await this.database.startTransaction();
    try {
      const oldPackage =
        await this.membershipPackageRepository.getMembershipPackage(id, false);
      type data = {
        name?: string;
        description?: string;
        price?: PriceType;
        duration?: DurationType;
        tier?: number;
      };
      const data: data = {};

      if (name) {
        data.name = name;
      }
      if (description) {
        data.description = description;
      }
      if (price && !isNaN(price.value)) {
        if (!data.price) {
          data.price = {
            value: oldPackage.price.value,
            unit: oldPackage.price.unit,
          };
        }
        data.price.value = price.value;
        data.price.unit = price.unit || oldPackage.price.unit;
      }
      if (duration && !isNaN(duration.value)) {
        data.duration = duration;
      }
      if (tier && !isNaN(tier)) {
        data.tier = tier;
      }

      const membershipPackage =
        await this.membershipPackageRepository.updateMembershipPackage(
          id,
          data,
          session
        );
      await this.database.commitTransaction();
      return membershipPackage;
    } catch (error) {
      await this.database.abortTransaction();
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  deleteMembershipPackage = async (id: string | ObjectId) => {
    const session = await this.database.startTransaction();
    try {
      const result =
        await this.membershipPackageRepository.deleteMembershipPackage(
          id,
          session
        );
      await this.database.commitTransaction();
      return result;
    } catch (error) {
      await this.database.abortTransaction();
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };
}

export default MembershipPackageService;
