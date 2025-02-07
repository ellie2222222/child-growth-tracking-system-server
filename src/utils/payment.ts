import { client, redirectUrl } from "../config/paypalConfig";
import paypal from "@paypal/checkout-server-sdk";
import { v4 as uuidv4 } from "uuid";
import { ILink, VnpParams } from "../controllers/PaymentController";
import { vnpayConfig } from "../config/vnpayConfig";
import querystring from "qs";
import crypto from "crypto";
import moment from "moment";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";

const sortObject = (obj: Record<string, unknown>) => {
  const sortedKeys = Object.keys(obj).sort();
  const sortedObj: Record<string, string> = {};
  sortedKeys.forEach((key) => {
    sortedObj[key] = encodeURIComponent(String(obj[key])).replace(/%20/g, "+");
  });
  return sortedObj;
};

const PaypalPayment = async (
  price: number,
  userId: string,
  packageId: string
) => {
  try {
    const request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({
      intent: "CAPTURE",

      purchase_units: [
        {
          invoice_id: uuidv4(),
          amount: {
            currency_code: "USD",
            value: price.toString(),
          },
          custom_id: `${userId}|${packageId}`,
        },
      ],

      application_context: {
        brand_name: "Child Growth Tracking",
        landing_page: "LOGIN",
        shipping_preference: "GET_FROM_FILE",
        user_action: "PAY_NOW",
        return_url: `${redirectUrl.return_url}`,
        cancel_url: `${redirectUrl.cancel_url}`,
      },
    });

    // Execute the request
    const response = await client.execute(request);

    // Find the approval link
    const approvalLink = response.result.links?.find(
      (link: ILink) => link.rel === "approve"
    )?.href;

    return approvalLink;
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

const VnpayPayment = async (
  price: number,
  userId: string,
  packageId: string,
  ipAddr: string,
  bankCode?: string
) => {
  try {
    const createDate = moment(new Date()).format("YYYYMMDDHHmmss");
    let vnp_Params: VnpParams = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: vnpayConfig.vnp_TmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: uuidv4(),
      vnp_OrderInfo: `${userId}|${packageId}`,
      vnp_OrderType: "Membership package",
      vnp_Amount: String(price * 100),
      vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
      vnp_IpAddr: ipAddr as string,
      vnp_CreateDate: createDate,
    };

    if (bankCode) {
      vnp_Params["vnp_BankCode"] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params) as VnpParams;
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret);
    vnp_Params["vnp_SecureHash"] = hmac
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    const vnpUrl = `${vnpayConfig.vnp_Url}?${querystring.stringify(vnp_Params, {
      encode: false,
    })}`;
    return vnpUrl;
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

export { PaypalPayment, sortObject, VnpayPayment };
