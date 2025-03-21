import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
import { IUser } from "../interfaces/IUser";
import { IReceiptRepository } from "../interfaces/repositories/IReceiptRepository";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { IStatisticService } from "../interfaces/services/IStatisticService";
// import ReceiptRepository from "../repositories/ReceiptRepository";
import {
  addDays,
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfMonth,
  endOfYear,
  endOfWeek,
} from "date-fns";

export type IRevenue = {
  Date: string;
  Revenue: number;
};

export type INewUsers = {
  Date: string;
  newUsers: number;
};
class StatisticService implements IStatisticService {
  private receiptRepository: IReceiptRepository;
  private userRepository: IUserRepository;

  constructor(
    receiptRepository: IReceiptRepository,
    userRepository: IUserRepository
  ) {
    this.receiptRepository = receiptRepository;
    this.userRepository = userRepository;
  }

  getMonday = (d: Date) => {
    const dt = new Date(d);
    const day = dt.getDay();
    const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(dt.setDate(diff));
  };

  getRevenue = async (
    time: string,
    unit: string,
    value?: number
  ): Promise<IRevenue[]> => {
    try {
      const today = new Date(
        Date.UTC(
          new Date().getUTCFullYear(),
          new Date().getUTCMonth(),
          new Date().getUTCDate()
        )
      );
      let firstDay, lastDay;
      let interval: number;
      const revenue = [];
      let formatedValue;
      switch (time) {
        case "DAY":
          firstDay = new Date(today.setUTCHours(0, 0, 0, 0));
          lastDay = new Date(today.setUTCHours(23, 59, 59, 999));
          interval = 1;
          break;

        case "WEEK":
          //This idk why it work?
          //week start on 2 => start on tuesday
          //but at here by setting it 2, it's correctly starting on monday

          firstDay = startOfWeek(today.setUTCHours(0, 0, 0, 0), {
            weekStartsOn: 2,
          });
          lastDay = endOfWeek(today.setUTCHours(23, 59, 59, 999), {
            weekStartsOn: 2,
          });
          interval = 7;
          break;
        case "MONTH":
          formatedValue = value ? value - 1 : today.getMonth();
          firstDay = new Date(
            startOfMonth(
              new Date(
                new Date(today.getUTCFullYear(), formatedValue).getTime() +
                  24 * 60 * 60 * 1000
              )
            ).getTime() +
              24 * 60 * 60 * 1000
          );
          lastDay = new Date(
            endOfMonth(
              new Date(
                new Date(today.getUTCFullYear(), formatedValue).getTime() +
                  24 * 60 * 60 * 1000
              )
            ).getTime() +
              24 * 60 * 60 * 1000
          );
          interval = new Date(
            today.getFullYear(),
            formatedValue + 1,
            0
          ).getDate();
          break;
        case "YEAR":
          formatedValue = value ? value : today.getUTCFullYear();
          firstDay = startOfYear(
            new Date(Date.UTC(Number(formatedValue), 0, 2))
          );
          lastDay = endOfYear(
            new Date(Date.UTC(Number(formatedValue), 11, 31))
          );

          interval = 12;

          break;
        default:
          throw new CustomException(
            StatusCodeEnum.BadRequest_400,
            "Unsupported time type"
          );
      }
      const receipts = await this.receiptRepository.getAllReceiptsTimeInterval(
        firstDay as Date,
        lastDay as Date
      );

      const revenueMap = new Map();

      if (time !== "YEAR") {
        receipts.forEach((receipt) => {
          const dateKey = receipt.createdAt.toISOString().split("T")[0];
          const amount =
            receipt.totalAmount.currency === unit
              ? receipt.totalAmount.value
              : receipt.totalAmount.currency === "VND"
              ? receipt.totalAmount.value / 25000
              : receipt.totalAmount.value * 25000;

          revenueMap.set(dateKey, (revenueMap.get(dateKey) || 0) + amount);
        });
      } else {
        receipts.forEach((receipt) => {
          const date = new Date(receipt.createdAt);
          const year = date.getUTCFullYear();
          const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
          const dateKey = `${year}-${month}-01`;
          const amount =
            receipt.totalAmount.currency === unit
              ? receipt.totalAmount.value
              : receipt.totalAmount.currency === "VND"
              ? receipt.totalAmount.value / 25000
              : receipt.totalAmount.value * 25000;
          revenueMap.set(dateKey, (revenueMap.get(dateKey) || 0) + amount);
        });
      }

      for (let i = 0; i < interval; i++) {
        const date =
          time === "YEAR"
            ? new Date(Date.UTC(Number(formatedValue), i, 1))
            : addDays(firstDay, i);

        const dateKey = date.toISOString().split("T")[0];
        revenue.push({
          Date: date.toISOString().split("T")[0],
          Revenue: revenueMap.get(dateKey) || 0,
        });
      }

      return revenue;
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  getNewUsers = async (time: string, value?: number): Promise<INewUsers[]> => {
    try {
      const today = new Date(
        Date.UTC(
          new Date().getUTCFullYear(),
          new Date().getUTCMonth(),
          new Date().getUTCDate()
        )
      );
      let firstDay, lastDay;
      let interval: number;
      const newUsers = [];
      let formatedValue;
      switch (time) {
        case "DAY":
          firstDay = new Date(today.setUTCHours(0, 0, 0, 0));
          lastDay = new Date(today.setUTCHours(23, 59, 59, 999));
          interval = 1;
          break;

        case "WEEK":
          //This idk why it work?
          //week start on 2 => start on tuesday
          //but at here by setting it 2, it's correctly starting on monday

          firstDay = startOfWeek(today.setUTCHours(0, 0, 0, 0), {
            weekStartsOn: 2,
          });
          lastDay = endOfWeek(today.setUTCHours(23, 59, 59, 999), {
            weekStartsOn: 2,
          });
          interval = 7;
          break;
        case "MONTH":
          formatedValue = value ? value - 1 : today.getMonth();
          firstDay = new Date(
            startOfMonth(
              new Date(
                new Date(today.getUTCFullYear(), formatedValue).getTime() +
                  24 * 60 * 60 * 1000
              )
            ).getTime() +
              24 * 60 * 60 * 1000
          );
          lastDay = new Date(
            endOfMonth(
              new Date(
                new Date(today.getUTCFullYear(), formatedValue).getTime() +
                  24 * 60 * 60 * 1000
              )
            ).getTime() +
              24 * 60 * 60 * 1000
          );
          interval = new Date(
            today.getFullYear(),
            formatedValue + 1,
            0
          ).getDate();
          break;
        case "YEAR":
          formatedValue = value ? value : today.getUTCFullYear();
          firstDay = startOfYear(
            new Date(Date.UTC(Number(formatedValue), 0, 2))
          );
          lastDay = endOfYear(
            new Date(Date.UTC(Number(formatedValue), 11, 31))
          );

          interval = 12;

          break;
        default:
          throw new CustomException(
            StatusCodeEnum.BadRequest_400,
            "Unsupported time type"
          );
      }
      const users = await this.userRepository.getAllUsersTimeInterval(
        firstDay as Date,
        lastDay as Date
      );

      const userMap = new Map();

      if (time !== "YEAR") {
        users.forEach((user) => {
          const dateKey = (user.createdAt as Date).toISOString().split("T")[0];
          const amount = 1;

          userMap.set(dateKey, (userMap.get(dateKey) || 0) + amount);
        });
      } else {
        users.forEach((user: IUser) => {
          const date = new Date(user.createdAt as Date);
          const year = date.getUTCFullYear();
          const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
          const dateKey = `${year}-${month}-01`;
          const amount = 1;
          userMap.set(dateKey, (userMap.get(dateKey) || 0) + amount);
        });
      }

      for (let i = 0; i < interval; i++) {
        const date =
          time === "YEAR"
            ? new Date(Date.UTC(Number(formatedValue), i, 1))
            : addDays(firstDay, i);

        const dateKey = date.toISOString().split("T")[0];
        newUsers.push({
          Date: date.toISOString().split("T")[0],
          newUsers: userMap.get(dateKey) || 0,
        });
      }

      return newUsers;
    } catch (error) {
      if ((error as Error) || (error as CustomException)) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };
}

export default StatisticService;
