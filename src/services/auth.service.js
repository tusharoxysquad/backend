const User = require('../models/User');
const { generateToken } = require('../config/jwt');
const ApiError = require('../utils/apiError');
const { ROLES } = require('../constants');

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw ApiError.unauthorized('Invalid email or password');
  if (!user.isActive) throw ApiError.unauthorized('Account is deactivated. Contact your administrator.');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw ApiError.unauthorized('Invalid email or password');

  const token = generateToken({ id: user._id, role: user.role });
  const loginUrl = `${process.env.CLIENT_URL}/login`;

  return { token, user, loginUrl };
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

  const token = generateToken({ id: superAdmin._id, role: superAdmin.role });
  const loginUrl = `${process.env.CLIENT_URL}/login`;

  return { token, user: superAdmin, loginUrl };
};

/**
 * SUPER_ADMIN creates an ADMIN — role is forced, not accepted from body
 */
const createAdmin = async (creatorId, data) => {
  const exists = await User.findOne({ email: data.email });
  if (exists) throw ApiError.conflict('Email already registered');

  const admin = await User.create({ ...data, role: ROLES.ADMIN, createdBy: creatorId });

  const loginUrl = `${process.env.CLIENT_URL}/login`;
  return { user: admin, loginUrl };
};

/**
 * SUPER_ADMIN or ADMIN creates an EMPLOYEE — role is forced, not accepted from body
 */
const createEmployee = async (creatorId, data) => {
  const exists = await User.findOne({ email: data.email });
  if (exists) throw ApiError.conflict('Email already registered');

  const employee = await User.create({ ...data, role: ROLES.EMPLOYEE, createdBy: creatorId });

  const loginUrl = `${process.env.CLIENT_URL}/login`;
  return { user: employee, loginUrl };
};

module.exports = { login, changePassword, setupSuperAdmin, createAdmin, createEmployee };
