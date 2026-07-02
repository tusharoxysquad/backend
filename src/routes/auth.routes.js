const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const verifyJWT = require('../middleware/verifyJWT');
const authorizeRoles = require('../middleware/authorizeRoles');
const { ROLES } = require('../constants');
const {
  validate,
  loginSchema,
  changePasswordSchema,
  setupSuperAdminSchema,
  createAdminSchema,
  createEmployeeSchema,
  verifyOtpSchema,
  resendOtpSchema,
} = require('../validations');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter');

// ─── Public ───────────────────────────────────────────────────────────────────
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/verify-otp', otpLimiter, validate(verifyOtpSchema), authController.verifyOtp);
router.post('/resend-otp', otpLimiter, validate(resendOtpSchema), authController.resendOtp);

// ─── One-time setup (no auth — blocked internally if SUPER_ADMIN exists) ──────
router.post('/setup-super-admin', validate(setupSuperAdminSchema), authController.setupSuperAdmin);

// ─── Protected ────────────────────────────────────────────────────────────────
router.post(
  '/create-admin',
  verifyJWT,
  authorizeRoles(ROLES.SUPER_ADMIN),
  validate(createAdminSchema),
  authController.createAdmin
);

router.post(
  '/create-employee',
  verifyJWT,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  validate(createEmployeeSchema),
  authController.createEmployee
);

router.post('/logout', verifyJWT, authController.logout);
router.get('/me', verifyJWT, authController.getMe);
router.patch('/change-password', verifyJWT, validate(changePasswordSchema), authController.changePassword);

module.exports = router;
