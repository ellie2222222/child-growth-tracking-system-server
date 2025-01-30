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

  { path: "/", method: "GET" },
  { path: "/api/auth/google", method: "GET" },
  { path: "/api/auth/google/redirect", method: "GET" },
  // User
  { path: "/api/users", method: "GET" },

  // Payment
  { path: "/api/payment/paypal/success", method: "GET" },
  { path: "/api/payment/paypal/failed", method: "GET" },

  //Assets
  { path: "/assets/*", method: "GET" },
];

export default publicRoutes;
