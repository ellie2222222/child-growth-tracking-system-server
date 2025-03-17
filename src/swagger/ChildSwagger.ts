/**
 * @swagger
 * /api/children:
 *   post:
 *     summary: Create a new child
 *     description: Create a new child with the provided details.
 *     tags:
 *       - Child
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the child (1-100 characters).
 *               gender:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Gender of the child (0 for Boy, 1 for Girl).
 *               birthDate:
 *                 type: string
 *                 format: date-time
 *                 description: Birth date of the child in ISO 8601 format.
 *               note:
 *                 type: string
 *                 description: Optional note about the child (max 500 characters).
 *               relationship:
 *                 type: string
 *                 enum: [Parent, Guardian, Sibling, Other]
 *                 description: Relationship of the user to the child.
 *               feedingType:
 *                 type: string
 *                 enum: [Breastfeeding, Formula, Mixed, SolidFood]
 *                 description: Feeding type of the child.
 *               allergies:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [None, N/A, Dairy, Nuts, Gluten, Eggs, Soy]
 *                 description: List of allergies (cannot include "None" or "N/A" with other allergies).
 *     responses:
 *       '200':
 *         description: Child created successfully.
 *       '400':
 *         description: Validation failed. Check the validationErrors for details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 validationErrors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       error:
 *                         type: string
 *   get:
 *     summary: Get all children for the authenticated user
 *     description: Retrieve a paginated list of children for the authenticated user.
 *     tags:
 *       - Child
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination (default is 1).
 *       - name: size
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Number of items per page (default is 10).
 *       - name: sortBy
 *         in: query
 *         schema:
 *           type: string
 *           enum: [date, name]
 *         description: Field to sort by (default is 'date').
 *       - name: order
 *         in: query
 *         schema:
 *           type: string
 *           enum: [ascending, descending]
 *         description: Sort order (default is 'descending').
 *     responses:
 *       '200':
 *         description: List of children retrieved successfully.
 *       '400':
 *         description: Invalid query parameters.
 *
 * /api/children/{childId}:
 *   put:
 *     summary: Update a child
 *     description: Update the details of a specific child.
 *     tags:
 *       - Child
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: childId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the child to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The updated name of the child (1-100 characters).
 *               gender:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Updated gender of the child (0 for Boy, 1 for Girl).
 *               birthDate:
 *                 type: string
 *                 format: date-time
 *                 description: Updated birth date of the child in ISO 8601 format.
 *               note:
 *                 type: string
 *                 description: Updated note about the child (max 500 characters).
 *     responses:
 *       '200':
 *         description: Child updated successfully.
 *       '400':
 *         description: Validation failed. Check the validationErrors for details.
 *
 *   delete:
 *     summary: Delete a child
 *     description: Delete a specific child by ID.
 *     tags:
 *       - Child
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: childId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the child to delete.
 *     responses:
 *       '200':
 *         description: Child deleted successfully.
 *       '400':
 *         description: Invalid child ID.
 *
 *   get:
 *     summary: Get a child by ID
 *     description: Retrieve details of a specific child by ID.
 *     tags:
 *       - Child
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: childId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the child to retrieve.
 *     responses:
 *       '200':
 *         description: Child details retrieved successfully.
 *       '400':
 *         description: Invalid child ID.
 *
 * /api/children/{childId}/growth-data:
 *   get:
 *     summary: Get growth data for a child
 *     description: Retrieve growth data for a specific child.
 *     tags:
 *       - Child
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: childId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the child to retrieve growth data for.
 *     responses:
 *       '200':
 *         description: Growth data retrieved successfully.
 *       '400':
 *         description: Invalid child ID.
 *
 *   post:
 *     summary: Add growth data for a child
 *     description: Add new growth data for a specific child.
 *     tags:
 *       - Child
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: childId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the child to add growth data for.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               height:
 *                 type: number
 *                 description: Height of the child in centimeters.
 *               weight:
 *                 type: number
 *                 description: Weight of the child in kilograms.
 *               inputDate:
 *                 type: string
 *                 format: date-time
 *                 description: Date of the growth data in ISO 8601 format.
 *     responses:
 *       '200':
 *         description: Growth data added successfully.
 *       '400':
 *         description: Validation failed. Check the validationErrors for details.
 *
 * /api/children/{childId}/growth-data/{growthDataId}:
 *   put:
 *     summary: Update growth data for a child
 *     description: Update specific growth data for a child.
 *     tags:
 *       - Child
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: childId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the child.
 *       - name: growthDataId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the growth data to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               height:
 *                 type: number
 *                 description: Updated height of the child in centimeters.
 *               weight:
 *                 type: number
 *                 description: Updated weight of the child in kilograms.
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Updated date of the growth data in ISO 8601 format.
 *     responses:
 *       '200':
 *         description: Growth data updated successfully.
 *       '400':
 *         description: Validation failed. Check the validationErrors for details.
 *   delete:
 *     summary: Delete growth data for a child
 *     description: Delete specific growth data for a child.
 *     tags:
 *       - Child
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: childId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the child.
 *       - name: growthDataId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the growth data to delete.
 *     responses:
 *       '200':
 *         description: Growth data deleted successfully.
 *       '400':
 *         description: Invalid growth data ID.
 *   get:
 *     summary: Get specific growth data for a child
 *     description: Retrieve specific growth data for a child by ID.
 *     tags:
 *       - Child
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: childId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the child.
 *       - name: growthDataId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the growth data to retrieve.
 *     responses:
 *       '200':
 *         description: Growth data retrieved successfully.
 *       '400':
 *         description: Invalid growth data ID.
 */

/**
 * @swagger
 * /api/children/{childId}/growth-velocity:
 *   get:
 *     summary: Get growth velocity for a child
 *     description: Retrieve growth velocity data for a specific child.
 *     tags:
 *       - Child
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: childId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the child to retrieve growth velocity for.
 *     responses:
 *       '200':
 *         description: Growth velocity data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 growthVelocity:
 *                   type: object
 *       '400':
 *         description: Invalid child ID.

 * /api/children/growth-data/public:
 *   post:
 *     summary: Generate growth data publicly
 *     description: Generate growth data analysis without authentication. <br>
 *          This method does not required authentication, does not child's data into the system
 *     tags:
 *       - Child
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inputDate:
 *                 type: string
 *                 format: date-time
 *                 description: Date of the measurement.
 *               height:
 *                 type: number
 *                 description: Height in centimeters.
 *               weight:
 *                 type: number
 *                 description: Weight in kilograms.
 *               birthDate:
 *                 type: string
 *                 format: date-time
 *                 description: Child's birth date.
 *               gender:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: 0 for Male, 1 for Female.
 *     responses:
 *       '200':
 *         description: Growth analysis generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: object
 *                 message:
 *                   type: string
 *       '400':
 *         description: Invalid input parameters.
 */
