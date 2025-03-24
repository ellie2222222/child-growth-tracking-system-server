/**
 * @swagger
 * /api/payments/paypal/create:
 *   post:
 *     summary: Create a PayPal payment
 *     description: >
 *       Initiates a PayPal payment for a specific package. <br> <br>
 *       The currency for PayPal is in `USD`.<br> <br>
 *       If the package price is in `VND`, please **divide** the price by `25000 (25,000)`. <br> <br>
 *       Example: `price = 3750000` (in VND) -> `price = 150` (in USD). <br> <br>
 *       Sandbox account: `sb-z0buh33888275@personal.example.com` , Sandbox password: `"m!.0N%D`.
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               price:
 *                 type: number
 *                 description: >
 *                   The price of the package in **USD** (PayPal's default currency).
 *                   If the package unit is **VND**, convert it to USD by dividing the price by **25,000**.
 *               packageId:
 *                 type: string
 *                 description: The ID of the package being purchased
 *               purchaseType:
 *                 type: string
 *                 enum: [CURRENT, FUTURE]
 *                 description: Specifies whether the purchase is for current or future use.
 *     responses:
 *       201:
 *         description: Payment created successfully
 *       400:
 *         description: Bad request (missing parameters)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/payments/vnpay/create:
 *   post:
 *     summary: Create a VNPay payment
 *     description: >
 *       Initiates a VNPay payment for a specific package.<br> <br>
 *       The currency for VNPay is in `VND`.<br> <br>
 *       If the package price is in `USD`, please **multiply** the price by `25000(25,000)`.<br> <br>
 *       Example: `price = 150` (in USD) -> `price = 3750000` (in VND). <br> <br>
 *       Sandbox account can be found here: `https://sandbox.vnpayment.vn/apis/vnpay-demo/`.
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               price:
 *                 type: number
 *                 description: >
 *                   The price of the package in **VND** (VNPay's default currency).
 *                   If the package unit is **USD**, convert it to VND by multiplying the price by **25,000**.
 *               packageId:
 *                 type: string
 *                 description: The ID of the package being purchased
 *               purchaseType:
 *                 type: string
 *                 enum: [CURRENT, FUTURE]
 *                 description: Specifies whether the purchase is for current or future use.
 *     responses:
 *       201:
 *         description: Payment created successfully
 *       400:
 *         description: Bad request (missing parameters)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
