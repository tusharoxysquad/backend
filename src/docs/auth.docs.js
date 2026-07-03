/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login
 *     description: >
 *       Authenticate with email and password. Returns a JWT token on success.
 *       If the account's email is not yet verified, returns 403 instead of a token,
 *       and automatically sends a fresh OTP to the account's email — use
 *       POST /api/v1/auth/verify-otp to complete verification and obtain a token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginBody'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Email not verified — a fresh OTP was just emailed to the account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/v1/auth/verify-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Verify OTP
 *     description: >
 *       Verifies the 6-digit OTP emailed to a newly created (or not-yet-verified) account.
 *       On success, marks the account verified and returns a JWT token — equivalent to
 *       a successful login, no separate login call needed afterward.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOtpBody'
 *     responses:
 *       200:
 *         description: Email verified — token issued
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *
 * /api/v1/auth/resend-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Resend OTP
 *     description: Issues and emails a fresh OTP to a not-yet-verified account. Rate-limited to 10 requests per 15 minutes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResendOtpBody'
 *     responses:
 *       200:
 *         description: OTP resent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *
 * /api/v1/auth/setup-super-admin:
 *   post:
 *     tags: [Auth]
 *     summary: Setup Super Admin (one-time)
 *     description: >
 *       Creates the first Super Admin. Blocked internally if one already exists.
 *       Does NOT return a token — an OTP is emailed to the account, which must be
 *       verified via POST /api/v1/auth/verify-otp before the account can log in.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserBody'
 *     responses:
 *       201:
 *         description: Super Admin created — OTP emailed, verification required before login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *
 * /api/v1/auth/create-admin:
 *   post:
 *     tags: [Auth]
 *     summary: Create Admin
 *     description: >
 *       Super Admin creates a new Admin user. Does NOT return a token — an OTP is
 *       emailed to the new account, which must be verified via
 *       POST /api/v1/auth/verify-otp before that account can log in.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserBody'
 *     responses:
 *       201:
 *         description: Admin created — OTP emailed, verification required before login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *
 * /api/v1/auth/create-employee:
 *   post:
 *     tags: [Auth]
 *     summary: Create Employee
 *     description: >
 *       Super Admin or Admin creates a new Employee. Does NOT return a token — an OTP is
 *       emailed to the new account, which must be verified via
 *       POST /api/v1/auth/verify-otp before that account can log in.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserBody'
 *     responses:
 *       201:
 *         description: Employee created — OTP emailed, verification required before login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /api/v1/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /api/v1/auth/change-password:
 *   patch:
 *     tags: [Auth]
 *     summary: Change password
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordBody'
 *     responses:
 *       200:
 *         description: Password changed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
