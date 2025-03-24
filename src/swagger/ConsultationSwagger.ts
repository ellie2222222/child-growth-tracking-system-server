/**
 * @swagger
 * /api/consultations/status/{id}:
 *   put:
 *     summary: Update consultation status
 *     description: >
 *       Updates the status of a consultation. Only members and admins can perform this action.
 *     tags: [Consultations]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Ended]
 *                 description: The status of the consultation (only 'Ended' is allowed)
 *     responses:
 *       200:
 *         description: Consultation status updated successfully
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/consultations:
 *   get:
 *     summary: Get all consultations(Admin only)
 *     description: >
 *       Retrieves all consultations. Only admins can access this endpoint.
 *     tags: [Consultations]
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *         description: The page number (default is 1).
 *       - name: size
 *         in: query
 *         schema:
 *           type: integer
 *         description: Number of items per page (default is 10).
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *         description: Search term for consultations.
 *       - name: order
 *         in: query
 *         schema:
 *           type: string
 *           enum: [ascending, descending]
 *         description: Sorting order.
 *       - name: sortBy
 *         in: query
 *         schema:
 *           type: string
 *           enum: [date]
 *         description: Sorting field.
 *     responses:
 *       200:
 *         description: Retrieved consultations successfully
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/consultations/users/{id}:
 *   get:
 *     summary: Get consultations by user ID
 *     description: >
 *       Retrieves consultations associated with a specific user. Accessible to admins, doctors, and members.<br>
 *          `Admin` can get other. <br>
 *          `User` & `Doctor` can get `theirs`
 *     tags: [Consultations]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *         description: The page number (default is 1).
 *       - name: size
 *         in: query
 *         schema:
 *           type: integer
 *         description: Number of items per page (default is 10).
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *         description: Search term.
 *       - name: order
 *         in: query
 *         schema:
 *           type: string
 *           enum: [ascending, descending]
 *         description: Sorting order.
 *       - name: sortBy
 *         in: query
 *         schema:
 *           type: string
 *           enum: [date]
 *         description: Sorting field.
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter consultations by status.
 *       - name: as
 *         in: query
 *         schema:
 *           type: string
 *           enum: [MEMBER, DOCTOR]
 *         description: Role of the requester.
 *     responses:
 *       200:
 *         description: Retrieved consultations successfully
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/consultations/{id}:
 *   get:
 *     summary: Get consultation by ID
 *     description: Retrieves a specific consultation. Accessible to admins, doctors, and members.<br>
 *          `Admin` can get other. <br>
 *          `User` & `Doctor` can get `theirs`
 *     tags: [Consultations]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Consultation retrieved successfully
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/consultations/{id}:
 *   delete:
 *     summary: Delete a consultation
 *     description: Deletes a consultation. Only members, admins can perform this action.
 *     tags: [Consultations]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Consultation deleted successfully
 *       500:
 *         description: Internal Server Error
 */
