import { ObjectId } from "mongoose";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
// import MembershipPackageRepository from "../repositories/MembershipPackageRepository";
import { ReturnDataMembershipPackages } from "../repositories/MembershipPackageRepository";
// import UserRepository from "../repositories/UserRepository";
import Database from "../utils/database";
import UserEnum from "../enums/UserEnum";
import { IQuery } from "../interfaces/models/IQuery";
import { IMembershipPackage } from "../interfaces/models/IMembershipPackage";
import { IMembershipPackageService } from "../interfaces/services/IMembershipPackagesService";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { IMembershipPackageRepository } from "../interfaces/repositories/IMembershipPackageRepository";

export type PriceType = {
  value: number;
  unit: "USD" | "VND";
};
export type DurationType = {
  value: number;
  unit: "DAY";
};
class MembershipPackageService implements IMembershipPackageService {
  private membershipPackageRepository: IMembershipPackageRepository;
  private userRepository: IUserRepository;
  private database: Database;

  constructor(
    membershipPackageRepository: IMembershipPackageRepository,
    userRepository: IUserRepository
  ) {
    this.membershipPackageRepository = membershipPackageRepository;
    this.userRepository = userRepository;
    this.database = Database.getInstance();
  }

  createMembershipPackage = async (
    name: string,
    description: string,
    price: PriceType,
    duration: DurationType,
    postLimit: number,
    updateChildDataLimit: number
  ): Promise<IMembershipPackage> => {
    const session = await this.database.startTransaction();
    try {
      const checkMembership =
        await this.membershipPackageRepository.getMembershipByName(name);

      if (checkMembership) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Membership package name already exists"
        );
      }

      const membershipPackage =
        await this.membershipPackageRepository.createMembershipPackage(
          {
            name,
            description,
            price,
            duration,
            postLimit,
            updateChildDataLimit,
          },
          session
        );

      await this.database.commitTransaction(session);
      return membershipPackage;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    } finally {
      await session.endSession();
    }
  };

  getMembershipPackage = async (
    id: string | ObjectId,
    requesterId: string
  ): Promise<IMembershipPackage> => {
    try {
      let ignoreDeleted = false;
      if (requesterId !== "") {
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

        if ([UserEnum.ADMIN].includes(checkRequester?.role)) {
          ignoreDeleted = true;
        }
      }
      const membershipPackage =
        await this.membershipPackageRepository.getMembershipPackage(
          id,
          ignoreDeleted
        );
      if (!membershipPackage) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Membership package not found"
        );
      }

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

  getMembershipPackages = async (
    query: IQuery,
    requesterId: string
  ): Promise<ReturnDataMembershipPackages> => {
    try {
      let ignoreDeleted = false;

      if (requesterId !== "") {
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

        if ([UserEnum.ADMIN].includes(checkRequester?.role)) {
          ignoreDeleted = true;
        }
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
    postLimit: number,
    updateChildDataLimit: number
  ): Promise<IMembershipPackage> => {
    const session = await this.database.startTransaction();
    try {
      const oldPackage =
        await this.membershipPackageRepository.getMembershipPackage(id, false);

      if (!oldPackage) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Previous package not found"
        );
      }

      const checkMembership =
        await this.membershipPackageRepository.getMembershipByName(name);

      if (checkMembership) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Membership package name already exists"
        );
      }

      type data = {
        name?: string;
        description?: string;
        price?: PriceType;
        duration?: DurationType;
        postLimit?: number;
        updateChildDataLimit?: number;
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

      if (postLimit && !isNaN(postLimit)) {
        data.postLimit = postLimit;
      }

      if (updateChildDataLimit && !isNaN(updateChildDataLimit)) {
        data.updateChildDataLimit = updateChildDataLimit;
      }

      const membershipPackage =
        await this.membershipPackageRepository.updateMembershipPackage(
          id,
          data,
          session
        );
      await this.database.commitTransaction(session);
      return membershipPackage;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    } finally {
      await session.endSession();
    }
  };

  deleteMembershipPackage = async (id: string | ObjectId): Promise<boolean> => {
    const session = await this.database.startTransaction();
    try {
      const result =
        await this.membershipPackageRepository.deleteMembershipPackage(
          id,
          session
        );
      await this.database.commitTransaction(session);
      return result;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    } finally {
      await session.endSession();
    }
  };
}

export default MembershipPackageService;
