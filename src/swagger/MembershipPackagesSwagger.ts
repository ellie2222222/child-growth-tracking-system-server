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
 *     summary: Create a new membership package
 *     description: Admins and Super Admins can create a membership package.
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
 *               - tier
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
 *                  type: integer
 *                  example: 30
 *               tier:
 *                 type: number
 *                 example: 2
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
 *       404:
 *         description: Package not found
 */

/**
 * @swagger
 * /api/membership-packages/:
 *   get:
 *     summary: Get all membership packages
 *     description: Retrieve a paginated list of membership packages.
 *     tags: [Membership Packages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         example: 1
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         example: 10
 *     responses:
 *       200:
 *         description: Get membership packages successfully
 */

/**
 * @swagger
 * /api/membership-packages/{id}:
 *   put:
 *     summary: Update an existing membership package
 *     description: Admins and Super Admins can update a membership package.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *                  type: integer
 *                  example: 30
 *               tier:
 *                 type: number
 *                 example: 2
 *     responses:
 *       200:
 *         description: Membership package updated successfully
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Package not found
 */

/**
 * @swagger
 * /api/membership-packages/{id}:
 *   delete:
 *     summary: Delete a membership package
 *     description: Admins and Super Admins can delete a membership package.
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
