import CustomException from "../exceptions/CustomException";
// import MembershipPackageService from "./MembershipPackagesService";
// import UserService from "./UserService";
import StatusCodeEnums from "../enums/StatusCodeEnum";
import { IUser } from "../interfaces/models/IUser";
import { ObjectId } from "mongoose";
import { PaypalPayment, VnpayPayment } from "../utils/payment";
import { IPaymentService } from "../interfaces/services/IPaymentService";
import { IMembershipPackageService } from "../interfaces/services/IMembershipPackagesService";
import { IUserService } from "../interfaces/services/IUserService";

class PaymentService implements IPaymentService {
  private membershipPackageService: IMembershipPackageService;
  private userService: IUserService;

  constructor(
    membershipPackageService: IMembershipPackageService,
    userService: IUserService
  ) {
    this.membershipPackageService = membershipPackageService;
    this.userService = userService;
  }

  private checkUserPackage = async (userId: string, purchaseType?: string) => {
    const user = await this.userService.getUserById(userId, userId);

    if (!user) {
      throw new CustomException(
        StatusCodeEnums.BadRequest_400,
        "User not found"
      );
    }
    if (
      (user as IUser).subscription.currentPlan === null &&
      purchaseType === "FUTURE"
    ) {
      throw new CustomException(
        StatusCodeEnums.Conflict_409,
        "You need to have current plan before buying future plan"
      );
    }
    if (
      (user as IUser).subscription.currentPlan !== null &&
      purchaseType === "CURRENT"
    ) {
      throw new CustomException(
        StatusCodeEnums.Conflict_409,
        "Current plan has already existed"
      );
    }
    if ((user as IUser).subscription.futurePlan != null) {
      throw new CustomException(
        StatusCodeEnums.BadRequest_400,
        "You can only have 1 prepurchased package"
      );
    }
  };

  createPaypalPayment = async (
    price: number,
    packageId: string | ObjectId,
    userId: string,
    purchaseType?: string
  ): Promise<string> => {
    try {
      await this.checkUserPackage(userId, purchaseType);
      const testPackage =
        await this.membershipPackageService.getMembershipPackage(
          packageId,
          userId
        );

      if (!testPackage) {
        throw new CustomException(
          StatusCodeEnums.NotFound_404,
          "Membership package not found"
        );
      }

      switch (testPackage.price.unit) {
        case "USD":
          if (price !== testPackage.price.value) {
            throw new CustomException(
              StatusCodeEnums.BadRequest_400,
              "Price mismatch, please check the item's price"
            );
          }
          break;

        case "VND": {
          const convertedPrice = parseFloat((price * 25000).toFixed(2));
          const expectedPrice = parseFloat(testPackage.price.value.toFixed(2));

          if (Math.abs(convertedPrice - expectedPrice) > 25000) {
            // ±25,000 VND
            console.log(
              "Converted:",
              convertedPrice,
              "Expected:",
              expectedPrice
            );
            throw new CustomException(
              StatusCodeEnums.BadRequest_400,
              "Price mismatch, please check the item's price"
            );
          }
          break;
        }

        default:
          break;
      }
      const url = await PaypalPayment(price, userId, packageId as string);
      return url;
    } catch (error) {
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnums.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  createVnpayPayment = async (
    price: number,
    userId: string,
    packageId: string,
    ipAddr: string,
    bankCode?: string,
    purchaseType?: string
  ): Promise<string> => {
    try {
      await this.checkUserPackage(userId, purchaseType);
      const testPackage =
        await this.membershipPackageService.getMembershipPackage(
          packageId,
          userId
        );

      if (!testPackage) {
        throw new CustomException(
          StatusCodeEnums.NotFound_404,
          "Membership package not found"
        );
      }

      switch (testPackage.price.unit) {
        case "USD":
          if (
            parseFloat(price.toFixed(2)) !==
            parseFloat((testPackage.price.value * 25000).toFixed(2))
          ) {
            throw new CustomException(
              StatusCodeEnums.BadRequest_400,
              "Price mismatch, please check the item's price"
            );
          }
          break;

        case "VND":
          if (price !== testPackage.price.value) {
            throw new CustomException(
              StatusCodeEnums.BadRequest_400,
              "Price mismatch, please check the item's price"
            );
          }
          break;

        default:
          break;
      }

      const url = await VnpayPayment(
        price,
        userId,
        packageId,
        ipAddr,
        bankCode
      );
      return url;
    } catch (error) {
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnums.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };
}

export default PaymentService;
