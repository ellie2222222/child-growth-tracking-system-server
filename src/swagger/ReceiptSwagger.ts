/**
 * @swagger
 * /api/receipts/:
 *   get:
 *     tags: [Receipts]
 *     summary: Get all receipts (Admin only)
 *     description: Returns paginated list of all receipts. Requires admin privileges.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ascending, descending]
 *           default: ascending
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date]
 *           default: date
 *     responses:
 *       200:
 *         description: Successful operation
 *       404:
 *         description: No receipt found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/receipts/users/{userId}:
 *   get:
 *     tags: [Receipts]
 *     summary: Get receipts by user ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ascending, descending]
 *           default: ascending
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date]
 *           default: date
 *     responses:
 *       200:
 *         description: Successful operation
 *       404:
 *         description: No receipt found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/receipts/{id}:
 *   get:
 *     tags: [Receipts]
 *     summary: Get receipt by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReceiptResponse'
 */