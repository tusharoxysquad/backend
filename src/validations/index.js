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
};
