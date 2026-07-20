const User = require('../models/User');
const ApiError = require('../utils/apiError');
const { ROLES, APP_URLS } = require('../constants');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { issueOtpOnly } = require('../helpers/otp.helper');
const { sendWelcomeEmail } = require('../helpers/email.helper');
const logger = require('../utils/logger');

const createUser = async (creatorId, userData) => {
  const exists = await User.findOne({ email: userData.email });
  if (exists) throw ApiError.conflict('Email already registered');

  const plainPassword = userData.password;
  const user = await User.create({ ...userData, createdBy: creatorId });
  const otp = await issueOtpOnly(user);

  const loginUrl = user.role === ROLES.ADMIN ? APP_URLS.ADMIN_LOGIN : APP_URLS.EMPLOYEE_LOGIN;

  let emailSent = true;
  try {
    await sendWelcomeEmail(user.email, user.name, plainPassword, otp, loginUrl, user.role);
    logger.info(`Welcome email sent to ${user.role}: ${user.email}`);
  } catch (err) {
    emailSent = false;
    logger.error(`Failed to send welcome email to ${user.role} ${user.email}: ${err.message}`);
  }

  return { user, loginUrl, emailSent };
};

const getAllByRole = async (role, query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = { role };

  if (query.department) filter.department = new RegExp(query.department, 'i');
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
  if (query.search) filter.name = new RegExp(query.search, 'i');

  const [users, total] = await Promise.all([
    User.find(filter)
      .populate('reportingAdmin', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return { users, pagination: buildPaginationMeta(total, page, limit) };
};

const getUserById = async (id) => {
  const user = await User.findById(id).populate('reportingAdmin', 'name email').populate('createdBy', 'name email');
  if (!user) throw ApiError.notFound('User not found');
  return user;
};

const updateUser = async (id, updates) => {
  const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!user) throw ApiError.notFound('User not found');
  return user;
};

const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw ApiError.notFound('User not found');
};

const toggleUserStatus = async (id) => {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User not found');
  user.isActive = !user.isActive;
  await user.save();
  return user;
};

const resetPassword = async (id, newPassword) => {
  const user = await User.findById(id).select('+password');
  if (!user) throw ApiError.notFound('User not found');
  user.password = newPassword;
  await user.save();
};

const getTeamEmployees = async (adminId, query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = { reportingAdmin: adminId, role: ROLES.EMPLOYEE };

  if (query.search) filter.name = new RegExp(query.search, 'i');
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';

  const [users, total] = await Promise.all([
    User.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return { users, pagination: buildPaginationMeta(total, page, limit) };
};

module.exports = {
  createUser,
  getAllByRole,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
  resetPassword,
  getTeamEmployees,
};
