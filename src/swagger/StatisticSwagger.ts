/**
 * @swagger
 * /api/statistics/revenue:
 *   get:
 *     tags: [Statistics]
 *     summary: Get revenue statistics(Admin)
 *     description: Retrieve revenue statistics based on time, unit, and value.>
 *          `DAY` and  `WEEK` will get the current date/week revenue based on receipts. <br> <br>
 *          Only `MONTH` and `YEAR` use value query, if not provided then it'll get current month/year. <br> <br>
 *          `MONTH`'s value is 1-12. <br> <br>
 *          `YEAR`'s max value is current year.
 *     parameters:
 *       - name: time
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           enum: ["DAY", "WEEK", "MONTH", "YEAR"]
 *       - name: unit
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           enum: ["VND", "USD"]
 *       - name: value
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *         description: The value for the specified time unit
 *     responses:
 *       200:
 *         description: Successful response with revenue data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Revenue:
 *                   type: number
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request due to invalid parameters
 *       401:
 *         description: Unauthorized - user is not authenticated
 *       403:
 *         description: Forbidden - user does not have necessary permissions
 *       500:
 *         description: Internal server error
 */
