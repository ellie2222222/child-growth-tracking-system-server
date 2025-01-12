/***
 * NOTE: put all the static routes before the dynamic routes
 */

interface PublicRoutes {
  path: string;
  method: string;
}

const publicRoutes: PublicRoutes[] = [
  // Auth
  { path: '/api/auth/login', method: 'POST' },
  { path: '/api/auth/signup', method: 'POST' },

  // User
  { path: '/api/users', method: 'GET' },
];

export default publicRoutes;
