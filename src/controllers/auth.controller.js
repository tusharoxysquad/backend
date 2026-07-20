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
  const { user, loginUrl } = await authService.setupSuperAdmin(req.body);
  sendSuccess(res, 'Super Admin created. An OTP has been sent to the email — verify it before logging in.', { user, loginUrl }, 201);
});

const createAdmin = asyncHandler(async (req, res) => {
  const { user, loginUrl, emailSent } = await authService.createAdmin(req.user._id, req.body);
  const message = emailSent
    ? 'Admin created. An OTP has been sent to the email — verify it before logging in.'
    : 'Admin created, but the welcome email failed to send. Please share the login details manually or reset the password.';
  sendSuccess(res, message, { user, loginUrl, emailSent }, 201);
});

const createEmployee = asyncHandler(async (req, res) => {
  const { user, loginUrl, emailSent } = await authService.createEmployee(req.user._id, req.body);
  const message = emailSent
    ? 'Employee created. An OTP has been sent to the email — verify it before logging in.'
    : 'Employee created, but the welcome email failed to send. Please share the login details manually or reset the password.';
  sendSuccess(res, message, { user, loginUrl, emailSent }, 201);
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { token, user, loginUrl } = await authService.verifyOtp(req.body);
  sendSuccess(res, 'Email verified successfully', { token, user, loginUrl });
});

const resendOtp = asyncHandler(async (req, res) => {
  await authService.resendOtp(req.body);
  sendSuccess(res, 'OTP resent successfully');
});

module.exports = {
  login,
  logout,
  getMe,
  changePassword,
  setupSuperAdmin,
  createAdmin,
  createEmployee,
  verifyOtp,
  resendOtp,
};
