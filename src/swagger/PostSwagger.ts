/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: API for managing Posts
 */

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     description: Allows authenticated users (ADMIN, MEMBER) to create a blog post with optional attachments and a thumbnail.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the post
 *               content:
 *                 type: string
 *                 description: Content of the post in html format
 *               postAttachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array of file attachments
 *               postThumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Thumbnail image for the post (only one allowed)
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Post:
 *                   type: object
 *                   description: The created post details
 *                 message:
 *                   type: string
 *                   example: Post created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get paginated list of posts
 *     description: Retrieve a paginated list of posts with optional search and sorting parameters.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of posts per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query for filtering posts by title
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date]
 *         description: Field to sort posts by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ascending, descending]
 *         description: Sorting order
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PUBLISHED, REJECTED, DELETED]
 *         description: Only admins can select status
 *     responses:
 *       200:
 *         description: List of posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Post details
 *                 total:
 *                   type: integer
 *                   description: Total number of posts
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/posts/by-userId:
 *   get:
 *     summary: Get posts by a specific user
 *     description: Retrieve a paginated list of posts created by a specific user.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of posts per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query for filtering posts by title
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date]
 *         description: Field to sort posts by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ascending, descending]
 *         description: Sorting order
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose posts are being retrieved
 *     responses:
 *       200:
 *         description: List of posts retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get a single post by ID
 *     description: Retrieve details of a specific post using its unique ID.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the post to retrieve
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 post:
 *                   type: object
 *                   description: The post details
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Create a new post
 *     description: Allows authenticated users (ADMIN, MEMBER) to create a blog post with optional attachments and a thumbnail.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the post to retrieve
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the post
 *               content:
 *                 type: string
 *                 description: Content of the post in html format
 *               postAttachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array of file attachments
 *               postThumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Thumbnail image for the post (only one allowed)
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Post:
 *                   type: object
 *                   description: The created post details
 *                 message:
 *                   type: string
 *                   example: Post created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a single post by ID
 *     description: Delete a specific post using its unique ID.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the post to delete
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/posts/post-status/{id}:
 *   put:
 *     summary: Update post status
 *     description: Allows authenticated users (ADMIN, MEMBER) to update the status of a post.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the post to update
 *       - in: query
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PENDING, PUBLISHED, REJECTED, DELETED]
 *         description: Status of the post (must be one of PENDING, PUBLISHED, REJECTED, DELETED)
 *     responses:
 *       200:
 *         description: Post status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Post status updated successfully
 *       400:
 *         description: Bad request (invalid status or missing parameters)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
