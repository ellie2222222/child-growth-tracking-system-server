import StatusCodeEnum from "../enums/StatusCodeEnum";
import CustomException from "../exceptions/CustomException";
import ReceiptRepository from "../repositories/ReceiptRepository";
import {
  addDays,
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfMonth,
  endOfYear,
  endOfWeek,
} from "date-fns";
class StatisticService {
  private receiptRepository: ReceiptRepository;

  constructor() {
    this.receiptRepository = new ReceiptRepository();
  }
  getMonday = (d: Date) => {
    const dt = new Date(d);
    const day = dt.getDay();
    const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(dt.setDate(diff));
  };

  getRevenue = async (time: string, unit: string, value?: number) => {
    try {
      const today: Date = new Date();
      let firstDay, lastDay;
      let interval: number;
      const revenue = [];
      let formatedValue;
      switch (time) {
        case "DAY":
          firstDay = new Date(today.setHours(0, 0, 0, 0));
          lastDay = new Date(today.setHours(23, 59, 59, 999));
          interval = 1;
          break;

        case "WEEK":
          firstDay = startOfWeek(today, { weekStartsOn: 1 });
          lastDay = endOfWeek(today, { weekStartsOn: 1 });
          interval = 7;
          break;
        case "MONTH":
          formatedValue = value ? value : today.getMonth();
          firstDay = startOfMonth(new Date(today.getFullYear(), formatedValue));
          lastDay = endOfMonth(new Date(today.getFullYear(), formatedValue));
          interval = new Date(
            today.getFullYear(),
            formatedValue + 1,
            0
          ).getDate();
          break;
        case "YEAR":
          formatedValue = value ? value : today.getFullYear();
          firstDay = startOfYear(new Date(formatedValue));
          lastDay = endOfYear(new Date(formatedValue));
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

      receipts.forEach((receipt) => {
        const dateKey = receipt.createdAt.toISOString().split("T")[0];
        const amount =
          unit === "VND"
            ? receipt.totalAmount.currency === "VND"
              ? receipt.totalAmount.value
              : receipt.totalAmount.value * 25000
            : receipt.totalAmount.value;

        revenueMap.set(dateKey, (revenueMap.get(dateKey) || 0) + amount);
      });

      for (let i = 0; i < interval; i++) {
        const date =
          time === "YEAR"
            ? new Date(new Date(formatedValue as number).getFullYear(), i, 1)
            : addDays(firstDay, i);
        const dateKey = date.toISOString().split("T")[0];
        revenue.push({
          Date: date,
          revenue: revenueMap.get(dateKey) || 0,
          Unit: unit,
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
}

export default StatisticService;
