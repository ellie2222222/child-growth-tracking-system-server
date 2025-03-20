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
  return_url: `http://10.0.2.2:4000/api/payments/paypal/success`,
  cancel_url: `http://10.0.2.2:4000/api/payments/paypal/failed`,
};
export { client, redirectUrl };
