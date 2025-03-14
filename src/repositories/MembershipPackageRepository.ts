import mongoose, { ClientSession, ObjectId } from "mongoose";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
import MembershipModel from "../models/MembershipPackageModel";
import { IQuery } from "../interfaces/IQuery";
import UserModel from "../models/UserModel";
import { IMembershipPackage } from "../interfaces/IMembershipPackage";
import { IMembershipPackageRepository } from "../interfaces/repositories/IMembershipPackageRepository";

export type ReturnDataMembershipPackages = {
  packages: IMembershipPackage[];
  page: number;
  totalPackages: number;
  totalPages: number;
};

class MembershipPackageRepository implements IMembershipPackageRepository {
  constructor() {}
  async createMembershipPackage(
    data: object,
    session?: ClientSession
  ): Promise<IMembershipPackage> {
    try {
      const membershipPackage = await MembershipModel.create([data], {
        session,
      });
      return membershipPackage[0];
    } catch (error) {
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  async getMembershipPackage(
    id: string | ObjectId,
    ignoreDeleted: boolean
  ): Promise<IMembershipPackage | null> {
    try {
      type searchQuery = {
        _id: mongoose.Types.ObjectId;
        isDeleted?: boolean;
      };

      const searchQuery: searchQuery = {
        _id: new mongoose.Types.ObjectId(id as string),
      };

      // console.log("in repo", searchQuery);

      if (!ignoreDeleted) {
        searchQuery.isDeleted = false;
      }

      const membershipPackage = await MembershipModel.findOne(searchQuery);
      // console.log("data:", membershipPackage);

      if (!membershipPackage) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Membership Package not found"
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
  }

  async getMembershipPackages(
    query: IQuery,
    ignoreDeleted: boolean
  ): Promise<ReturnDataMembershipPackages> {
    const { page, size, search, order, sortBy } = query;

    type searchQuery = {
      isDeleted?: boolean;
      name?: { $regex: string; $options: string };
    };
    const searchQuery: searchQuery = {};

    if (search && search !== "") {
      searchQuery.name = { $regex: search, $options: "i" };
    }

    if (!ignoreDeleted) {
      searchQuery.isDeleted = false;
    }

    let sortField = "createdAt";
    switch (sortBy) {
      case "date":
        sortField = "createdAt";
        break;

      case "name":
        sortField = "name";
        break;

      case "price":
        sortField = "convertedPrice";
        break;
      default:
        break;
    }
    if (sortBy === "date") sortField = "createdAt";
    const sortOrder: 1 | -1 = order === "ascending" ? 1 : -1;
    const skip = (page - 1) * size;

    try {
      const membershipPackages = await MembershipModel.aggregate([
        {
          $match: searchQuery,
        },
        {
          $addFields: {
            convertedPrice: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ["$price.unit", "USD"] }, // Changed 'currency' to 'unit'
                    then: { $multiply: ["$price.value", 25000] },
                  },
                  {
                    case: { $eq: ["$price.unit", "VND"] }, // Changed 'currency' to 'unit'
                    then: "$price.value",
                  },
                ],
                default: 0,
              },
            },
          },
        },
        { $sort: { [sortField]: sortOrder } },
        { $skip: skip },
        { $limit: size },
      ]);

      const totalMembershipPackages = await MembershipModel.countDocuments(
        searchQuery
      );

      return {
        packages: membershipPackages || [],
        page,
        totalPackages: totalMembershipPackages,
        totalPages: Math.ceil(totalMembershipPackages / size),
      };
    } catch (error) {
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  async updateMembershipPackage(
    id: string | ObjectId,
    data: object,
    session?: ClientSession
  ): Promise<IMembershipPackage> {
    try {
      await this.checkMembershipInUsers(id);

      const membershipPackage = await MembershipModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id as string),
          isDeleted: false,
        },
        data,
        { session, new: true }
      );

      if (!membershipPackage) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Membership Package not found"
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
  }

  async deleteMembershipPackage(
    id: string | ObjectId,
    session?: ClientSession
  ): Promise<boolean> {
    try {
      await this.checkMembershipInUsers(id);
      const membershipPackage = await MembershipModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id as string),
          isDeleted: false,
        },
        { $set: { isDeleted: true } },
        { session, new: true }
      );

      if (!membershipPackage) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Membership Package not found"
        );
      }
      return true;
    } catch (error) {
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  async checkMembershipInUsers(membershipId: string | ObjectId): Promise<void> {
    try {
      const user = await UserModel.findOne({
        $or: [
          {
            "subscription.currentPlan": new mongoose.Types.ObjectId(
              membershipId as string
            ),
          },
          {
            "subscription.futurePlan": new mongoose.Types.ObjectId(
              membershipId as string
            ),
          },
        ],
        isDeleted: false,
      });

      if (user) {
        throw new CustomException(
          StatusCodeEnum.Conflict_409,
          "This membership package is currently in use by some user"
        );
      }
    } catch (error) {
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  async getMembershipByName(name: string): Promise<IMembershipPackage | null> {
    try {
      const membershipPackage = await MembershipModel.findOne({
        name: { $eq: name },
        isDeleted: false,
      });

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
  }
}

export default MembershipPackageRepository;
