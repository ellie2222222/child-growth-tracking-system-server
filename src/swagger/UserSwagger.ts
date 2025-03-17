/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get list of users
 *     description: Retrieves a list of users with optional pagination and filters. <br>
 *              `Admins` & `doctors` can view other `members` & `doctors`. <br>
 *              `Member` can only view `doctors`. <br>
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *         description: Number of users per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ascending, descending]
 *         description: Sorting order
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date]
 *         description: Sort users by date
 *     responses:
 *       200:
 *         description: Successfully retrieved users
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieves user details based on user ID. <br>
 *              `Admins` & `doctors` can view other `members` & `doctors`. <br>
 *              `Member` can only view `doctors`. <br>
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update user details
 *     description: Updates user details such as name, phone number, role, and avatar. Only accessible by authorized users.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to be updated
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Updated"
 *               phoneNumber:
 *                 type: string
 *                 example: "+1234567890"
 *               role:
 *                 type: integer
 *                 enum: [0, 1, 2]
 *                 description: "0 = User, 1 = Admin, 2 = Doctor"
 *                 example: 0
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user(Admin)
 *     description: Deletes a user by ID. Only accessible by admins .
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to be deleted
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/users/remove-membership/{id}:
 *   put:
 *     summary: Remove user membership
 *     description: Removes the current subscription or membership of a user.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user whose membership is to be removed
 *     responses:
 *       200:
 *         description: Membership removed successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/users/consultation/{id}/rating:
 *   post:
 *     summary: Create a consultation rating
 *     description: Allows a user to submit a rating for a consultation.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The consultation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 example: 5
 *     responses:
 *       200:
 *         description: Consultation rating has been created
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Internal server error
 *
 *   put:
 *     summary: Update a consultation rating
 *     description: Allows a user to update their rating for a consultation.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The consultation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 example: 4
 *     responses:
 *       200:
 *         description: Consultation rating has been updated
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Remove a consultation rating
 *     description: Allows a user to remove their rating for a consultation.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The consultation ID
 *     responses:
 *       200:
 *         description: Consultation rating has been removed
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Internal server error
 */
