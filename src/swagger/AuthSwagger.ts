/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: User Login
 *     description: Login a user using email and password. Returns a message and an accessToken in the response body. A refresh token is also set in the cookie.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Success
 *         headers:
 *           Set-Cookie:
 *             description: Refresh token cookie.
 *             schema:
 *               type: string
 *               example: "refreshToken=abcd1234; HttpOnly; Secure; Path=/"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Success"
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Invalid credentials or bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid email or password"
 */

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     tags: [Auth]
 *     summary: User Signup
 *     description: Register a new user with name, email, and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       201:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Success"
 *       400:
 *         description: Signup failed due to invalid input or duplicate email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Signup failed: Email already exists"
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get User Info
 *     description: Retrieve user information based on the access token stored in cookies.
 *     responses:
 *       200:
 *         description: Successfully retrieved user information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Success"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60f7d5d84f1a2c001c8b4567"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     role:
 *                       type: string
 *                       example: "user"
 *       401:
 *         description: Unauthorized - Token is missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Authorization token required"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: User Logout
 *     description: Log out a user, handle session deletion on the server.
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Success"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 */

/**
 * @swagger
 * /api/auth/google:
 *  get:
 *     tags: [Auth]
 *     summary: Google Login
 *     description: Redirects user to Google login. The URL for this endpoint is the backend URL followed by `/api/auth/google`.
 *     responses:
 *       302:
 *         description: Redirects to Google OAuth
 */

/**
 * @swagger
 * /api/auth/renew-access-token:
 *   post:
 *     tags: [Auth]
 *     summary: Renew Access Token
 *     description: Refreshes the access token using the refresh token.
 *     responses:
 *       200:
 *         description: New access token generated
 *       401:
 *         description: Unauthorized, invalid or expired refresh token
 */

/**
 * @swagger
 * /api/auth/send-reset-password-pin:
 *   post:
 *     tags: [Auth]
 *     summary: Send Reset Password PIN
 *     description: Sends a reset password PIN to the user's email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "exmaple@gmail.com"
 *     responses:
 *       200:
 *         description: PIN sent successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/auth/confirm-reset-password-pin:
 *   post:
 *     tags: [Auth]
 *     summary: Confirm Reset Password PIN
 *     description: Confirms the reset password PIN.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pin:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: PIN confirmed successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/auth/reset-password:
 *   put:
 *     tags: [Auth]
 *     summary: Reset Password
 *     description: Resets a user's password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *                 example: "newSecurePassword123"
 *     responses:
 *       200:
 *         description: Password reset successful
 *       401:
 *         description: Unauthorized
 */ 

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     tags: [Auth]
 *     summary: Change Password
 *     description: Allows a user to change their password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: "oldPassword123"
 *               newPassword:
 *                 type: string
 *                 example: "newSecurePassword123"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/auth/confirm-email-verification-token:
 *   post:
 *     tags: [Auth]
 *     summary: Confirm Email Verification Token
 *     description: Confirms the email verification token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "verification-token"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired verification token
 */