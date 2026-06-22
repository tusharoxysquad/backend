const express = require('express');
const router = express.Router();
const multer = require('multer');
const inquiryController = require('../controllers/inquiry.controller');
const verifyJWT = require('../middleware/verifyJWT');
const authorizeRoles = require('../middleware/authorizeRoles');
const { validate } = require('../validations');
const { ROLES } = require('../constants');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
const ApiError = require('../utils/apiError');

// ── Rate limiter ──────────────────────────────────────────────────────────────
const inquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many submissions. Please try again later.' },
});

// ── Document upload (memory storage — sent to Cloudinary) ─────────────────────
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(ApiError.badRequest('Only PDF, DOC, DOCX, PPT, PPTX files are allowed'), false);
    }
    cb(null, true);
  },
}).single('document');

// Wrap multer to convert errors to ApiError
const handleDocumentUpload = (req, res, next) => {
  documentUpload(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') return next(ApiError.badRequest('File size cannot exceed 20 MB'));
    next(err);
  });
};

// ── Validation schema ─────────────────────────────────────────────────────────
const SERVICE_OPTIONS = [
  'AI & Automation', 'Custom Software Development', 'Web Development',
  'Mobile App Development', 'Data Analytics & BI', 'Cloud & DevOps',
  'Digital Transformation', 'UI/UX Design', 'Dedicated Development Team', 'Other',
];

const TIMELINE_OPTIONS = [
  'Immediate', 'Within 1 Month', 'Within 3 Months', 'Within 6 Months', 'Exploring Options',
];

const REQUIREMENT_OPTIONS = [
  'New Product Development', 'Existing Product Enhancement', 'Dedicated Team Hiring',
  'AI Implementation', 'Digital Transformation', 'Support & Maintenance', 'Not Sure Yet',
];

const inquirySchema = Joi.object({
  // Contact
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().max(20).required(),
  designation: Joi.string().max(100).optional().allow('', null),

  // Company
  companyName: Joi.string().max(150).required(),
  companyWebsite: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .optional()
    .allow('', null),

  // Service
  serviceInterestedIn: Joi.string().valid(...SERVICE_OPTIONS).required(),
  serviceInterestedOther: Joi.when('serviceInterestedIn', {
    is: 'Other',
    then: Joi.string().max(200).required().messages({ 'any.required': 'Please specify the service you are interested in' }),
    otherwise: Joi.string().max(200).optional().allow('', null),
  }),

  // Project
  projectTimeline: Joi.string().valid(...TIMELINE_OPTIONS).required(),
  requirementType: Joi.string().valid(...REQUIREMENT_OPTIONS).required(),
  requirementTypeOther: Joi.string().max(200).optional().allow('', null),
  projectDescription: Joi.string().max(3000).required(),

  // Discovery
  heardAboutUs: Joi.string().max(100).optional().allow('', null),
  heardAboutUsOther: Joi.when('heardAboutUs', {
    is: 'Other',
    then: Joi.string().max(200).required().messages({ 'any.required': 'Please specify how you heard about us' }),
    otherwise: Joi.string().max(200).optional().allow('', null),
  }),

  // Consent
  agreeToContact: Joi.boolean().valid(true).required().messages({
    'any.only': 'You must agree to be contacted',
    'any.required': 'You must agree to be contacted',
  }),
});

// ── Routes ────────────────────────────────────────────────────────────────────

// Public — submit inquiry with optional document
router.post(
  '/',
  inquiryLimiter,
  handleDocumentUpload,
  validate(inquirySchema),
  inquiryController.submitInquiry
);

// Super Admin only
router.use(verifyJWT, authorizeRoles(ROLES.SUPER_ADMIN));

router.get('/', inquiryController.getAllInquiries);
router.get('/:id', inquiryController.getInquiryById);
router.patch('/:id/read', inquiryController.markAsRead);
router.delete('/:id', inquiryController.deleteInquiry);

module.exports = router;
