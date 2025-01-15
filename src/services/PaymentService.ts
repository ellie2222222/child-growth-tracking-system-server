import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const getAccessToken = async (): Promise<string> => {
  console.log("this is called");
  const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENTID;
  const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_SECRET;
  const PAYPAL_API_URL = "https://api-m.sandbox.paypal.com/v1/oauth2/token";

  const response = await axios.post(
    PAYPAL_API_URL, //url

    "grant_type=client_credentials", //body
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      auth: {
        username: `${PAYPAL_CLIENT_ID}`,
        password: `${PAYPAL_CLIENT_SECRET}`,
      },
    }
  );
  if (response) {
    // console.log(response.data.access_token);
    return response.data.access_token;
  }
  return "";
};
export default getAccessToken;
