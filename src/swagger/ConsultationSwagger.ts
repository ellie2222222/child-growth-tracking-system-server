/**
 * @swagger
 * /api/consultations/status/{id}:
 *   put:
 *     summary: Update consultation status
 *     description: >
 *       Updates the status of a consultation. Only members, admins, and super admins can perform this action.
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Consultation status updated successfully
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/consultations:
 *   get:
 *     summary: Get all consultations
 *     description: >
 *       Retrieves all consultations. Only admins and super admins can access this endpoint.
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
 *       Retrieves consultations associated with a specific user. Accessible to admins, super admins, doctors, and members.
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
 *     description: Retrieves a specific consultation. Accessible to admins, super admins, doctors, and members.
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
 *     description: Deletes a consultation. Only members, admins, and super admins can perform this action.
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
