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
  { path: "/api/auth/send-reset-password-pin", method: "POST" },
  { path: "/api/auth/confirm-reset-password-pin", method: "POST" },
  { path: "/api/auth/reset-password", method: "PUT" },

  // User
  { path: "/api/users", method: "GET" },

  // Payment
  { path: "/api/payments/paypal/success", method: "GET" },
  { path: "/api/payments/paypal/failed", method: "GET" },
  { path: "/api/payments/vnpay/callback", method: "GET" },

  // Assets
  { path: "/assets/:something", method: "GET" },

  //Post
  { path: "/api/posts", method: "GET" },
  { path: "/api/posts/:id", method: "GET" },
  { path: "/api/posts/users/:id", method: "GET" },

  //Membership packages
  { path: "/api/membership-packages", method: "GET" },
  { path: "/api/membership-packages/:id", method: "GET" },

  //Comments
  { path: "/api/comments", method: "GET" },
  { path: "/api/comments/:id", method: "GET" },

  //tiers
  { path: "/api/tiers", method: "GET" },
  { path: "/api/tiers/:id", method: "GET" },
];

export default publicRoutes;
