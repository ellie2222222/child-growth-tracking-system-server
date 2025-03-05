/***
 * NOTE: put all the static routes before the dynamic routes
 */

interface PublicRoutes {
  path: string;
  method: string;
}

const publicRoutes: PublicRoutes[] = [
  // Auth
  { path: "/api/auth/login", method: "POST" },
  { path: "/api/auth/signup", method: "POST" },
  { path: "/api/auth/logout", method: "POST" },
  { path: "/api/auth/renew-access-token", method: "POST" },
  { path: "/api/auth/me", method: "POST" },
  { path: "/", method: "GET" },
  { path: "/api/auth/google", method: "GET" },
  { path: "/api/auth/google/redirect", method: "GET" },

  // User
  { path: "/api/users", method: "GET" },

  // Payment
  { path: "/api/payments/paypal/success", method: "GET" },
  { path: "/api/payments/paypal/failed", method: "GET" },
  { path: "/api/payments/vnpay/callback", method: "GET" },

  // Assets
  { path: "/assets/:something", method: "GET" },
];

export default publicRoutes;
