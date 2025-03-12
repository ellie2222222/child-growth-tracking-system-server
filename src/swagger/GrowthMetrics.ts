/**
 * @swagger
 * /api/growth-metrics/upload:
 *   post:
 *     summary: Upload a growth metrics file
 *     description: |
 *       Validates the uploaded growth metrics file and ensures that the required fields are present in the uploaded Excel file.
 *       
 *       **Required Fields in the Excel File:**
 *       - `gender`: Must be either `0` (Boy) or `1` (Girl).
 *       - `L`: Must be a valid floating-point number.
 *       - `M`: Must be a valid floating-point number.
 *       - `S`: Must be a valid floating-point number.
 *       - `P values (P01, P1, P3, etc.)`: Must be valid floating-point numbers.
 *       
 *       **Additional Required Fields Based on Metric Type:**
 *       - **For HCFA, ACFA, BFA, WFA, LHFA Metrics**:
 *         - Must have either `ageInDays` or `ageInMonths` as a positive integer.
 *       - **For WFLH Metric**:
 *         - Must include a `height` field with a valid value.
 *       - **For WV, HV, HCV Metrics**:
 *         - Must include a `delta` field with a valid floating-point number.
 *     tags: [Growth Metrics]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               metric:
 *                 type: string
 *                 enum: [HCFA, ACFA, BFA, WFA, LHFA, WFLH, WV, HV, HCV]
 *                 description: Type of growth metric.
 *                 example: "WFA"
 *               excelFile:
 *                 type: string
 *                 format: binary
 *                 description: Excel file containing growth metrics data.
 *     responses:
 *       201:
 *         description: Successfully uploaded and processed the file.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Success"
 *                 result:
 *                   type: object
 *                 insertedCount:
 *                   type: integer
 *                   example: 10
 *                 updatedCount:
 *                   type: integer
 *                   example: 5
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Validation failed"
 *                 validationErrors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: "gender"
 *                       error:
 *                         type: string
 *                         example: "Expected gender field and value"
 *       401:
 *         description: Unauthorized access (JWT required)
 *       500:
 *         description: Internal server error
 */