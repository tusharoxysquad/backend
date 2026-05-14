const userService = require('../services/user.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendPaginated } = require('../utils/response');
const { ROLES } = require('../constants');

const createAdmin = asyncHandler(async (req, res) => {
  const { user, loginUrl } = await userService.createUser(req.user._id, {
    ...req.body,
    role: ROLES.ADMIN,
  });
  sendSuccess(res, 'Admin created successfully', { user, loginUrl }, 201);
});

const createEmployee = asyncHandler(async (req, res) => {
  const { user, loginUrl } = await userService.createUser(req.user._id, {
    ...req.body,
    role: ROLES.EMPLOYEE,
  });
  sendSuccess(res, 'Employee created successfully', { user, loginUrl }, 201);
});

const getAdmins = asyncHandler(async (req, res) => {
  const { users, pagination } = await userService.getAllByRole(ROLES.ADMIN, req.query);
  sendPaginated(res, 'Admins fetched', users, pagination);
});

const getEmployees = asyncHandler(async (req, res) => {
  const { users, pagination } = await userService.getAllByRole(ROLES.EMPLOYEE, req.query);
  sendPaginated(res, 'Employees fetched', users, pagination);
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  sendSuccess(res, 'User fetched', user);
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  sendSuccess(res, 'User updated successfully', user);
});

const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);
  sendSuccess(res, 'User deleted successfully');
});

const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await userService.toggleUserStatus(req.params.id);
  sendSuccess(res, `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, user);
});

const resetPassword = asyncHandler(async (req, res) => {
  await userService.resetPassword(req.params.id, req.body.newPassword);
  sendSuccess(res, 'Password reset successfully');
});

module.exports = {
  createAdmin,
  createEmployee,
  getAdmins,
  getEmployees,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
  resetPassword,
};
