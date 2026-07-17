const User = require('../models/User');
const { generateToken } = require('../config/jwt');
const ApiError = require('../utils/apiError');
const { ROLES } = require('../constants');
const { issueAndSendOtp, issueOtpOnly } = require('../helpers/otp.helper');
const { sendWelcomeEmail } = require('../helpers/email.helper');
const logger = require('../utils/logger');

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw ApiError.unauthorized('Invalid email or password');
  if (!user.isActive) throw ApiError.unauthorized('Account is deactivated. Contact your administrator.');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw ApiError.unauthorized('Invalid email or password');

  if (!user.isVerified) {
    await issueAndSendOtp(user);
    throw ApiError.forbidden('Email not verified. A new OTP has been sent to your email — please verify before logging in.');
  }

  const token = generateToken({ id: user._id, role: user.role });
  const loginUrl = `${process.env.CLIENT_URL}/login`;

  return { token, user, loginUrl };
};

/**
 * Verify a pending account's OTP — marks it verified and logs it in
 */
const verifyOtp = async ({ email, otp }) => {
  const user = await User.findOne({ email }).select('+otp +otpExpiry');
  if (!user) throw ApiError.notFound('User not found');
  if (user.isVerified) throw ApiError.conflict('Account is already verified');

  const isMatch = await user.compareOtp(otp);
  if (!isMatch) throw ApiError.badRequest('Invalid or expired OTP');

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  const token = generateToken({ id: user._id, role: user.role });
  const loginUrl = `${process.env.CLIENT_URL}/login`;

  return { token, user, loginUrl };
};

/**
 * Re-issue and resend an OTP for a not-yet-verified account
 */
const resendOtp = async ({ email }) => {
  const user = await User.findOne({ email });
  if (!user) throw ApiError.notFound('User not found');
  if (user.isVerified) throw ApiError.conflict('Account is already verified');

  await issueAndSendOtp(user);
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw ApiError.notFound('User not found');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw ApiError.badRequest('Current password is incorrect');

  user.password = newPassword;
  await user.save();
};

/**
 * One-time setup — only runs if no SUPER_ADMIN exists in the system
 */
const setupSuperAdmin = async (data) => {
  const existing = await User.findOne({ role: ROLES.SUPER_ADMIN });
  if (existing) throw ApiError.conflict('Super Admin already exists. This setup route is disabled.');

  const superAdmin = await User.create({ ...data, role: ROLES.SUPER_ADMIN });
  await issueAndSendOtp(superAdmin);

  const loginUrl = `${process.env.CLIENT_URL}/login`;
  return { user: superAdmin, loginUrl };
};

/**
 * SUPER_ADMIN creates an ADMIN — role is forced, not accepted from body
 */
const createAdmin = async (creatorId, data) => {
  const exists = await User.findOne({ email: data.email });
  if (exists) throw ApiError.conflict('Email already registered');

  const plainPassword = data.password;
  const admin = await User.create({ ...data, role: ROLES.ADMIN, createdBy: creatorId });
  const otp = await issueOtpOnly(admin);

  const loginUrl = `${process.env.CLIENT_URL}/admin/login`;
  try {
    await sendWelcomeEmail(admin.email, admin.name, plainPassword, otp, loginUrl, ROLES.ADMIN);
    logger.info(`Welcome email sent to admin: ${admin.email}`);
  } catch (emailErr) {
    logger.error(`Failed to send welcome email to admin ${admin.email}: ${emailErr.message}`);
  }

  return { user: admin, loginUrl };
};

/**
 * SUPER_ADMIN or ADMIN creates an EMPLOYEE — role is forced, not accepted from body
 */
const createEmployee = async (creatorId, data) => {
  const exists = await User.findOne({ email: data.email });
  if (exists) throw ApiError.conflict('Email already registered');

  const plainPassword = data.password;
  const employee = await User.create({ ...data, role: ROLES.EMPLOYEE, createdBy: creatorId });
  const otp = await issueOtpOnly(employee);

  const loginUrl = `${process.env.CLIENT_URL}/employee/login`;
  try {
    await sendWelcomeEmail(employee.email, employee.name, plainPassword, otp, loginUrl, ROLES.EMPLOYEE);
    logger.info(`Welcome email sent to employee: ${employee.email}`);
  } catch (emailErr) {
    logger.error(`Failed to send welcome email to employee ${employee.email}: ${emailErr.message}`);
  }

  return { user: employee, loginUrl };
};

module.exports = {
  login,
  changePassword,
  setupSuperAdmin,
  createAdmin,
  createEmployee,
  verifyOtp,
  resendOtp,
};
