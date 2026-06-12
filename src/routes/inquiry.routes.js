const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiry.controller');
const verifyJWT = require('../middleware/verifyJWT');
const authorizeRoles = require('../middleware/authorizeRoles');
const { validate } = require('../validations');
const { ROLES } = require('../constants');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');

// 5 submissions per IP per hour
const inquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many submissions. Please try again later.' },
});

const inquirySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().max(20).required(),
  country: Joi.string().max(100).optional().allow('', null),
  designation: Joi.string().max(100).optional().allow('', null),
  messengerType: Joi.string().valid('Meet', 'Teams', 'Google', 'Others').optional().allow(null),
  messengerId: Joi.string().max(200).optional().allow('', null),
  message: Joi.string().min(10).max(2000).required(),
});

// ── Public ────────────────────────────────────────────────────────────────────
router.post('/', inquiryLimiter, validate(inquirySchema), inquiryController.submitInquiry);

// ── SUPER_ADMIN only ──────────────────────────────────────────────────────────
router.use(verifyJWT, authorizeRoles(ROLES.SUPER_ADMIN));

router.get('/', inquiryController.getAllInquiries);
router.get('/:id', inquiryController.getInquiryById);
router.patch('/:id/read', inquiryController.markAsRead);
router.delete('/:id', inquiryController.deleteInquiry);

module.exports = router;
