import CustomException from "../exceptions/CustomException";
import MembershipPackageService from "./MembershipPackagesService";
import UserService from "./UserService";
import StatusCodeEnums from "../enums/StatusCodeEnum";
import { IUser } from "../interfaces/IUser";
import { ObjectId } from "mongoose";
import { PaypalPayment, VnpayPayment } from "../utils/payment";
import { IPaymentService } from "../interfaces/services/IPaymentService";

class PaymentService implements IPaymentService {
  private membershipPackageService: MembershipPackageService;
  private userService: UserService;

  constructor() {
    this.membershipPackageService = new MembershipPackageService();
    this.userService = new UserService();
  }

  private checkUserPackage = async (userId: string) => {
    const user = await this.userService.getUserById(userId, userId);
    if (!user) {
      throw new CustomException(
        StatusCodeEnums.BadRequest_400,
        "User not found"
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
    userId: string
  ): Promise<string> => {
    try {
      await this.checkUserPackage(userId);
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

        case "VND":
          if (price !== testPackage.price.value * 25000) {
            throw new CustomException(
              StatusCodeEnums.BadRequest_400,
              "Price mismatch, please check the item's price"
            );
          }
          break;

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
    bankCode?: string
  ): Promise<string> => {
    try {
      await this.checkUserPackage(userId);
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
          if (price !== testPackage.price.value * 25000) {
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
