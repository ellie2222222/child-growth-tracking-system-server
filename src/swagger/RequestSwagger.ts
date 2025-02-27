/**
 * @swagger
 * /api/requests/status/{id}:
 *   put:
 *     summary: Update request status
 *     tags: [Requests]
 *     description: Allows doctors and members to update request status.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Request ID
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
 *                 enum: [Pending, Accepted, Rejected, Canceled]
 *                 description: The new status of the request
 *     responses:
 *       200:
 *         description: Request status updated successfully
 */

/**
 * @swagger
 * /api/requests:
 *   post:
 *     summary: Create a new request
 *     tags: [Requests]
 *     description: Allows members to create a new request.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               childIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs of the children
 *               doctorId:
 *                 type: string
 *                 description: ID of the doctor
 *               title:
 *                 type: string
 *                 description: Title of the request
 *     responses:
 *       201:
 *         description: Request created successfully
 */

/**
 * @swagger
 * /api/requests/{id}:
 *   delete:
 *     summary: Delete a request
 *     tags: [Requests]
 *     description: Allows members to delete their requests.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Request ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request deleted successfully
 */

/**
 * @swagger
 * /api/requests:
 *   get:
 *     summary: Get all requests
 *     tags: [Requests]
 *     description: Allows admin and super admin to retrieve all requests.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keyword
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ascending, descending]
 *           default: ascending
 *         description: Order of results
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: date
 *           enum: [date]
 *         description: Field to sort by
 *     responses:
 *       200:
 *         description: Requests retrieved successfully
 */

/**
 * @swagger
 * /api/requests/users/{id}:
 *   get:
 *     summary: Get requests by user ID
 *     tags: [Requests]
 *     description: Allows various roles to get requests associated with a specific user.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keyword
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ascending, descending]
 *           default: ascending
 *         description: Order of results
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: date
 *           enum: [date]
 *         description: Field to sort by
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Accepted, Rejected, Canceled]
 *         description: Filter by request status
 *     responses:
 *       200:
 *         description: Requests retrieved successfully
 */

/**
 * @swagger
 * /api/requests/{id}:
 *   get:
 *     summary: Get a request by ID
 *     tags: [Requests]
 *     description: Allows authorized users to retrieve a specific request.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Request ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request retrieved successfully
 */
