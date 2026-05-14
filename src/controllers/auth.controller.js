const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

const login = asyncHandler(async (req, res) => {
  const { token, user, loginUrl } = await authService.login(req.body);
  sendSuccess(res, 'Login successful', { token, user, loginUrl });
});

const logout = asyncHandler(async (req, res) => {
  // JWT is stateless; client discards token
  sendSuccess(res, 'Logged out successfully');
});

const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, 'Current user fetched', req.user);
});

const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user._id, req.body);
  sendSuccess(res, 'Password changed successfully');
});

const setupSuperAdmin = asyncHandler(async (req, res) => {
  const { token, user, loginUrl } = await authService.setupSuperAdmin(req.body);
  sendSuccess(res, 'Super Admin created successfully', { token, user, loginUrl }, 201);
});

const createAdmin = asyncHandler(async (req, res) => {
  const { user, loginUrl } = await authService.createAdmin(req.user._id, req.body);
  sendSuccess(res, 'Admin created successfully', { user, loginUrl }, 201);
});

const createEmployee = asyncHandler(async (req, res) => {
  const { user, loginUrl } = await authService.createEmployee(req.user._id, req.body);
  sendSuccess(res, 'Employee created successfully', { user, loginUrl }, 201);
});

module.exports = { login, logout, getMe, changePassword, setupSuperAdmin, createAdmin, createEmployee };
