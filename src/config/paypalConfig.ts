import paypal from "@paypal/checkout-server-sdk";
import dotenv from "dotenv";
dotenv.config();
// Environment Configuration
const environment = new paypal.core.SandboxEnvironment(
  `${process.env.PAYPAL_CLIENTID}`,
  `${process.env.PAYPAL_SECRET}`
);

const client = new paypal.core.PayPalHttpClient(environment);
const redirectUrl = {
  return_url: `${process.env.SERVER_URL}/api/payments/paypal/success`,
  cancel_url: `${process.env.SERVER_URL}/api/payments/paypal/failed`,
};
export { client, redirectUrl };
