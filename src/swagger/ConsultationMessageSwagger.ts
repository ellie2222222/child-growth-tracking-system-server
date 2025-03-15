/**
 * @swagger
 * /api/consultation-messages:
 *   post:
 *     summary: Create a consultation message
 *     description: >
 *       Creates a new consultation message. Only doctors and members can perform this action.
 *     tags: [Consultation Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               consultationId:
 *                 type: string
 *               message:
 *                 type: string
 *               messageAttachements:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Consultation message created successfully
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/consultation-messages/consultations/{id}:
 *   get:
 *     summary: Get consultation messages by consultation ID
 *     description: >
 *       Retrieves all messages associated with a specific consultation. Accessible to admins, doctors, and members.
 *     tags: [Consultation Messages]
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
 *     responses:
 *       200:
 *         description: Retrieved consultation messages successfully
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/consultation-messages/{id}:
 *   get:
 *     summary: Get a consultation message by ID
 *     description: Retrieves a specific consultation message. Accessible to admins, doctors, and members.<br> `Admin` can get other. <br>
 *          `User` & `Doctor` can get `theirs`
 *     tags: [Consultation Messages]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Consultation message retrieved successfully
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/consultation-messages/{id}:
 *   put:
 *     summary: Update a consultation message
 *     description: >
 *       Updates a consultation message. Only doctors and members can perform this action.
 *     tags: [Consultation Messages]
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
 *               message:
 *                 type: string
 *               messageAttachements:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Consultation message updated successfully
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/consultation-messages/{id}:
 *   delete:
 *     summary: Delete a consultation message
 *     description: Deletes a consultation message. Only members and doctors can perform this action.
 *     tags: [Consultation Messages]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Consultation message deleted successfully
 *       500:
 *         description: Internal Server Error
 */
