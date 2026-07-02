const Joi = require('joi');
const { ROLES, LEAVE_TYPE, LEAVE_SESSION } = require('../constants');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const messages = error.details.map((d) => d.message);
    return res.status(400).json({ success: false, message: 'Validation failed', errors: messages });
  }
  next();
};

// Parses JSON-stringified fields sent via multipart/form-data into their proper JS types.
// Must be used BEFORE validate() on routes that use multer.
const parseJsonFields = (...fields) => (req, res, next) => {
  fields.forEach((field) => {
    const val = req.body[field];
    if (typeof val === 'string') {
      try { req.body[field] = JSON.parse(val); } catch (_) { /* leave as-is, Joi will catch it */ }
    }
  });
  next();
};

// Strong password: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const strongPassword = Joi.string()
  .min(8)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/)
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters',
    'string.pattern.base':
      'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character',
  });

// Auth
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(6).required(),
  newPassword: strongPassword,
});

// Signup schemas
const setupSuperAdminSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: strongPassword,
  department: Joi.string().max(100).optional().allow('', null),
  designation: Joi.string().max(100).optional().allow('', null),
});

const createAdminSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: strongPassword,
  department: Joi.string().max(100).optional().allow('', null),
  designation: Joi.string().max(100).optional().allow('', null),
});

const createEmployeeSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: strongPassword,
  department: Joi.string().max(100).optional().allow('', null),
  designation: Joi.string().max(100).optional().allow('', null),
  reportingAdmin: Joi.string().optional().allow('', null),
});

// User management (super-admin panel — no role in body, role forced in controller)
const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: strongPassword,
  role: Joi.string().valid(...Object.values(ROLES)).required(),
  department: Joi.string().max(100).optional().allow('', null),
  designation: Joi.string().max(100).optional().allow('', null),
  reportingAdmin: Joi.string().optional().allow('', null),
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  department: Joi.string().max(100).optional().allow('', null),
  designation: Joi.string().max(100).optional().allow('', null),
  reportingAdmin: Joi.string().optional().allow('', null),
});

const resetPasswordSchema = Joi.object({
  newPassword: strongPassword,
});

// Leave
const applyLeaveSchema = Joi.object({
  leaveType: Joi.string().valid(...Object.values(LEAVE_TYPE)).required(),
  session: Joi.string().valid(...Object.values(LEAVE_SESSION)).required(),
  fromDate: Joi.date().iso().required(),
  toDate: Joi.date().iso().min(Joi.ref('fromDate')).required(),
  reason: Joi.string().min(5).max(500).required(),
});

const rejectSchema = Joi.object({
  rejectionReason: Joi.string().min(3).max(300).required(),
});

// Attendance rejection
const attendanceRejectSchema = Joi.object({
  rejectionReason: Joi.string().min(3).max(300).required(),
});

// Overtime
const overtimeRequestSchema = Joi.object({
  reason: Joi.string().min(5).max(500).required(),
  date: Joi.string().isoDate().optional(),
});

const overtimeRejectSchema = Joi.object({
  rejectionReason: Joi.string().min(3).max(300).required(),
});

// Insights
const createInsightSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  category: Joi.string().min(2).max(100).required(),
  industry: Joi.string().min(2).max(100).required(),
  summary: Joi.string().min(10).max(2000).required(),
  sections: Joi.array().optional(),
  future_predictions: Joi.array().items(Joi.string()).optional(),
  recommendations: Joi.array().items(Joi.string()).optional(),
  key_takeaways: Joi.array().items(Joi.string()).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  author: Joi.string().max(100).optional().allow('', null),
  publication_date: Joi.date().iso().optional().allow(null),
  target_audience: Joi.array().items(Joi.string()).optional(),
  priority_level: Joi.string().valid('High', 'Medium', 'Low').optional(),
  strategic_impact: Joi.string().valid('High', 'Medium', 'Low').optional(),
});

const updateInsightSchema = createInsightSchema.fork(
  ['title', 'category', 'industry', 'summary'],
  (f) => f.optional()
);

// Blog
const blogSectionSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().optional().allow('', null),
  points: Joi.array().items(
    Joi.object({
      title: Joi.string().optional().allow('', null),
      description: Joi.string().required(),
    })
  ).optional(),
});

const blogBodySchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  meta: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    keywords: Joi.array().items(Joi.string()).optional(),
  }).required(),
  category: Joi.string().optional().allow('', null),
  tags: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
  readTime: Joi.string().optional().allow('', null),
  status: Joi.string().valid('draft', 'published').optional(),
  sections: Joi.array().items(blogSectionSchema).optional(),
  thumbnailUrl: Joi.string().uri().optional().allow('', null),
});

const updateBlogSchema = blogBodySchema.fork(['title', 'meta'], (f) => f.optional());

// Our Work
const ourWorkBodySchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  introduction: Joi.string().optional().allow('', null),
  challenge: Joi.string().optional().allow('', null),
  solution: Joi.string().optional().allow('', null),
  technologyStack: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
  bannerImageUrl: Joi.string().uri().optional().allow('', null),
});

const updateOurWorkSchema = ourWorkBodySchema.fork(['title'], (f) => f.optional());

// Case Studies
const caseStudyBodySchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  clientName: Joi.string().max(150).optional().allow('', null),
  industry: Joi.string().max(100).optional().allow('', null),
  year: Joi.string().max(4).optional().allow('', null),
  status: Joi.string().valid('draft', 'published', 'archived').optional(),
  hero: Joi.object().optional(),
  overview: Joi.object().optional(),
  brief: Joi.object().optional(),
  challenge: Joi.object().optional(),
  solution: Joi.object().optional(),
  technologyStack: Joi.array().optional(),
  features: Joi.array().optional(),
  results: Joi.array().optional(),
  testimonials: Joi.array().optional(),
  // URL-based image helpers (optional)
  bannerImageUrl: Joi.string().uri().optional().allow('', null),
  galleryUrls: Joi.alternatives().try(Joi.array().items(Joi.string().uri()), Joi.string()).optional(),
  figmaScreenUrls: Joi.alternatives().try(Joi.array().items(Joi.string().uri()), Joi.string()).optional(),
});

const updateCaseStudySchema = caseStudyBodySchema.fork(['title'], (f) => f.optional());

module.exports = {
  validate,
  loginSchema,
  changePasswordSchema,
  setupSuperAdminSchema,
  createAdminSchema,
  createEmployeeSchema,
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
  applyLeaveSchema,
  rejectSchema,
  attendanceRejectSchema,
  overtimeRequestSchema,
  overtimeRejectSchema,
  createInsightSchema,
  updateInsightSchema,
  blogBodySchema,
  updateBlogSchema,
  ourWorkBodySchema,
  updateOurWorkSchema,
  caseStudyBodySchema,
  updateCaseStudySchema,
  parseJsonFields,
};
