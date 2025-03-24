/**
 * @swagger
 * tags:
 *   name: Membership Packages
 *   description: API for managing membership packages
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/membership-packages/:
 *   post:
 *     summary: Create a new membership package(Admin)
 *     description: Admins  can create a membership package.
 *     tags: [Membership Packages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - duration
 *               - unit
 *               - postLimit
 *               - updateChildDataLimit
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Gold Membership"
 *               description:
 *                 type: string
 *                 example: "Access to premium features"
 *               price:
 *                 type: number
 *                 example: 499.99
 *               unit:
 *                 type: string
 *                 example: "VND"
 *               duration:
 *                 type: integer
 *                 example: 30
 *               postLimit:
 *                 type: integer
 *                 example: 10
 *               updateChildDataLimit:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       201:
 *         description: Membership package created successfully
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /api/membership-packages/{id}:
 *   get:
 *     summary: Get a specific membership package
 *     description: Retrieve details of a membership package by ID.
 *     tags: [Membership Packages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Get membership package successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 package:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "67b1f25e8baf3dab53b92a28"
 *                     name:
 *                       type: string
 *                       example: "Gold Membership"
 *                     description:
 *                       type: string
 *                       example: "Access to premium features"
 *                     price:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: number
 *                           example: 100
 *                         unit:
 *                           type: string
 *                           example: "USD"
 *                     convertedPrice:
 *                       type: number
 *                       example: 2500000
 *                     duration:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: integer
 *                           example: 30
 *                         unit:
 *                           type: string
 *                           example: "DAY"
 *                     postLimit:
 *                       type: integer
 *                       example: 10
 *                     updateChildDataLimit:
 *                       type: integer
 *                       example: 5
 *                     isDeleted:
 *                       type: boolean
 *                       example: false
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-02-16T14:12:46.466Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-02-16T14:12:46.466Z"
 *       404:
 *         description: Package not found
 */

/**
 * @swagger
 * /api/membership-packages/:
 *   get:
 *     summary: Get all membership packages
 *     description: Retrieve a paginated list of membership packages with optional filtering and sorting.
 *     tags: [Membership Packages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number to retrieve.
 *         example: 1
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page.
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keyword for filtering membership packages by name.
 *         example: "Gold Membership"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date, name, price]
 *           default: date
 *         description: Sort field for results.
 *         example: price
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ascending, descending]
 *           default: descending
 *         description: Sort order (ascending or descending).
 *         example: ascending
 *     responses:
 *       200:
 *         description: Get membership packages successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 packages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "67b1f25e8baf3dab53b92a28"
 *                       name:
 *                         type: string
 *                         example: "Gold Membership"
 *                       description:
 *                         type: string
 *                         example: "Access to premium features"
 *                       price:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: number
 *                             example: 100
 *                           unit:
 *                             type: string
 *                             example: "USD"
 *                       convertedPrice:
 *                         type: number
 *                         example: 2500000
 *                       duration:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: integer
 *                             example: 30
 *                           unit:
 *                             type: string
 *                             example: "DAY"
 *                       postLimit:
 *                         type: integer
 *                         example: 10
 *                       updateChildDataLimit:
 *                         type: integer
 *                         example: 5
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-02-16T14:12:46.466Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-02-16T14:12:46.466Z"
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPackages:
 *                   type: integer
 *                   example: 22
 *                 totalPages:
 *                   type: integer
 *                   example: 3
 *                 message:
 *                   type: string
 *                   example: "Get membership packages successfully"
 *       400:
 *         description: Bad request, invalid query parameters.
 *       404:
 *         description: No membership packages found.
 *       500:
 *         description: Internal Server Error.
 */

/**
 * @swagger
 * /api/membership-packages/{id}:
 *   delete:
 *     summary: Delete a membership package(Admin)
 *     description: Admins  can delete a membership package.
 *     tags: [Membership Packages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Membership package deleted successfully
 *       404:
 *         description: Package not found
 */
