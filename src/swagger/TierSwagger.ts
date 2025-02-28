/**
 * @swagger
 * /api/tiers:
 *   post:
 *     summary: Create a new tier
 *     description: >
 *       Only admin can create a new tier: `0`, `1`, or `2` <br> <br>
 *       If a tier's data already exist in database, creating new one will overwrite it <br> <br>
 *       The `value` works with `time` (in days) to define how often a user can perform an action within a set time frame based on their tier in higherTier(1,2). <br> <br>
 *       Ex: `tier`=1, `postsLimitValue` = 30, `postLimitTime`= 30: tier 1 user can create 30 posts in 30 days from their subscription's start date. <br> <br>
 *     tags: [Tiers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tier:
 *                 type: number
 *               postsLimitValue:
 *                 type: integer
 *               postLimitTime:
 *                 type: integer
 *               updateRecordsLimitValue:
 *                 type: integer
 *               updateRecordsLimitTime:
 *                 type: integer
 *               viewRecordsLimitValue:
 *                 type: integer
 *               viewRecordsLimitTime:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Tier created successfully
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/tiers/{id}:
 *   put:
 *     summary: Update a tier
 *     description: >
 *       Only admin can update a tier: `0`, `1`, or `2` <br> <br>
 *       The `value` works with `time` (in days) to define how often a user can perform an action within a set time frame based on their tier in higherTier(1,2). <br> <br>
 *       Ex: `tier`=1, `postsLimitValue` = 30, `postLimitTime`= 30: tier 1 user can create 30 posts in 30 days from their subscription's start date. <br> <br>
 *     tags: [Tiers]
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
 *               postsLimitValue:
 *                 type: integer
 *               postLimitTime:
 *                 type: integer
 *               updateRecordsLimitValue:
 *                 type: integer
 *               updateRecordsLimitTime:
 *                 type: integer
 *               viewRecordsLimitValue:
 *                 type: integer
 *               viewRecordsLimitTime:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Tier updated successfully
 */

/**
 * @swagger
 * /api/tiers:
 *   get:
 *     summary: Get a list of tiers
 *     tags: [Tiers]
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *         description: The page number to retrieve (default is 1).
 *       - name: size
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *         description: The number of items per page (default is 10).
 *       - name: search
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: The tier value to search for (use `0`, `1`, or `2` to filter by tier).
 *       - name: order
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [ascending, descending]
 *         description: The order in which to sort the results. Use `ascending` for ascending order or `descending` for descending order.
 *       - name: sortBy
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [date]
 *         description: The field to sort by. Currently, only `date` is supported.
 *     responses:
 *       200:
 *         description: Get tiers successfully
 */

/**
 * @swagger
 * /api/tiers/{id}:
 *   get:
 *     summary: Get a specific tier by ID
 *     tags: [Tiers]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Get tier data successfully
 */
